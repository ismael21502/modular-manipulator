from kinematics.GeneralIK import GeneralIK
from services.robot_state import RobotState
import numpy as np
import asyncio
from fastapi import WebSocket
# async def calculateIK(cartesianValues: list[int]):
#     x, y, z, _, _, _ = cartesianValues
#     result = GeneralIK(robot_state.symbolicFK, np.radians(robot_state.getJoints()).tolist(), [x,y,z])
#     result = np.round(np.degrees(result),0).tolist()
#     robot_state.setJoints(result)
#     return result 

# Conceptualmente (sin código):

# requestIk(target) → void
    
# getLastSolution() → joints o None

# isBusy() → bool

# O incluso:

# getState() → { solving, joints } Yo me inclinaría más por esta, habrá que revisar
class IKService:
    def __init__(self, robotState: RobotState):
        #self.model = RobotModel()
        self.robotState = robotState
        self.lock = asyncio.Lock()
        self.latestRequest = None
        self.running = False
        self.solutionQueue = asyncio.Queue()
    
    async def request_ik(self, cartesianValues):
        async with self.lock:
            self.latestRequest = cartesianValues
            if not self.running:
                self.running = True
                asyncio.create_task(self._worker())

    async def _worker(self):
        while True:
            async with self.lock:
                if self.latestRequest is None:
                    self.running = False
                    return
                cartesian = self.latestRequest
                self.latestRequest = None
            x, y, z, _, _, _ = cartesian
            result = await asyncio.to_thread(
                GeneralIK,
                self.robotState.symbolicFK,
                np.radians(self.robotState.getJoints()).tolist(),
                [x, y, z]
            )
            result = np.round(np.degrees(result), 0).tolist()
            await self.solutionQueue.put(result)

            # try:
            #     await asyncio.to_thread(
            #         esp.send,{
            #             "type": "move_joints",
            #             "values": [joint+90 for joint in result]
            #         }
            #     )
            # except Exception as e:
            #     pass
            # await send_log(ws, "state", "JOINTS", result)