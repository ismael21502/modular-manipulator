import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useRobotState } from "./RobotState";
import { RobotConfigProvider, useRobotConfig } from "./RobotConfig";
import { debounce, throttle } from 'lodash'
import { useMemo } from "react";

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
    const { setCartesian, isPlaying } = useRobotState()  
    const state = useRobotState()
    const setJoints = state.robotApi.setJoints 

    const { subscribeArticular } = useRobotState()
    const { setRobotConfig } = useRobotConfig() 
    const ws = useRef(null)
    const [isConnected, setIsConnected] = useState(false)
    const [logs, setLogs] = useState([])
    const [positions, setPositions] = useState([])
    const [IP, setIP] = useState("localhost")
    const [port, setPort] = useState("8000")
    const [sequences, setSequences] = useState([])
    const [isConnecting, setIsConnecting] = useState(false)

    useEffect(() => {
        initializeWebSocket()
        return () => ws.current?.close()
    }, [])

    const getRobotConfig = async () => {
        if (ws.current?.readyState !== WebSocket.OPEN) {
            setLogs(prev => [...prev, { category: 'log', time: new Date().toISOString(), type: "ERROR", values: "Error obteniendo configuración del robot: no hay conexión con el servidor" }])
            return null
        }
        try {
            const res = await fetch(`http://${IP}:${port}/robot_config`)
            if (res.ok) {
                const data = await res.json()
                return data
            } else {
                throw new Error(`HTTP ${res.status}`)
            }
        } catch (err) {
            setLogs(prev => [...prev, { category: 'log', time: new Date().toISOString(), type: "ERROR", values: `Error obteniendo configuración del robot: ${err}` }])
        }
    }

    const initializeWebSocket = () => {
        // Cerrar la conexión previa si existe y no está cerrada
        if (ws.current && ws.current.readyState !== WebSocket.CLOSED) {
            ws.current.close()
        }
        setIsConnecting(true)
        ws.current = new WebSocket(`ws://${IP}:${port}/ws`)
        let connectionAttempted = false; // Flag para controlar el estado de conexión

        // Funciones de manejo de eventos
        const handleOpen = async () => {
            connectionAttempted = true; // La conexión se ha establecido correctamente
            const robot_config = await getRobotConfig()
            setRobotConfig(robot_config)
            setIsConnected(true)
            setIsConnecting(false)
            setLogs(prev => [...prev, { time: new Date().toISOString(), type: "INFO", category: "log", values: "Conexión establecida" }])
            send({ type: "articular_move", values: robot_config.joints.map(j => j.default) })
            console.log(robot_config.joints.map(j => j.default))
            loadPositions()
            loadSequences()
        }

        const handleClose = () => {
            if (!connectionAttempted) {
                return // No se había intentado la conexión
            }
            if (ws.current.readyState === WebSocket.CONNECTING) return
            setIsConnected(false)
            setIsConnecting(false)
            setLogs(prev => [...prev, { time: new Date().toISOString(), type: "WARNING", category: "log", values: "Conexión cerrada" }])
        }

        const handleError = (err) => {
            if (ws.current.readyState === WebSocket.CONNECTING && !connectionAttempted) {
                // Ignorar si no se ha intentado conexión
                return
            }
            setIsConnected(false)
            setIsConnecting(false)
            setLogs(prev => [...prev, { time: new Date().toISOString(), type: "ERROR", category: "log", values: "No se pudo conectar al servidor" }])
            console.error("WebSocket error:", err)
        }
        const handleMessage = (event) => {
            console.log("Receiving: ", event.data)
            try {
                let data;
                if (typeof event.data === "string") {
                    data = JSON.parse(event.data);
                } else {
                    data = event.data;
                }
                // if (data.type === "JOINTS") setJoints(data.values)
                if (data.type === "JOINTS") setJoints(data.values) // [ ] Cambiar por moveRobot
                else if (data.type === "COORDS") {
                    setCartesian(data.values)
                    
                } //Dejar esto con callbacks también
                // setLogs(prev => [...prev, data])
            } catch {
                console.log("Mensaje no JSON:", event.data)
            }
        }

        // Añadir listeners
        ws.current.addEventListener("open", handleOpen)
        ws.current.addEventListener("close", handleClose)
        ws.current.addEventListener("error", handleError)
        ws.current.addEventListener("message", handleMessage)

        // Cleanup para eliminar listeners si se reconecta o desmonta
        return () => {
            ws.current?.removeEventListener("open", handleOpen)
            ws.current?.removeEventListener("close", handleClose)
            ws.current?.removeEventListener("error", handleError)
            ws.current?.removeEventListener("message", handleMessage)
        }
    }
    const disconnect = () => {
        ws.current.close()
    }
    const loadPositions = async (retries = 3, delay = 1000) => {
        try {
            const res = await fetch(`http://${IP}:${port}/positions`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();

            if (Array.isArray(data) && data.length > 0) {
                setPositions(data);
            } else {
                setLogs(prev => [...prev, {
                    time: new Date().toISOString(),
                    type: "WARNING",
                    category: "log",
                    values: "No se encontraron posiciones predefinidas"
                }]);
                setPositions([])
            }

        } catch (err) {
            if (retries > 0) {
                console.warn(`Reintentando cargar posiciones... (${retries} intentos restantes)`)
                setTimeout(() => loadPositions(retries - 1, delay), delay)
            } else {
                setLogs(prev => [...prev, {
                    time: new Date().toISOString(),
                    type: "ERROR",
                    category: "log",
                    values: `Error cargando posiciones: ${err}`
                }])
            }
        }
    }
    function updatePos(oldName, posName, jointValues, endEffectorValues = null) {
        if (!posName) return
        if (ws.current?.readyState !== WebSocket.OPEN) {
            setLogs(prev => [...prev, { category: 'log', time: new Date().toISOString(), type: "ERROR", values: "No hay conexión con el backend" }])
            return
        }
        fetch(`http://${IP}:${port}/updatePos`, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ oldName: oldName, name: posName, values: jointValues, endEffectorValues: endEffectorValues })
        })
            .then(data => {
                if (data.ok) {
                    loadPositions()
                    setLogs(prev => [...prev, { category: 'log', time: new Date().toISOString(), type: 'INFO', values: 'Posición actualizada con éxito' }])
                } else {
                    setLogs(prev => [...prev, { category: 'log', time: new Date().toISOString(), type: 'ERROR', values: 'La posición no fue actualizada' }])
                }
            })
            .catch(err => setLogs(prev => [...prev, { category: 'log', time: new Date().toISOString(), type: "ERROR", values: `No fue posible actualizar la posición: ${err}` }]))
    }
    function savePos(newPosName, joints, endEffectorValues = null) {
        if (!newPosName) return
        if (ws.current?.readyState !== WebSocket.OPEN) {
            setLogs(prev => [...prev, { category: 'log', time: new Date().toISOString(), type: "ERROR", values: "No hay conexión con el servidor" }])
            return
        }
        fetch(`http://${IP}:${port}/savePos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: newPosName, values: joints, endEffectorValues: endEffectorValues }),
        })
            .then(data => {
                if (data.ok) {
                    loadPositions()
                    setLogs(prev => [...prev, { category: 'log', time: new Date().toISOString(), type: "INFO", values: "Posición guardada correctamente" }])
                } else {
                    setLogs(prev => [...prev, { category: 'log', time: new Date().toISOString(), type: "ERROR", values: "La posición no fue guardada" }])
                }
            })
            .catch(err => setLogs(prev => [...prev, { category: 'log', time: new Date().toISOString(), type: "ERROR", values: `No fue posible guardar la posición: ${err}` }]))
    }
    const deletePos = (positionName) => {
        fetch(`http://${IP}:${port}/delete`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: positionName }),
        })
            .then(res => res.json())
            .then(data => {
                if (data.status === "ok") {
                    loadPositions()
                    setLogs(prev => [...prev, { category: 'log', time: new Date().toISOString(), type: "INFO", values: `La posición fue eliminada con éxito.` }])
                } else {
                    setLogs(prev => [...prev, { category: 'log', time: new Date().toISOString(), type: "ERROR", values: `Error del servidor: ${data.status}` }])
                }
            })
            .catch(err => setLogs(prev => [...prev, { category: 'log', time: new Date().toISOString(), type: "ERROR", values: `Error al intentar borrar la posición: ${err}` }]))
    }
    const deleteSequence = (sequenceName) => {
        fetch(`http://${IP}:${port}/deleteSeq`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: sequenceName }),
        })
            .then(res => res.json())
            .then(data => {
                if (data.status === "ok") {
                    loadSequences()
                    setLogs(prev => [...prev, { category: 'log', time: new Date().toISOString(), type: "INFO", values: `La sequencia fue eliminada con éxito.` }])
                } else {
                    setLogs(prev => [...prev, { category: 'log', time: new Date().toISOString(), type: "ERROR", values: `Error del servidor: ${data.status}` }])
                }
            })
            .catch(err => setLogs(prev => [...prev, { category: 'log', time: new Date().toISOString(), type: "ERROR", values: `Error al intentar borrar la sequencia: ${err}` }]))
    }
    const loadSequences = async (retries = 3, delay = 1000) => {
        try {
            const res = await fetch(`http://${IP}:${port}/sequences`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();

            if (Array.isArray(data) && data.length > 0) {
                setSequences(data);
            } else {
                setLogs(prev => [...prev, {
                    time: new Date().toISOString(),
                    type: "WARNING",
                    category: "log",
                    values: "No se encontraron sequencias guardadas"
                }]);
                setSequences([])
            }

        } catch (err) {
            if (retries > 0) {
                console.warn(`Reintentando cargar posiciones... (${retries} intentos restantes)`)
                setTimeout(() => loadSequences(retries - 1, delay), delay)
            } else {
                setLogs(prev => [...prev, {
                    time: new Date().toISOString(),
                    type: "ERROR",
                    category: "log",
                    values: `Error cargando posiciones: ${err}`
                }])
            }
        }
    }
    const saveSeq = async (name, steps) => {
        if (!name) return
        if (ws.current?.readyState !== WebSocket.OPEN) {
            setLogs(prev => [...prev, { category: 'log', time: new Date().toISOString(), type: "ERROR", values: "No hay conexión con el servidor" }])
            return { status: 'error' }
        }
        // console.log(JSON.stringify({ name: name, updated_at: new Date().toISOString(), steps: steps }))
        try {
            const res = await fetch(`http://${IP}:${port}/saveSeq`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: name, updated_at: new Date().toISOString(), steps: steps }),
            })
            if (res.ok) {
                loadSequences()
                return { status: 'ok' }
            } else {
                return { status: 'error' }
            }
        } catch {
            return { status: 'error' }
        }
    }
    const updateSeq = async (oldName, seqName, steps) => {
        if (!seqName) return { status: 'error', message: 'Nombre de secuencia inválido' }

        if (ws.current?.readyState !== WebSocket.OPEN) {
            setLogs(prev => [
                ...prev,
                {
                    category: 'log',
                    time: new Date().toISOString(),
                    type: "ERROR",
                    values: "No hay conexión con el backend"
                }
            ])
            return { status: 'error', message: 'No hay conexión con el backend' }
        }

        try {
            const res = await fetch(`http://${IP}:${port}/updateSeq`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    oldName,
                    name: seqName,
                    steps
                })
            })

            if (res.ok) {
                await loadSequences()

                setLogs(prev => [
                    ...prev,
                    {
                        category: 'log',
                        time: new Date().toISOString(),
                        type: 'INFO',
                        values: 'Secuencia actualizada con éxito'
                    }
                ])
                return { status: 'ok' }
            } else{
                throw new Error(`HTTP ${res.status}`)
            }


        } catch (err) {
            setLogs(prev => [
                ...prev,
                {
                    category: 'log',
                    time: new Date().toISOString(),
                    type: "ERROR",
                    values: `No fue posible actualizar la secuencia: ${err.message}`
                }
            ])

            return { status: 'error', message: err.message}
        }
    }
    
    const send = (obj) => {
        console.log("SENDING", obj)
        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify(obj))
        }
    }

    // const debouncedSend = useMemo(
    //     () => debounce((type, values) => {
    //         send({ type, values })
    //     }, 300),
    //     []
    // )
    const throttledSend = useMemo(
        () =>
            throttle((type, values) => {
                send({ type: type, values: values })
            }, 20), // 👈 frecuencia
        [send]
    ) //Para corregir esto bastará con modificar moveRobot para que haga una interpolación o darle como tiempo los ms de la frecuencia

    useEffect(() => {
        const unsubscribe = subscribeArticular(joints => {
            throttledSend('articular_move', joints)
        })

        return () => unsubscribe()
    }, [subscribeArticular, throttledSend])

    return (
        <WebSocketContext.Provider value={{
            ws,
            isConnected, isConnecting,
            initializeWebSocket, disconnect, throttledSend,
            logs, setLogs,
            positions, savePos, deletePos, updatePos,
            IP, setIP,
            port, setPort,
            sequences, saveSeq, deleteSequence, updateSeq,
        }}>
            {children}
        </WebSocketContext.Provider>
    )
}

export const useWebSocket = () => useContext(WebSocketContext);
