class RobotState:
    def __init__(self):
        self.last_joints = [0, 0, 0, 0] #I will remove last_joints later
        self.symbolicFK = None
        self.robot_config = {}

    def setConfig(self, config, symbolicFK):
        self.robot_config = config
        self.symbolicFK = symbolicFK

    def setJoints(self, joints):
        self.last_joints = joints

    def getJoints(self):
        return self.last_joints
