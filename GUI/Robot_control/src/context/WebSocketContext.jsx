import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useRobotState } from "./RobotState";
const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
    const { joints, setJoints, jointConfig } = useRobotState()
    const ws = useRef(null);
    const [isConnected, setIsConnected] = useState(false);
    const [logs, setLogs] = useState([])
    const [positions, setPositions] = useState([])
    const [IP, setIP] = useState("localhost")
    const [port, setPort] = useState("8000")

    const connect = () => {
        // Cerrar la conexión previa si existe y no está cerrada
        if (ws.current && ws.current.readyState !== WebSocket.CLOSED) {
            ws.current.close()
        }

        ws.current = new WebSocket(`ws://${IP}:${port}/ws`)
        let connectionAttempted = false; // Flag para controlar el estado de conexión

        // Funciones de manejo de eventos
        const handleOpen = () => {
            connectionAttempted = true; // La conexión se ha establecido correctamente

            setIsConnected(true)
            setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), type: "INFO", category: "log", values: "Conexión establecida" }])
            loadPositions()
        }

        const handleClose = () => {
            if (!connectionAttempted) {
                return // No se había intentado la conexión
            }
            if (ws.current.readyState === WebSocket.CONNECTING) return
            setIsConnected(false)
            setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), type: "WARNING", category: "log", values: "Conexión cerrada" }])
        }

        const handleError = (err) => {
            if (ws.current.readyState === WebSocket.CONNECTING && !connectionAttempted) {
                // Ignorar si no se ha intentado conexión
                return
            }
            setIsConnected(false)
            setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), type: "ERROR", category: "log", values: "No se pudo conectar al servidor" }])
            console.error("WebSocket error:", err)
        }
        const handleMessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === "JOINTS") setJoints(data.values)
                else if (data.type === "COORDS") setCoords(data.values)
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
                    time: new Date().toLocaleTimeString(),
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
                    time: new Date().toLocaleTimeString(),
                    type: "ERROR",
                    category: "log",
                    values: `Error cargando posiciones: ${err}`
                }])
            }
        }
    }

    function savePos(newPosName) {
        if (!newPosName) return;
        if(ws.current?.readyState !== WebSocket.OPEN) {
            setLogs(prev => [...prev, { category: 'log', time: new Date().toLocaleTimeString(), type: "ERROR", values: "No hay conexión con el servidor" }])
            return;
        }
        fetch(`http://${IP}:${port}/save`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: newPosName, values: joints  }),
        })
            .then(data => {
                if (data.ok) {
                    loadPositions()
                    setLogs(prev => [...prev, { category: 'log', time: new Date().toLocaleTimeString(), type: "INFO", values: "Posición guardada correctamente" }])
                } else {
                    setLogs(prev => [...prev, { category: 'log', time: new Date().toLocaleTimeString(), type: "ERROR", values: "La posición no fue guardada" }])
                }
            })
            .catch(err => setLogs(prev => [...prev, { category: 'log', time: new Date().toLocaleTimeString(), type: "ERROR", values: `No fue posible guardar la posición: ${err}` }]))
    }
    const deletePos = (positionName) => {
        if (positionName === "Home") return;

        fetch(`http://${IP}:${port}/delete`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: positionName }),
        })
            .then(res => res.json())
            .then(data => {
                if (data.status === "ok") {
                    loadPositions()
                    setLogs(prev => [...prev, { category: 'log', time: new Date().toLocaleTimeString(), type: "INFO", values: `La posición fue eliminada con éxito.` }])
                } else {
                    setLogs(prev => [...prev, { category: 'log', time: new Date().toLocaleTimeString(), type: "ERROR", values: `Error del servidor: ${data.status}` }])
                }
            })
            .catch(err => setLogs(prev => [...prev, { category: 'log',  time: new Date().toLocaleTimeString(), type: "ERROR", values: `Error al intentar borrar la posición: ${err}` }]))
    }
    
    const send = (obj) => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify(obj))
        }
    } 

    useEffect(() => {
        connect()

        return () => ws.current?.close()
    }, [])

    return (
        <WebSocketContext.Provider value={{ 
            ws, 
            isConnected, 
            connect, disconnect, send, 
            logs, setLogs, 
            positions, savePos, deletePos,
            IP, setIP,
            port, setPort,
            }}>
            {children}
        </WebSocketContext.Provider>
    )
}

export const useWebSocket = () => useContext(WebSocketContext);
