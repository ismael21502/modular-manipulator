# Backend ↔ Hardware Communication

The backend communicates with the hardware by sending JSON commands.

## Command Structure

All commands follow the same general structure.

```json
{
    "type": "",
    "values": {}
}
```

| Property | Required | Type     | Description                                                             |
| -------- | -------- | -------- | ----------------------------------------------------------------------- |
| `type`   | ✅        | `string` | Identifies the command to be executed by the hardware.                  |
| `values` | ❌        | `object` | Command-specific parameters. The structure depends on the command type. |

---

## Example

```json
{
    "type": "move_joints",
    "values": [0, 45, -30, 90]
}
```

The hardware interprets the command and performs the requested action.

---

## Command Types

The following command types are currently supported:

* `move_joints`
* `move_end_effector`
