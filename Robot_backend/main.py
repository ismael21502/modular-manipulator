from fastapi import FastAPI, WebSocket # type: ignore
import json
from datetime import datetime
import asyncio
import math
from fastapi.middleware.cors import CORSMiddleware # type: ignore
import os
import time
from InverseKinematics import Inverse_Kinematics
from ForwardKinematics import fk_func
from GeneralFK import GeneralFK, GeneralFK_sym
from GeneralIK import GeneralIK
import numpy as np
from ESP32Connection import ESP32Connection
from utils.mapValues import mapVal
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*", "http://localhost:5173", "http://localhost"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

active_connections = []
esp32_socket: WebSocket | None = None
robotConfig = {}
symbolicFK = None
lastJoints = [0,0,0,0]

ik_task_running = False
latest_ik_request = None
ik_lock = asyncio.Lock()

esp = ESP32Connection("COM5")

async def send_log(ws: WebSocket, catergory_, type_: str, message: str):
    """Envía un log con timestamp al cliente."""
    try:
        await ws.send_json({
            "category": catergory_,
            "type": type_,
            "values": message,
            "time": datetime.now().isoformat()
        })
    except Exception as e:
        print(f"⚠️ No se pudo enviar log: {e}")

@app.post("/savePos")
async def save_pos(newData: dict):
    try:
        with open("positions.json", "r") as f:
            data = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        data = []
    existingIndex = next((i for i, item in enumerate(data) if item['name'] == newData['name']),None) #Ya existe
    #Preguntar al usuario si quiere actualizar la posición guardada
    if existingIndex:
        return
    data.append(newData)
    with open("positions.json", "w") as f:
        json.dump(data, f, indent=2)

    return {"status": "ok"}

@app.get("/sequences")
async def get_sequences():
    import os, json
    try:
        file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "sequences.json")
        with open(file_path, "r") as f:
            data = json.load(f)
        return data
    except Exception as e:
        print("Error leyendo positions.json:", e)
        return []
@app.post("/saveSeq")
async def save_seq(newData: dict):
    try:
        with open("sequences.json", "r") as f:
            data = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        data = []
    existingIndex = next((i for i, item in enumerate(data) if item['name'] == newData['name']),None) #Ya existe
    #Preguntar al usuario si quiere actualizar la posición guardada
    if existingIndex:
        return
    data.append(newData)
    with open("sequences.json", "w") as f:
        json.dump(data, f, indent=2)
    return {"status": "ok"}

@app.post("/updateSeq")
async def update_sequence(sequence: dict):
    try:
        with open("sequences.json", "r") as f:
            data = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        data = []
    for item in data:
        if item['name'] == sequence['oldName']:
            item['name'] = sequence['name']
            item['updated_at'] = datetime.now().isoformat()
            item['steps'] = sequence['steps']
            with open("sequences.json", "w") as f:
                json.dump(data, f, indent=2)

            return {'status': 'ok', 'message': f"Secuencia '{item['name']}' actualizada"}
    return {"status": "not_found", "message": f"No se encontró '{item['name']}'."}

@app.post("/deleteSeq")
async def delete_sequence(item: dict):
    try:
        with open("sequences.json", "r") as f:
            data = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        data = []
    if "name" not in item:
        return {"status": "error", "message": "Falta el campo 'name'."}
    original_length = len(data)
    data = [seq for seq in data if seq["name"] != item["name"]]

    if len(data) < original_length:
        with open("sequences.json", "w") as f:
            json.dump(data, f, indent=2)
        return {"status": "ok", "message": f"Secuencia '{item['name']}' eliminada."}
    else:
        return {"status": "not_found", "message": f"No se encontró '{item['name']}'."}
    
@app.post("/updatePos")
async def update_position(position: dict):
    try:
        with open("positions.json", "r") as f:
            data = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        data = []
    for item in data:
        if item['name'] == position['oldName']:
            item['name'] = position['name']
            item['values'] = position['values']
            item['endEffectorValues'] = position['endEffectorValues']
            with open("positions.json", "w") as f:
                json.dump(data, f, indent=2)
            return {'status': 'ok', 'message': f"Posición '{item['name']}' actualizada"}
    return {"status": "not_found", "message": f"No se encontró '{item['name']}'."}
   
