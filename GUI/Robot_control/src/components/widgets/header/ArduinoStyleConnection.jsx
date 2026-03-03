import { useTheme } from "../../../context/themes/ThemeContext"
import SolidButton from "../../ui/buttons/SolidButton"
import { useEffect, useState } from "react"
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import ActiviyIndicator from "../../ui/indicators/LoadingIndicator";
import DropDown from "../../ui/inputs/DropDown";
import { useWebSocket } from "../../../context/WebSocketContext";

function ArduinoStyleConnection() {
    const { colors, mode } = useTheme()
    const { connectHardware, hardwareStatus, disconnectHardware } = useWebSocket()
    const [isConnected, setIsConnected] = useState(false)
    const [isConnecting, setIsConnecting] = useState(false)

    const avialableBaudRates = [
        { label: "9600", value: "9600" },
        { label: "19200", value: "19200" },
        { label: "115200", value: "115200" }
    ]
    const availablePorts = [
        { label: "COM3", value: "COM3" },
        { label: "COM4", value: "COM4" },
        { label: "COM7", value: "COM7" }
    ]
    const [port, setPort] = useState()
    const [baudrate, setBaudrate] = useState()

    useEffect(()=>{
        console.log(hardwareStatus)
    },[hardwareStatus])
    return (
        <div className="flex flex-row gap-3">
            <DropDown
                label="Puerto"
                buttonStyle={{ borderColor: colors.border, outlineColor: colors.primary }}
                backgroundColor={colors.background}
                borderColor={colors.border}
                textColor={colors.text.primary}
                primaryColor={colors.primary}
                selectedColor={'white'}
                options={availablePorts} 
                value={port}
                onSelect={setPort}/>
            <DropDown
                label="Baudrate"
                buttonStyle={{ borderColor: colors.border, outlineColor: colors.primary }}
                backgroundColor={colors.background}
                borderColor={colors.border}
                textColor={colors.text.primary}
                primaryColor={colors.primary}
                selectedColor={'white'}
                options={avialableBaudRates} 
                value={baudrate}
                onSelect={setBaudrate} />
            <SolidButton
                className={"px-2 py-0.5"}
                onClick={() => {
                    hardwareStatus === "connected"
                        ? disconnectHardware()
                        : connectHardware(port, baudrate)
                        
                }}
                text={hardwareStatus === "connected" ? "Desconectar" : hardwareStatus === "connecting" ? "Conectando..." : "Conectar"}
                bgColor={hardwareStatus === "connected" ? colors.danger : mode === "light" ? "#1e293b" : "#2b384e"}
                borderColor={hardwareStatus === "connected" ? colors.danger : mode === "light" ? "#1e293b" : "#2b384e"}
                color={"white"}
                disabled={hardwareStatus === "connecting"}
                IconComponent={hardwareStatus === "connected"
                    ? LinkOffIcon
                    : hardwareStatus === "connecting"
                        ? ActiviyIndicator
                        : LinkIcon}
            />
        </div>
    )
}

export default ArduinoStyleConnection