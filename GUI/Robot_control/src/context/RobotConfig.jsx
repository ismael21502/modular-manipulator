const robotConfig = {
    name: "My4DOF",
    joints: [
        {
            id: "j1",
            label: "J1 (Base)",
            type: "rotational",
            min: -180,
            max: 180,
            default: 0,
            unit: "deg"
        },
        {
            id: "j2",
            label: "J2 (Hombro)",
            type: "rotational",
            min: -90,
            max: 90,
            default: 0,
            unit: "deg"
        },
        {
            id: "j3",
            label: "J3 (Codo)",
            type: "rotational",
            min: -90,
            max: 90,
            default: 0,
            unit: "deg"
        },
        {
            id: "j4",
            label: "J4 (Muñeca)",
            type: "rotational",
            min: -180,
            max: 180,
            default: 0,
            unit: "deg"
        },
        {
            id: "gripper",
            label: "Gripper",
            type: "linear",
            min: 0,
            max: 100,
            default: 0,
            unit: "%"
        }
    ],
    cartesian: [
        {
            id: "x",
            label: "Eje X (Lateral)",
            min: -500,
            max: 500,
            default: 0,
            unit: "mm"
        },
        {
            id: "y",
            label: "Eje Y (Profundidad)",
            min: -500,
            max: 500,
            default: 0,
            unit: "mm"
        },
        {
            id: "z",
            label: "Eje Z (Vertical)",
            min: 0,
            max: 500,
            default: 0,
            unit: "mm"
        },
        {
            id: "roll",
            label: "Roll",
            min: -180,
            max: 180,
            default: 0,
            unit: "deg"
        },
        {
            id: "pitch",
            label: "Pitch",
            min: -90,
            max: 90,
            default: 0,
            unit: "deg"
        },
        {
            id: "yaw",
            label: "Yaw",
            min: -180,
            max: 180,
            default: 0,
            unit: "deg"
        }
    ]
};

export default robotConfig;
