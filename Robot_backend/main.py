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
from GeneralFK import GeneralFK
import numpy as np

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
    try:
        file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "robotConfig.json")
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            robotConfig = data
            # print(GeneralFK_symbolic(robotConfig['joints'], [0,0,-90,0]))
        return data
    except Exception as e:
        print("Error leyendo robotConfig.json:", e)
        return {}
    
async def process_gui_command(ws: WebSocket, data: dict):
    if data.get("type") == "cartesian_move":
        ik_values = await calculate_ik(data.get("values"))
        await send_log(ws, "state", "JOINTS", ik_values)
    elif data.get("type") == "articular_move":
        fk_values = await calculate_fk(data.get("values"))
        await send_log(ws, "state", "COORDS", fk_values)
        # print(fk_values)
        

async def calculate_ik(cartesian_values: list[int]):
    x, y, z, _, _, _ = cartesian_values
    x /= 1000
    y /= 1000
    z /= 1000 
    values = Inverse_Kinematics(x,y,z)
    result = values
    return result 

async def calculate_fk(articular_values: list[int]):
    joints = robotConfig['joints']
    endEffectors = robotConfig['end_effectors']
    print("Articular: ", articular_values)
    forwardKinematics = GeneralFK(joints, articular_values, endEffectors)
    forwardKinematics = np.round(forwardKinematics, 0).tolist()
    
    # L1 = 0.02  # altura del primer eslabón (ajusta según tu modelo)
    # L2 = 0.043
    # L3 = 0.043
    # L4 = 0.08

    # x, y, z = fk_func(
    #                 L1, L2, L3,
    #                 math.radians(articular_values[0]),
    #                 math.radians(articular_values[1]) - math.pi/2, #Offset porque zero debe ser extendido hacia arriba
    #                 math.radians(articular_values[2])
    #             )
    # return [int(x*1000),int(y*1000),int(z*1000),0,0,0]
    return forwardKinematics
@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    print(f"🟢 Cliente conectado desde {ws.client.host}")
    active_connections.append(ws)

    try:
        while True:
            msg = await ws.receive_text()
            msg = json.loads(msg)
            await process_gui_command(ws, msg)
    except Exception as e:
        print("ERROR", e)
    # while True:
    #     await asyncio.sleep(10)
    #     print("OLA")