import numpy as np
import sympy as sp

def rotX(theta):
    return sp.Matrix([
        [1, 0, 0],
        [0, sp.cos(theta), -sp.sin(theta)],
        [0, sp.sin(theta),  sp.cos(theta)]
    ])

def rotY(theta):
    return sp.Matrix([
        [ sp.cos(theta), 0, sp.sin(theta)],
        [ 0,             1, 0           ],
        [-sp.sin(theta), 0, sp.cos(theta)]
    ])

def rotZ(theta):
    return sp.Matrix([
        [sp.cos(theta), -sp.sin(theta), 0],
        [sp.sin(theta),  sp.cos(theta), 0],
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
    rx, ry, rz = rotation  # ya en radianes

    R = rotZ(rz) * rotY(ry) * rotX(rx)

    T = sp.eye(4)
    T[:3, :3] = R
    T[:3, 3] = sp.Matrix([tx, ty, tz])

    return T

def jointTransform(axis, theta):
    ax, ay, az = axis

    if ax == 1:
        R = rotX(theta)
    elif ay == 1:
        R = rotY(theta)
    else:
        R = rotZ(theta)

    T = sp.eye(4)
    T[:3, :3] = R
    return T

def endEffectorTransform(endEffector):
    return originTransform(
        endEffector["origin"]["translation"],
        endEffector["origin"]["rotation"]
    )


def GeneralFK_sym(joints, end_effectors=None):
    T = sp.eye(4)
    jointSymbols = ''
    for i in range(len(joints)):
        jointSymbols += f'theta{i}, '

    jointSymbols = sp.symbols(jointSymbols)
    for joint, theta in zip(joints, jointSymbols):
        T_origin = originTransform(
            joint["origin"]["translation"],
            joint["origin"]["rotation"]
        )

        T_motion = jointTransform(joint["axis"], theta)

        T = T * T_origin * T_motion

    if end_effectors: #[ ] Check if I can manage more than one ee
        endEffector = end_effectors[0]
        T = T * originTransform(
            endEffector["origin"]["translation"],
            endEffector["origin"]["rotation"]
        )

    T = sp.simplify(T)

    fk_func = sp.lambdify(
        jointSymbols,
        T,
        modules='numpy'
    )

    return fk_func, jointSymbols

def GeneralFK(joints, fk_func):
    # print("FUNCION: ", fk_func)
    T = fk_func(*joints)
    position = T[:3, 3]
    rotation = T[:3, :3]
    roll, pitch, yaw = rotationMatrixToRPY(rotation)
    return [
        float(position[0]),
        float(position[1]),
        float(position[2]),
        float(roll),
        float(pitch),
        float(yaw)
    ]