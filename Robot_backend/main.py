from fastapi import FastAPI, WebSocket
import json
from datetime import datetime
import asyncio
# from fastapi.middleware.cors import CORSMiddleware # type: ignore
import os
from kinematics.GeneralFK import GeneralFK, GeneralFK_sym
from kinematics.GeneralIK import GeneralIK
import numpy as np
from services.ESP32Connection import ESP32Connection
from utils.mapValues import mapVal
# from api.positions import router as positionsRouter
# from api.sequences import router as sequencesRouter
from services.robot_state import RobotState
from utils.appfactory import createApp
app = createApp()

active_connections = []
esp32_socket: WebSocket | None = None

robot_state = RobotState()

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
    
@app.get("/robot_config")
async def get_robot_config():
    try:
        file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "robotConfig.json")
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            # robotConfig = data
            symbolicFK, jointSymbols = GeneralFK_sym(data['joints'], data['end_effectors'])
            robot_state.setConfig(data, symbolicFK)
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
        
# async def calculateIK(cartesian_values: list[int]):
#     x, y, z, _, _, _ = cartesian_values
#     result = GeneralIK(robot_state.symbolicFK, np.radians(robot_state.getJoints()).tolist(), [x,y,z])
#     result = np.round(np.degrees(result),0).tolist()
#     robot_state.setJoints(result)
#     return result 

async def calculate_fk(articular_values: list[int]):
    robot_state.setJoints(articular_values)
    forwardKinematics = GeneralFK([np.radians(value) for value in articular_values], robot_state.symbolicFK)
    forwardKinematics = np.round(forwardKinematics, 0).tolist()
    return forwardKinematics

async def request_ik(ws: WebSocket, cartesian_values):
    global latest_ik_request, ik_task_running
    async with ik_lock:
        latest_ik_request = cartesian_values
        if not ik_task_running:
            asyncio.create_task(ik_worker(ws))
            
async def ik_worker(ws: WebSocket):
    global ik_task_running, latest_ik_request
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
            robot_state.symbolicFK,
            np.radians(robot_state.getJoints()).tolist(),
            [x, y, z]
        )
        result = np.round(np.degrees(result), 0).tolist()
        robot_state.setJoints(result)
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