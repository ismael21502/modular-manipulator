import React, { useState, useEffect } from 'react'
import * as Select from "@radix-ui/react-select";
import PopUp from './PopUp';
import PositionsCard from './PositionsCard';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import EditIcon from '@mui/icons-material/Edit';
import { useTheme } from '../context/ThemeContext';
import { useWebSocket } from '../context/WebSocketContext';
import { useRobotState } from '../context/RobotState';

function Positions({ setLogs, loadPositions, opening, setOpening, }) {
    const { positions } = useWebSocket()
    const { colors } = useTheme()
    const { joints, setJoints } = useRobotState()

    const [newPosName, setNewPosName] = useState("")
    const [showPopUp, setShowPopUp] = useState(false)
    const [selectedPos, setSelectedPos] = useState("")

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

    // useEffect(() => { loadPositions() }, [isConnected])

    function moveRobot(targetJoints) {
        const duration = 700;
        const start = performance.now();

        const initialJoints = { ...joints };     // ejemplo: {J1:0, J2:10, J3:30, J4:0, G:0}
        const labels = targetJoints.labels;      // ['J1','J2','J3','J4','G']
        const target = targetJoints.values;      // [0,45,45,0,0]

        function animate(time) {
            const elapsed = time - start;
            const t = Math.min(elapsed / duration, 1);
            const newJoints = [];

            // [ ] Arreglar esto
            // Equivalente a zip(labels, target) en Python
            labels.forEach((label, i) => {
                const startVal = initialJoints[i];
                const endVal = target[i];

                newJoints[i] = Math.round(startVal + t * (endVal - startVal));
            });
            setJoints(newJoints);            

            // ESTA ES LA CLAVE PARA ANIMAR TAMBIÉN EL CARTESIAN
            // Envía datos al backend si WebSocket está abierto
            // if (ws?.current?.readyState === WebSocket.OPEN) {
            //     ws.current.send(JSON.stringify({
            //         type: "joints",
            //         data: { joints: Object.fromEntries(Object.entries(newJoints).map(([k, v]) => [k, v])), gripper: newOpening }
            //     }));
            // }

            if (t < 1) requestAnimationFrame(animate);
        }

        requestAnimationFrame(animate);
    }

    function sendPos() {
        const target = positions.find(pos => pos.name === selectedPos);
        if (target) moveRobot(target.joints);
    }

    function savePos() {
        if (!newPosName) return;
        fetch("http://localhost:8000/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: newPosName, joints, gripperOpening: opening }),
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
        <div className="flex flex-1 flex-col min-h-0">
            {/* scrollable content */}
            <div className="flex-1 min-h-0 overflow-auto flex flex-col gap-5 p-5">
                {positions.map(position => (
                    <PositionsCard key={position.name} position={position} setSelected={setSelectedPos} isActive={position.name == selectedPos ? true : false} />
                ))}
            </div>
            <div className='flex flex-col p-4 gap-3 border-t'
                style={{ borderColor: colors.border, color: colors.text.primary }}>
                {selectedPos !== ""
                    ? <div className='flex flex-row justify-between gap-3 '>
                        <button className='flex flex-1 p-2 justify-center gap-3 cursor-pointer rounded-md border-1'
                            style={{ borderColor: colors.primary, color: colors.primary, backgroundColor: `${colors.primary}1A` }}>
                            <EditIcon />
                            <p>Editar</p>
                        </button>
                        <button className='flex flex-1 p-2 justify-center gap-3 cursor-pointer rounded-md border-1'
                            style={{ borderColor: colors.danger, color: colors.danger, backgroundColor: `${colors.danger}1A` }}>
                            <DeleteIcon />
                            <p>Borrar</p>
                        </button>
                    </div>
                    :null}
                <div className='flex w-full'
                    style={{ borderColor: colors.border, color: colors.text.primary }}>
                    <button className='flex flex-1 p-2 justify-center gap-3 cursor-pointer rounded-md border-1'
                        style={{ borderColor: colors.border }}
                        >
                        <SaveIcon />
                        <p>Guardar nueva pose</p>
                    </button>
                </div>
                {selectedPos !== ""
                    ? <div className='flex text-white'>
                        <button className='flex flex-1 p-2 justify-center gap-3 cursor-pointer rounded-md'
                            style={{ backgroundColor: colors.primaryDark }}
                            onClick={sendPos}>
                            <PlayArrowRoundedIcon />
                            <p>Reproducir movimiento</p>
                        </button>
                    </div>
                    :null}

                    
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
