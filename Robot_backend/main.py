from email.mime import base

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
from services.DeviceDiscovery import DeviceDiscovery
from pathlib import Path #[ ] Tal vez convenga cambiar os por pathlib para manejar todos los archivos
#[ ] Considerar sistema de logs dentro del propio backend
#[ ] Hacer que la robotConfig se cree al iniciar el backend y solo se retorne al frontend
#[ ] Tengo que mover "unit" de los json de donde están a un apartado UI

#[ ] Sacar symbolicFK de robotState
app = createApp()

active_connections = []

robotState = RobotState()
esp = ESP32Connection()

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
deviceDiscoverer = DeviceDiscovery()

asyncio.create_task(deviceDiscoverer.run())
asyncio.create_task(controller.run())

@app.get("/robot_config")
async def getRobotConfig():
    try:
        filePath = os.path.join(os.path.dirname(os.path.abspath(__file__)), "robotConfig.json")
        with open(filePath, "r", encoding="utf-8") as f:
            data = json.load(f)
            # robotConfig = data
            symbolicFK, jointSymbols = GeneralFK_sym(data['joints'], data['end_effectors'])
            robotState.setConfig(data, symbolicFK)
            print(symbolicFK, jointSymbols)
        return data
    except Exception as e:
        print("Error leyendo robotConfig.json:", e)
        return {}

#region robotBuilding
def createRobotPartsCatalog():
    bases = loadPartsFromFolder("robot_parts/bases")
    joints = loadPartsFromFolder("robot_parts/joints")
    links = loadPartsFromFolder("robot_parts/links")
    endEffectors = loadPartsFromFolder("robot_parts/end_effectors")
    return {
        "bases": [{
            "id": base["id"],
            "label": base["name"],
            "img": base["previewImage"],
            "end": base["end"],
            "mesh": base["mesh"]
        } for base in bases],
        "joints": [{
            "id": joint["id"],
            "name": joint["name"], #[ ] Cambiar label por name
            "label": joint["label"],
            "type": joint["type"],
            "img": joint["previewImage"],
            "mesh": joint["mesh"],
            "limits": joint["limits"],
            "axis": joint["axis"],
            "origin": joint["origin"]
        } for joint in joints],
        "links": [{
            "id": link["id"],
            "label": link["name"],
            "length": link["length"],
            "img": link["previewImage"],
            "mesh": link["mesh"],
            "end": link["end"] 
        } for link in links],
        "tools": [{
            "id": tool["id"],
            "label": tool["name"],
            "img": tool["previewImage"],
            "control": tool["control"],
            "mesh": tool["mesh"],
            "origin": tool["origin"]
        } for tool in endEffectors]
    }

def loadPartsFromFolder(folder):
    parts = []
    for file in Path(folder).glob("*.json"):
        with open(file, "r", encoding="utf-8") as f:
            data = json.load(f)
            parts.append(data)
    return parts

partsCatalog = createRobotPartsCatalog()
partsIndex = {part["id"]: part for category in partsCatalog.values() for part in category}

print("CATALOG: ", partsCatalog)
@app.get("/parts_catalog") 
async def getRobotPartsCatalog():
    return partsCatalog

@app.post("/build_robot")
async def buildRobot(robotParts: dict): #[ ] Pasar robot catalog como parámetro?
    base = partsIndex[robotParts["base"]]
    joints = [{**partsIndex[joint["id"]], "label": joint["label"] } for joint in robotParts["joints"]]
    links = [partsIndex[joint["link"]] for joint in robotParts["joints"]]
    endEffectors = partsIndex[robotParts["tool"]]
    # print("Base: ", base)
    # print("Joints: ", joints)
    # print("Links: ", links)
    # print("End Effector: ", endEffectors)
    # return
    # print(robotParts) 
    # return
    for joint in joints:
        print("JOINT: ", joint["limits"])
    
    links = [{
      "id": f"link_{i+1}",
      "length": link["length"], 
      "mesh": link["mesh"],
      "end": link["end"],
      "color": "#FFF"
    } for i, link in enumerate(links)]
    links.insert(0, {
        "id": "base",
        "length": 0,
        "mesh": base["mesh"],
        "end": base["end"],
        "color": "#FFF"
    })
    joints = [{
        "id": f"j{i+1}",
        "name": joint["name"],
        "label": joint["label"],
        "type": joint["type"],
        "min": joint["limits"]["min"],
        "max": joint["limits"]["max"],
        "default": joint["limits"]["default"],
        "unit": "deg", #[ ] Revisar si ponerlo fijo o no
        "parent": links[i]["id"],
        "child": links[i+1]["id"],
        "axis": joint["axis"],
        "origin": links[i]["end"]
    } for i, joint in enumerate(joints)]
    
    # #Ahora solo podré usar 1 endEffector.
    endEffectors = [{
        "id": endEffectors["id"],
        "label": "Gripper",
        "type": "revolute",
        "min": endEffectors["control"]["min"],
        "max": endEffectors["control"]["max"],
        "default": endEffectors["control"]["default"],
        "unit": "%", #[ ] Revisar si dejarlo fijo o no
        "parent": links[len(links)-1]["id"],
        "origin": endEffectors["origin"],
        "mesh": endEffectors["mesh"] 
    }]

    newRobotConfig = {
        "id": generateID(),
        "name": robotParts["name"],
        "links": links,
        "joints": joints,
        "end_effectors": endEffectors,
        "cartesian": robotParts["cartesian"] #Aquí va la configuración cartesiana, la tomaré de frontend tal vez
    }
    # saveRobotConfig(newRobotConfig)
    print("Nueva robot config: ", newRobotConfig)
 
def generateID(): #[ ] Revisar esta función, no es muy robusta pero por ahora sirve
    return int(datetime.now().timestamp() * 1000)

def saveRobotConfig(config):
    filePath = os.path.join(os.path.dirname(os.path.abspath(__file__)), "newRobotConfig.json")
    with open(filePath, "w", encoding="utf-8") as f:
        json.dump(config, f, indent=4)
# print("CATALOG: ", createRobotPartsCatalog())
#endregion

@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    
    print(f"🟢 Cliente conectado desde {ws.client.host}")
    active_connections.append(ws)
    try:
        async def notifier(payload):
            await sendLog(ws, payload)
        controller.addNotifier(notifier)
        deviceDiscoverer.addNotifier(notifier)
        await deviceDiscoverer.notifyCurrent(notifier)
        await notifier({
                "event": "HARDWARE_STATE",
                "payload": {
                    "connected": esp.isConnected()
                },
                "meta": {
                    "severity": "info",
                    "userVisible": False
                },
            })
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
        deviceDiscoverer.removeNotifier(notifier)
        print(f"🔴 Cliente desconectado desde {ws.client.host}")