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
from controller import RobotController
from services.IKService import IKService

#[ ] Sacar symbolicFK de robotState
app = createApp()

active_connections = []

robotState = RobotState()
esp = ESP32Connection("COM5")

async def sendLog(ws: WebSocket, payload: dict):
    """Envía un log con timestamp al cliente."""
    try:
        await ws.send_json({
            **payload,
            "time": datetime.now().isoformat()
        })
    except Exception as e:
        print(f"No se pudo enviar log en notifier: {e}")

async def calculateFK(articularValues: list[int]):
    robotState.setJoints(articularValues)
    forwardKinematics = GeneralFK([np.radians(value) for value in articularValues], robotState.symbolicFK)
    forwardKinematics = np.round(forwardKinematics, 0).tolist()
    return forwardKinematics

ikService = IKService(robotState=robotState)
controller = RobotController(robotState=robotState, ikService=ikService, hardwareDriver=esp, fkSolver=calculateFK)
asyncio.create_task(controller.run())

@app.get("/robot_config")
async def get_robot_config():
    try:
        file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "robotConfig.json")
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            # robotConfig = data
            symbolicFK, jointSymbols = GeneralFK_sym(data['joints'], data['end_effectors'])
            robotState.setConfig(data, symbolicFK)
            print(symbolicFK, jointSymbols)
        return data
    except Exception as e:
        print("Error leyendo robotConfig.json:", e)
        return {}
    
# async def process_gui_command(ws: WebSocket, esp: ESP32Connection, data: dict):
#     if data.get("type") == "cartesian_move":
#         await request_ik(ws, data.get("values"))
#     elif data.get("type") == "articular_move":
#         joints = data.get("values")
#         fk_values = await calculate_fk(joints)
#         try:
#             await asyncio.to_thread(
#                 esp.send,{
#                     "type": "move_joints",
#                     "values": [joint+90 for joint in joints]
#                 }
#             )
#         except Exception as e:
#             pass
#         await send_log(ws, "state", "COORDS", fk_values)
#     elif data.get("type") == "end_effectors_move":
#         endEffectors = data.get("values")
#         try:
#             await asyncio.to_thread(
#                 esp.send,{
#                     "type": "move_end_effector",
#                     "values": [mapVal(ee, 0, 100, 0, 180) for ee in endEffectors]
#                 }
#             )
#         except Exception as e:
#             pass

@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    
    print(f"🟢 Cliente conectado desde {ws.client.host}")
    active_connections.append(ws)
    try:
        async def notifier(payload):
            await sendLog(ws, payload)
        controller.addNotifier(notifier)
        while True:
            msg = await ws.receive_text()
            msg = json.loads(msg)
            await controller.processCommand(msg)
            # await process_gui_command(ws, esp, msg)
    except Exception as e:
        print("ERROR", e)
    finally:
        active_connections.remove(ws)
        controller.removeNotifier(notifier)
        print(f"🔴 Cliente desconectado desde {ws.client.host}")