@app.post("/delete")
async def delete_position(item: dict):
    try:
        with open("positions.json", "r") as f:
            data = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        data = []
    if "name" not in item:
        return {"status": "error", "message": "Falta el campo 'name'."}
    original_length = len(data)
    data = [pos for pos in data if pos["name"] != item["name"]]
    if len(data) < original_length:
        with open("positions.json", "w") as f:
            json.dump(data, f, indent=2)
        return {"status": "ok", "message": f"Posición '{item['name']}' eliminada."}
    else:
        return {"status": "not_found", "message": f"No se encontró '{item['name']}'."}

@app.get("/positions")
async def get_positions():
    import os, json
    try:
        file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "positions.json")
        with open(file_path, "r") as f:
            data = json.load(f)
        return data
    except Exception as e:
        print("Error leyendo positions.json:", e)
        return []
    
@app.get("/robot_config")
async def get_robot_config():
    global robotConfig
    global symbolicFK
    try:
        file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "robotConfig.json")
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            robotConfig = data
            symbolicFK, jointSymbols = GeneralFK_sym(robotConfig['joints'], robotConfig['end_effectors'])
            print(symbolicFK, jointSymbols)
        return data
    except Exception as e:
        print("Error leyendo robotConfig.json:", e)
        return {}
    
async def process_gui_command(ws: WebSocket, esp: ESP32Connection, data: dict):
    if data.get("type") == "cartesian_move":
        await request_ik(ws, data.get("values"))
    elif data.get("type") == "articular_move":
        joints = data.get("values")
        fk_values = await calculate_fk(joints)
        try:
            await asyncio.to_thread(
                esp.send,{
                    "type": "move_joints",
                    "values": [joint+90 for joint in joints]
                }
            )
        except Exception as e:
            pass
        await send_log(ws, "state", "COORDS", fk_values)
    elif data.get("type") == "end_effectors_move":
        endEffectors = data.get("values")
        try:
            await asyncio.to_thread(
                esp.send,{
                    "type": "move_end_effector",
                    "values": [mapVal(ee, 0, 100, 0, 180) for ee in endEffectors]
                }
            )
        except Exception as e:
            pass
        
async def calculate_ik(cartesian_values: list[int]):
    global lastJoints
    x, y, z, _, _, _ = cartesian_values
    result = GeneralIK(symbolicFK, np.radians(lastJoints).tolist(), [x,y,z])
    result = np.round(np.degrees(result),0).tolist()
    lastJoints = result
    return result 

async def calculate_fk(articular_values: list[int]):
    global lastJoints
    lastJoints = articular_values
    forwardKinematics = GeneralFK([np.radians(value) for value in articular_values], symbolicFK)
    forwardKinematics = np.round(forwardKinematics, 0).tolist()
    return forwardKinematics

async def request_ik(ws: WebSocket, cartesian_values):
    global latest_ik_request, ik_task_running
    async with ik_lock:
        latest_ik_request = cartesian_values
        if not ik_task_running:
            asyncio.create_task(ik_worker(ws))
async def ik_worker(ws: WebSocket):
    global ik_task_running, latest_ik_request, lastJoints
    while True:
        async with ik_lock:
            if latest_ik_request is None:
                ik_task_running = False
                return
            cartesian = latest_ik_request
            latest_ik_request = None
            ik_task_running = True
        x, y, z, _, _, _ = cartesian
        result = GeneralIK(
            symbolicFK,
            np.radians(lastJoints).tolist(),
            [x, y, z]
        )
        result = np.round(np.degrees(result), 0).tolist()
        lastJoints = result
        try:
            await asyncio.to_thread(
                esp.send,{
                    "type": "move_joints",
                    "values": [joint+90 for joint in result]
                }
            )
        except Exception as e:
            pass
        await send_log(ws, "state", "JOINTS", result)

@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    print(f"🟢 Cliente conectado desde {ws.client.host}")
    active_connections.append(ws)
    try:
        esp.connect()
    except Exception as e:
        await send_log(ws, "log", "ERROR", f"Error conectando ESP32: {e}")
    try:
        while True:
            msg = await ws.receive_text()
            msg = json.loads(msg)
            await process_gui_command(ws, esp, msg)
    except Exception as e:
        print("ERROR", e)