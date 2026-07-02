# Robot Controller

Coordinates robot commands between the frontend, the backend, and the hardware driver.

---

## Responsibilities

- Process frontend commands.
- Select between Cartesian and joint control.
- Request IK solutions.
- Execute FK calculations.
- Update the robot state.
- Send commands to the hardware.
- Broadcast state updates.