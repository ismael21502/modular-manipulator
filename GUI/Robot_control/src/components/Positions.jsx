import React, { useState, useEffect } from 'react'
import * as Select from "@radix-ui/react-select";
import PopUp from './PopUp';
import PositionsCard from './PositionsCard';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import { useTheme } from '../context/ThemeContext';
function Positions({ joints, setJoints, setLogs, loadPositions, isConnected, opening, setOpening, coords, setCoords, setShowSequences, ws }) {
    const { colors } = useTheme()
    const [value, setValue] = useState("Home");
    const [newPosName, setNewPosName] = useState("")
    const [showPopUp, setShowPopUp] = useState(false)
    const [selectedMode, setSelectedMode] = useState("Posiciones")
    const [selectedPos, setSelectedPos] = useState("")

    const positions = [{
        name: "Zeroaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        joints: {
            values: [0, 0, 0, 0, 0],
            names: ["J1", "J2", "J3", "J4", "G"]
        }
    }, {
        name: "Zero1",
        joints: {
            values: [0, 0, 0, 0, 0],
            names: ["J1", "J2", "J3", "J4", "G"]
        }
    }, {
        name: "Zero2",
        joints: {
            values: [0, 0, 0, 0, 0],
            names: ["J1", "J2", "J3", "J4", "G"]
        }
    }, {
        name: "Zero3",
        joints: {
            values: [0, 0, 0, 0, 0],
            names: ["J1", "J2", "J3", "J4", "G"]
        }
    }, {
        name: "Zero4",
        joints: {
            values: [0, 0, 0, 0, 0],
            names: ["J1", "J2", "J3", "J4", "G"]
        }
    }, {
        name: "Zero5",
        joints: {
            values: [0, 0, 0, 0, 0],
            names: ["J1", "J2", "J3", "J4", "G"]
        }
    }, {
        name: "Zero",
        joints: {
            values: [0, 0, 0, 0, 0],
            names: ["J1", "J2", "J3", "J4", "G"]
        }
    }]
    const deletePosition = (positionName) => {
        if (positionName === "Home") return;

        fetch("http://localhost:8000/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: positionName }),
        })
            .then(res => res.json())
            .then(data => {
                if (data.status === "ok") {
                    loadPositions();
                    setValue("Home");
                    setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), type: "INFO", values: `La posición fue eliminada con éxito.` }]);
                } else {
                    setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), type: "ERROR", values: `Error del servidor: ${data.status}` }]);
                }
            })
            .catch(err => setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), type: "ERROR", values: `Error al intentar borrar la posición: ${err}` }]));
    }

    useEffect(() => { loadPositions() }, [isConnected])

    function moveRobot(targetJoints, targetGripperOpening, targetCoords) {
        const duration = 700; // duración de la animación en ms
        const start = performance.now();
        const initialJoints = { ...joints };
        const initialOpening = opening;
        const initialCoords = { ...coords };

        function animate(time) {
            const elapsed = time - start;
            const t = Math.min(elapsed / duration, 1);

            const newJoints = {};
            const newCoords = {};

            for (let key in initialJoints) {
                newJoints[key] = Math.round(initialJoints[key] + t * (targetJoints[key] - initialJoints[key]));
            }

            const newOpening = Math.round(initialOpening + t * (targetGripperOpening - initialOpening));

            for (let key in initialCoords) {
                newCoords[key] = parseFloat((initialCoords[key] + t * (targetCoords[key] - initialCoords[key])).toFixed(2));
            }

            // Actualiza estados
            setJoints(newJoints);
            setOpening(newOpening);
            setCoords(newCoords);

            // Envía datos al backend si WebSocket está abierto
            if (ws?.current?.readyState === WebSocket.OPEN) {
                console.log("HOLA")
                ws.current.send(JSON.stringify({
                    type: "joints",
                    data: { joints: Object.fromEntries(Object.entries(newJoints).map(([k, v]) => [k, v])), gripper: newOpening }
                }));
            }

            if (t < 1) requestAnimationFrame(animate);
        }

        requestAnimationFrame(animate);
    }

    function sendPos() {
        const target = positions.find(pos => pos.name === value);
        if (target) moveRobot(target.joints, target.gripperOpening, target.coords);
    }

    function savePos() {
        if (!newPosName) return;
        fetch("http://localhost:8000/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: newPosName, joints, gripperOpening: opening, coords }),
        })
            .then(data => {
                if (data.ok) {
                    loadPositions();
                    setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), type: "INFO", values: "Posición guardada correctamente" }]);
                } else {
                    setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), type: "ERROR", values: "La posición no fue guardada" }]);
                }
            })
            .catch(err => setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), type: "ERROR", values: `No fue posible guardar la posición: ${err}` }]));

        setNewPosName("");
    }
    return (
        // bg - [#1F1F1F] border-[#4A4A4A] bg-[#2B2B2B] text-white
        <div className="flex flex-col h-full min-h-0">
            {/* tabs */}
            <div className='w-full text-md text-gray-500 flex flex-row text-center border-b'
                style={{ borderColor: colors.border }}>
                <button className='w-full cursor-pointer' onClick={() => { setSelectedMode("Posiciones") }}>
                    <div
                        className={`w-full py-3`}
                        style={selectedMode === "Posiciones" ? {
                            backgroundColor: `${colors.base}1A`,
                            color: colors.base,
                            borderBottom: '4px solid',
                            borderColor: colors.base,
                            fontWeight: 'bold'
                        } : {}}>
                        <p>POSICIONES</p>
                    </div>
                </button>
                <button className='w-full cursor-pointer' onClick={() => { setSelectedMode("Secuencias") }}>
                    <div
                        className={`w-full py-3`}
                        style={selectedMode === "Secuencias" ? {
                            backgroundColor: `${colors.base}1A`,
                            color: colors.base,
                            borderBottom: '4px solid',
                            borderColor: colors.base,
                            fontWeight: 'bold'
                        } : {}}>
                        <p>SECUENCIAS</p>
                    </div>
                </button>
            </div>

            {/* scrollable content */}
            <div className="flex-1 min-h-0 overflow-auto flex flex-col gap-5 p-5">
                {positions.map(position => (
                    <PositionsCard key={position.name} position={position} setSelected={setSelectedPos} isActive={position.name == selectedPos ? true : false} />
                ))}
            </div>
            <div className='flex flex-col p-4 gap-3 border-t'
                style={{ borderColor: colors.border, color: colors.text.primary }}>
                <div className='flex flex-row justify-between gap-3 '>
                    <button className='flex flex-1 p-2 justify-center gap-3 cursor-pointer rounded-md border-1'
                        style={{ borderColor: colors.border }}>
                        <SaveIcon />
                        <p>Guardar</p>
                    </button>
                    <button className='flex flex-1 p-2 justify-center gap-3 cursor-pointer rounded-md border-1'
                        style={{ borderColor: colors.border }}>
                        <DeleteIcon />
                        <p>Borrar</p>
                    </button>
                </div>
                <div className='flex flex-row justify-between gap-3 text-white'>
                    <button className='flex flex-1 p-2 justify-center gap-3 cursor-pointer rounded-md'
                        style={{ backgroundColor: colors.base_darker }}>
                        <PlayArrowRoundedIcon />
                        <p>Reproducir movimiento</p>
                    </button>
                </div>
            </div>
            {/* <div className='p-2 flex flex-col gap-5'>
                <div className='flex justify-between items-center w-full'>
                    <Select.Root value={value} onValueChange={setValue}>
                        <Select.Trigger className="border border-gray-400 px-3 py-2 rounded cursor-pointer">
                            <Select.Value placeholder="Selecciona un color" />
                            <Select.Icon className="SelectIcon ml-3" />
                        </Select.Trigger>
                        <Select.Content className="bg-[#2B2B2B] border border-gray-400 rounded mt-1">
                            {positions.length > 0 ? positions.map(pos => (
                                <Select.Item key={pos.name} value={pos.name} className="px-3 py-1 hover:bg-[#3B3939] cursor-pointer">
                                    <Select.ItemText>{pos.name}</Select.ItemText>
                                </Select.Item>
                            )) :
                                <Select.Item key="Home" value="Home" className="px-3 py-1 hover:bg-[#3B3939] cursor-pointer">
                                    <Select.ItemText>Home</Select.ItemText>
                                </Select.Item>}
                        </Select.Content>
                    </Select.Root>
                    <button className='flex py-2 px-4 gap-2 items-center bg-[#e0006f] rounded-md cursor-pointer transition-shadow duration-300 hover:shadow-[0_0_10px_#e0006f] text-bold'
                        onClick={sendPos}>
                        <i className="fa-solid fa-play"></i>
                        <p>Enviar</p>
                    </button>
                </div>

                <div>
                    <p className='font-bold text-xl px-3 mb-5'>Guardar pose actual</p>
                    <div className='flex justify-between'>
                        <input type="text" className='border-1 border-[#3B3939] rounded-sm px-2 w-[8rem]' placeholder='Nombre' onChange={(e) => setNewPosName(e.target.value)} value={newPosName} />
                        <div className='flex gap-5'>
                            <button className='flex py-2 px-4 gap-2 items-center bg-[#e0006f] rounded-md cursor-pointer transition-shadow duration-300 hover:shadow-[0_0_10px_#e0006f] text-bold'
                                onClick={savePos}>
                                <i className="fa-solid fa-floppy-disk"></i>
                                <p>Guardar</p>
                            </button>
                            <button className='flex py-2 px-4 gap-2 items-center bg-[#008787] rounded-md cursor-pointer transition-shadow duration-300 hover:shadow-[0_0_10px_#008787] text-bold'
                                onClick={() => setShowPopUp(true)}>
                                <i className="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {(value === "Home")
                ? <PopUp isOpen={showPopUp} title="Aviso" message={`No es posible eliminar la posición "Home", ya que está protegida por el sistema.`} onCancel={() => setShowPopUp(false)} onConfirm={() => { deletePosition(value); setShowPopUp(false); }} />
                : <PopUp isOpen={showPopUp} title="CONFIRMAR ELIMINACIÓN" message={`¿Estás seguro que quieres eliminar "${value}"? Esta acción no se puede deshacer.`} onCancel={() => setShowPopUp(false)} onConfirm={() => { deletePosition(value); setShowPopUp(false); }} />
            } */}
        </div>
    )
}

export default Positions
