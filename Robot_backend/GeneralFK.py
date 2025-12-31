import numpy as np

def rotX(theta):
    return np.array([
        [1, 0, 0],
        [0, np.cos(theta), -np.sin(theta)],
        [0, np.sin(theta),  np.cos(theta)]
    ])

def rotY(theta):
    return np.array([
        [ np.cos(theta), 0, np.sin(theta)],
        [ 0,             1, 0           ],
        [-np.sin(theta), 0, np.cos(theta)]
    ])

def rotZ(theta):
    return np.array([
        [np.cos(theta), -np.sin(theta), 0],
        [np.sin(theta),  np.cos(theta), 0],
        [0,              0,             1]
    ])

def rotationMatrixToRPY(R):
    yaw = np.arctan2(R[1, 0], R[0, 0])

    pitch = np.arctan2(
        -R[2, 0],
        np.sqrt(R[2, 1]**2 + R[2, 2]**2)
    )

    roll = np.arctan2(R[2, 1], R[2, 2])

    return roll, pitch, yaw

def originTransform(translation, rotation):
    tx, ty, tz = translation
    rx, ry, rz = np.radians(rotation)

    Rx = rotX(rx)
    Ry = rotY(ry)
    Rz = rotZ(rz)

    R = Rz @ Ry @ Rx

    T = np.eye(4)
    T[0:3, 0:3] = R
    T[0:3, 3] = [tx, ty, tz]
    return T

def jointTransform(axis, theta):
    theta = np.radians(theta)
    ax, ay, az = axis

    if ax == 1:
        R = rotX(theta)
    elif ay == 1:
        R = rotY(theta)
    else:
        R = rotZ(theta)

    T = np.eye(4)
    T[0:3, 0:3] = R
    return T

def endEffectorTransform(endEffector):
    return originTransform(
        endEffector["origin"]["translation"],
        endEffector["origin"]["rotation"]
    )

# def GeneralFK(joints, jointValues):
#     T = np.eye(4)

#     for joint, theta in zip(joints, jointValues):
#         T_origin = originTransform(
#             joint["origin"]["translation"],
#             joint["origin"]["rotation"]
#         )

#         T_motion = jointTransform(
#             joint["axis"],
#             theta
#         )

#         T = T @ T_origin @ T_motion
        
#     pos = T[0:3, 3]
#     R = T[0:3, 0:3]
#     roll, pitch, yaw = rotationMatrixToRPY(R)
    
#     return [
#         float(pos[0]),
#         float(pos[1]),
#         float(pos[2]),
#         float(np.degrees(roll)),
#         float(np.degrees(pitch)),
#         float(np.degrees(yaw))
#     ]

def GeneralFK(joints, jointValues, end_effectors):
    T = np.eye(4)

    for joint, theta in zip(joints, jointValues):
        T_origin = originTransform(
            joint["origin"]["translation"],
            joint["origin"]["rotation"]
        )

        T_motion = jointTransform(
            joint["axis"],
            theta
        )

        T = T @ T_origin @ T_motion

    if end_effectors:
        endEffector = end_effectors[0] #[ ] Check if I can manage more end effectors
        T = T @ originTransform(
            endEffector["origin"]["translation"],
            endEffector["origin"]["rotation"]
        )

    pos = T[0:3, 3]

    R = T[0:3, 0:3]
    roll, pitch, yaw = rotationMatrixToRPY(R)

    return [
        float(pos[0]),
        float(pos[1]),
        float(pos[2]),
        float(np.degrees(roll)),
        float(np.degrees(pitch)),
        float(np.degrees(yaw))
    ]
