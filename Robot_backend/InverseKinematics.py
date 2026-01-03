import math
import numpy as np

def Inverse_Kinematics(x, y, z):
    L1 = 0.02  # altura del primer eslabón (ajusta según tu modelo)
    L2 = 0.043
    L3 = 0.043
    L4 = 0.1
    angle_effector = math.radians(90)
    effector_dir = np.array([0, math.cos(angle_effector), math.sin(angle_effector)])
    x,y,z= [x,y,z] - L4*effector_dir
    theta1 = math.atan2(y, x)

    r = math.sqrt(x**2 + y**2)
    s = z - L1

    D = (r**2 + s**2 - L2**2 - L3**2) / (2 * L2 * L3)
    D = max(min(D, 1), -1)
    theta3 = math.atan2(math.sqrt(1 - D**2), D)*-1 #multiplicar por -1 si el codo está abajo

    theta2 = math.atan2(s, r) - math.atan2(L3 * math.sin(theta3), L2 + L3 * math.cos(theta3))

    dx, dy, dz = effector_dir
    # print(dx,dy,dz)
    # print(x,y,z)
    phi = math.atan2(dz, dy)  # ajusta ejes según tu modelo
    theta4 = phi - ( theta2 + theta3)
    theta1 = round(math.degrees(theta1))
    theta2 = round(math.degrees(theta2))-90
    theta3 = round(math.degrees(theta3))
    theta4 = round(math.degrees(theta4))
    return [theta1, theta2, theta3, theta4]