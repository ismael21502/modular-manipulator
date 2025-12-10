import sympy as sp
from sympy import lambdify
def MatrixFromDH(theta, alfa, a, d):
    matrix = sp.Matrix([
        [sp.cos(theta), -sp.sin(theta) * sp.cos(alfa), sp.sin(theta) * sp.sin(alfa), a * sp.cos(theta)],
        [sp.sin(theta), sp.cos(theta) * sp.cos(alfa), -sp.cos(theta) * sp.sin(alfa), a * sp.sin(theta)],
        [0, sp.sin(alfa), sp.cos(alfa), d],
        [0, 0, 0, 1]
    ])
    return matrix

theta1, L1 = sp.symbols('theta_1 L_1')
theta2, L2 = sp.symbols('theta_2 L_2')
theta3, L3 = sp.symbols('theta_3 L_3')
T01 = MatrixFromDH(theta1, -sp.pi/2, 0, L1)
T12 = MatrixFromDH(theta2, 0, L2, 0)
T23 = MatrixFromDH(theta3, 0, L3, 0)

T02 = T01*T12
T03 = T02*T23

fk_func = lambdify(
    (L1, L2, L3, theta1, theta2, theta3),
    [T03[0, 3], T03[1, 3], T03[2, 3]],
    "numpy"
)
