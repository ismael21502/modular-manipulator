import numpy as np
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

def normalizeAngle(angle):
    return (angle + np.pi) % (2 * np.pi) - np.pi

def GeneralIK(symbolicFK, q, xd, damping=0.05, maxIters=150, tol=1e-4, alpha=0.1):
    q = np.array(q, dtype=float)
    xd = np.array(xd, dtype=float)
    for i in range(maxIters):
        T = np.array(symbolicFK(*q), dtype=float)
        x = T[:3, 3]
        error = xd - x
        err_norm = np.linalg.norm(error)
        if err_norm < tol:
            return [normalizeAngle(val) for val in q]
        J = getNumJacobian(symbolicFK, q)
        JJt = J @ J.T
        damping_matrix = (damping ** 2) * np.eye(3)
        dq = J.T @ np.linalg.solve(JJt + damping_matrix, error)
        q += alpha * dq
    return [normalizeAngle(val) for val in q]
