# Robot Configuration

A robot is fully defined through a JSON configuration file.

## Root Object

```json
{
  "name": "Example Robot",
  "links": [],
  "joints": [],
  "endEffectors": [],
  "cartesian": []
}
```

| Property | Type | Description |
|-----------|---------|---------|
| name | string | Robot display name |
| links | Link[] | Robot links |
| joints | Joint[] | Robot joints |
| endEffectors | EndEffector[] | End effectors |
| cartesian | CartesianVariable[] | Cartesian controls |

## Link

Represents a rigid body between joints.

```json
{
  "id": "link1",
  "length": 100,
  "mesh": "/meshes/link1.glb",
  "color": "#ff0000"
}
```

| Property | Type | Description |
|-----------|---------|---------|
| id | string | Unique identifier |
| length | number | Length in millimeters |
| mesh | string | Relative path to 3D model |
| color | string | Hex color used in visualization |
```

## Joint

Represents a movable connection between two links.

Supports rotational (`revolute`) and future translational (`prismatic`) joints.

### Example

```json
{
  "id": "j1",
  "label": "J1 (Base)",
  "type": "revolute",
  "min": -90,
  "max": 90,
  "default": 0,
  "unit": "deg",
  "parent": "base",
  "child": "link_1",
  "axis": [0, 0, 1],
  "mesh": "robot_parts/joints/typeYJoint.glb",
  "origin": {
    "translation": [0, 0, 0],
    "rotation": [0, 0, 0]
  }
}
```

### Properties

| Property           | Type      | Description                                        |
| ------------------ | --------- | -------------------------------------------------- |
| id                 | string    | Unique joint identifier.                           |
| label              | string    | Display name shown in the user interface.          |
| type               | string    | Joint type (`revolute`, `prismatic`, etc.).        |
| min                | number    | Minimum allowed joint value.                       |
| max                | number    | Maximum allowed joint value.                       |
| default            | number    | Initial joint value when the robot is loaded.      |
| unit               | string    | Unit used by the joint (`deg`, `rad`, `mm`, etc.). |
| parent             | string    | ID of the parent link.                             |
| child              | string    | ID of the child link.                              |
| axis               | number[3] | Local axis of motion.                              |
| mesh               | string    | Path to the 3D model used for visualization.       |
| origin.translation | number[3] | Joint position relative to its parent frame.       |
| origin.rotation    | number[3] | Joint orientation relative to its parent frame.    |

### Axis

Defines the joint motion axis in local coordinates.

Examples:

```json
[1, 0, 0] // X axis
[0, 1, 0] // Y axis
[0, 0, 1] // Z axis
```

For a revolute joint, the axis defines the rotation axis.

For a prismatic joint, the axis defines the translation direction.

### Origin

Defines the transform from the parent frame to the current element frame.

```json
{
  "translation": [x, y, z],
  "rotation": [rx, ry, rz]
}
```

* Translation is expressed in millimeters.
* Rotation is expressed in degrees.
* Rotation order: XYZ.

```
```

## End Effector

Represents a controllable tool attached to the end of the robot.

Examples:

- Parallel gripper
- Vacuum gripper
- Camera
- Custom tools

### Example

```json
{
  "id": "gripper",
  "label": "Gripper",
  "type": "revolute",
  "min": 0,
  "max": 100,
  "default": 0,
  "unit": "%",
  "parent": "end_effector",
  "origin": {
    "translation": [0, 100, 0],
    "rotation": [0, 0, 0]
  },
  "mesh": {
    "base": "",
    "left_finger": "",
    "right_finger": ""
  }
}
```

### Properties

| Property | Description |
|-----------|-------------|
| id | Unique identifier |
| label | Display name |
| type | Motion type |
| min | Minimum value |
| max | Maximum value |
| default | Initial value |
| unit | Value unit |
| parent | Parent link identifier |
| origin | Transform from parent frame |
| mesh | 3D models used for visualization |

### Mesh

The mesh object contains the models used to render the end effector.

```json
{
  "base": "",
  "left_finger": "",
  "right_finger": ""
}
```

Each entry points to a GLB/GLTF model.

Rules

- All IDs must be unique.
- Length values are expressed in millimeters.
- Mesh paths are relative to the assets folder.
- Colors must use hexadecimal notation (#RRGGBB).
- The platform uses a right-handed coordinate system.
Axes:

- X: Right
- Y: Forward
- Z: Up

## Cartesian

The `cartesian` array defines the Cartesian variables available for controlling the robot's Tool Center Point (TCP).

Each axis specifies its identifier, display label, valid range, default value, and measurement unit. The frontend uses this information to generate the corresponding controls.

```json
{
    "cartesianAxes": [
        {
            "id": "x",
            "label": "X",
            "min": -180,
            "max": 180,
            "default": 0,
            "unit": "mm"
        }
    ]
}
```

| Property | Type | Description |
|----------|------|-------------|
| `id` | `string` | Unique axis identifier (e.g. `x`, `y`, `z`, `roll`, `pitch`, `yaw`). |
| `label` | `string` | Human-readable name displayed in the user interface. |
| `min` | `number` | Minimum allowed value for the axis. |
| `max` | `number` | Maximum allowed value for the axis. |
| `default` | `number` | Default axis value when the robot is initialized or reset. |
| `unit` | `string` | Measurement unit (`mm`, `deg`, etc.). |

### Notes

- Position axes (`x`, `y`, `z`) are typically expressed in millimeters.
- Orientation axes (`roll`, `pitch`, `yaw`) are typically expressed in degrees.
- The available Cartesian axes depend on the robot configuration. For example, a robot with fewer degrees of freedom may expose only a subset of these axes.
- The frontend generates the Cartesian controls dynamically based on this configuration.