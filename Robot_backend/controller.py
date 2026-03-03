from enum import Enum
from services.IKService import IKService
from services.robot_state import RobotState
from services.ESP32Connection import ESP32Connection

#[ ] Debo enviar tanto joints como coords en el notify para mantener todo actualizado en la GUI, aunque no se haya movido el robot (ej: al cambiar de modo de control)
#[ ] Ver qué utilidad puedo darle a ControlMode o si es mejor eliminarlo
class ControlMode(Enum):
        CARTESIAN = "cartesian"
        ARTICULAR = "articular"

class RobotController:
    def __init__(self, robotState: RobotState, ikService: IKService, hardwareDriver: ESP32Connection, fkSolver):
        self.currentMode: ControlMode = ControlMode.CARTESIAN
        self.ikService = ikService
        self.fkSolver = fkSolver
        self.robotState = robotState
        self.hardwareDriver = hardwareDriver
        self._notifiers = []

    async def processCommand(self, command: dict):
        if command["type"] == "articular_move":
            self.currentMode = ControlMode.ARTICULAR
            joints = command["values"]

            self.robotState.setJoints(joints)
            tcp = await self.fkSolver(joints)
            # tcp = self.calculateFK(joints)
            await self.notify({
                "event": "ROBOT_STATE",
                "payload": {
                    "tcp": tcp
                }
            })
            # await self.notify({
            #     "category": "state",
            #     "type": "COORDS",
            #     "values": tcp,
            # })
        elif command["type"] == "cartesian_move":
            tcp = command["values"]
            self.currentMode = ControlMode.CARTESIAN
            await self.ikService.request_ik(tcp)
        elif command["type"] == "connectRobot":
            port = command.get("port")
            baudrate = command.get("baudrate")
            await self.connectHardware(port=port, baudrate=baudrate)
        elif command["type"] == "disconnectRobot":
            print("DESCONECTANDO...")
            await self.disconnectHardware()

    async def run(self):
        await self.connectHardware() #[ ] Esto debe vivir en processcommand, pero lo dejo aquí temporalmente para probar la conexión al hardware antes de implementar el control completo
        while True:
            joints = await self.ikService.solutionQueue.get()
            self.robotState.setJoints(joints)
            await self.notify({
                "event": "ROBOT_STATE",
                "payload": {
                    "joints": joints
                }
            })
            
    
    def addNotifier(self, notifier):
        self._notifiers.append(notifier)

    async def notify(self, message):
        for notifier in list(self._notifiers):
            try:
                await notifier(message)
            except:
                self._notifiers.remove(notifier)
    
    def removeNotifier(self, notifier):
        self._notifiers.remove(notifier)

    async def connectHardware(self, port=None, baudrate=None):
        try:
            self.hardwareDriver.connect(port, baudrate)
            await self.notify({
                "event": "HARDWARE_STATE",
                "payload": {
                    "connected": True
                },
                "meta": {
                    "severity": "info",
                    "userVisible": True
                },
                "message": f"Conexión establecida con el hardware", #O robot
            })
        except Exception as e:
            await self.notify({
                "event": "HARDWARE_STATE",
                "payload": {
                    "connected": False
                },
                "meta": {
                    "severity": "error",
                    "userVisible": True
                },
                "message": f"Error conectando ESP32: {e}", #[ ] Hacer un error message handler o algo así
            })

    async def disconnectHardware(self):
        try:
            self.hardwareDriver.disconnect()
            await self.notify({
                "event": "HARDWARE_STATE",
                "payload": {
                    "connected": False
                },
                "meta": {
                    "severity": "info",
                    "userVisible": True
                },
                "message": f"Desconectado del hardware", #O robot
            })
        except Exception as e:
            print("Error while disconnecting: ", e)

    def stop(self):
        # Code to stop the robot
        pass
