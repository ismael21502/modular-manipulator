import numpy as np

# def fk_2dof(q, l1=1.0, l2=1.0):
#     """
#     Forward kinematics for a planar 2DOF robot.
#     Returns [x, y, phi]
#     """
#     theta1, theta2 = q

#     x = l1 * np.cos(theta1) + l2 * np.cos(theta1 + theta2)
#     y = l1 * np.sin(theta1) + l2 * np.sin(theta1 + theta2)
#     phi = theta1 + theta2

#     return np.array([x, y, phi])

# def jacobian_2dof(q, l1=1.0, l2=1.0):
#     theta1, theta2 = q

#     s1 = np.sin(theta1)
#     c1 = np.cos(theta1)
#     s12 = np.sin(theta1 + theta2)
#     c12 = np.cos(theta1 + theta2)

#     J = np.array([
#         [-l1 * s1 - l2 * s12, -l2 * s12],
#         [ l1 * c1 + l2 * c12,  l2 * c12],
#         [ 1.0,               1.0]
#     ])

#     return J

# def ik_2dof(
#     q_init,
#     target_pose,
#     l1=1.0,
#     l2=1.0,
#     max_iters=100,
#     tol=1e-4,
#     damping=0.01
# ):
#     """
#     Iterative IK solver (Damped Least Squares) for planar 2DOF robot.

#     q_init: initial joint guess [theta1, theta2]
#     target_pose: desired [x, y, phi]
#     Returns: joint angles [theta1, theta2]
#     """

#     q = np.array(q_init, dtype=float)

#     for i in range(max_iters):
#         current_pose = fk_2dof(q, l1, l2)
#         error = target_pose - current_pose

#         # Normalize orientation error to [-pi, pi]
#         error[2] = np.arctan2(np.sin(error[2]), np.cos(error[2]))

#         if np.linalg.norm(error) < tol:
#             print(f"Converged in {i} iterations")
#             return q

#         J = jacobian_2dof(q, l1, l2)

#         JJt = J @ J.T
#         damping_matrix = damping**2 * np.eye(3)

#         dq = J.T @ np.linalg.inv(JJt + damping_matrix) @ error
#         q += dq

#     print("IK did not converge")
#     return q
# if __name__ == "__main__":
#     q0 = [0.0, 0.0]

#     target = np.array([
#         0.5,    # x
#         0.5,    # y
#         np.pi / 4  # orientation
#     ])

#     q_solution = ik_2dof(q0, target)
#     print("Solution:", q_solution)
#     print("FK check:", fk_2dof(q_solution))

# def GeneralIK(symbolicFK, currentJoints, targetValues):
#     print("FKFUNC: ",symbolicFK)
#     print("TV: ",targetValues)
#     return DLS(symbolicFK, currentJoints, targetValues)
#     # getNumJacobian(symbolicFK, currentJoints)

def getNumJacobian(symbolicFK, q, eps=1e-6):
    q = np.array(q, dtype=float)
    n = len(q)

    T0 = np.array(symbolicFK(*q), dtype=float)
    x0 = T0[:3, 3]

    J = np.zeros((3, n))

    for i in range(n):
        q_eps = q.copy()
        q_eps[i] += eps

        Ti = np.array(symbolicFK(*q_eps), dtype=float)
        xi = Ti[:3, 3]

        J[:, i] = (xi - x0) / eps

    return J

def clamp(min, max, value):
    return max if value > max else min if value < min else value

def GeneralIK(symbolicFK, q, xd, damping=0.08, maxIters=100, tol=1e-4, alpha=0.15):
    q = np.array(q, dtype=float)
    xd = np.array(xd, dtype=float)
    for i in range(maxIters):
        T = np.array(symbolicFK(*q), dtype=float)
        x = T[:3, 3]
        error = xd - x
        err_norm = np.linalg.norm(error)
        # print(f"Iter {i}: |x| = {x}")
        if err_norm < tol:
            # print(f"Converged in {i} iterations")
            return [clamp(-np.pi, np.pi, val) for val in q]
        J = getNumJacobian(symbolicFK, q)
        JJt = J @ J.T
        damping_matrix = (damping ** 2) * np.eye(3)
        dq = J.T @ np.linalg.solve(JJt + damping_matrix, error)
        q += alpha * dq
    print("No converge, q:", q)
    return [clamp(-np.pi, np.pi, val) for val in q]
