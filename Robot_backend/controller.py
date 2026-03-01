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
                "category": "state",
                "type": "COORDS",
                "values": tcp,
            })
        elif command["type"] == "cartesian_move":
            tcp = command["values"]
            self.currentMode = ControlMode.CARTESIAN
            await self.ikService.request_ik(tcp)

    async def run(self):
        await self.connect() #[ ] Esto debe vivir en processcommand, pero lo dejo aquí temporalmente para probar la conexión al hardware antes de implementar el control completo
        while True:
            joints = await self.ikService.solutionQueue.get()
            self.robotState.setJoints(joints)
            
            await self.notify({
                "category": "state",
                "type": "JOINTS",
                "values": joints,
                })
    
    def addNotifier(self, notifier):
        self._notifiers.append(notifier)

    async def notify(self, message):
        for notifier in self._notifiers:
            await notifier(message)
    
    def removeNotifier(self, notifier):
        self._notifiers.remove(notifier)

    async def connect(self):
        try:
            print("Conectando a hardware...")
            self.hardwareDriver.connect()
        except Exception as e:
            await self.notify( {
                "category": "log",
                "type": "ERROR",
                "values": f"Error conectando ESP32: {e}"
            })

    def stop(self):
        # Code to stop the robot
        pass
