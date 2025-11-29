import React, { useState } from 'react'
import * as Slider from "@radix-ui/react-slider";
import OpenWithIcon from '@mui/icons-material/OpenWith';
import { useTheme } from '../context/ThemeContext';
function CartesianControl({ws, coords, setCoords}) {
    const { colors } = useTheme()
    const [tempCoords, setTempCoords] = useState({ X: "0", Y: "0", Z: "0" });

    const handleChange = (axis, input) => {
        // Slider pasa un array
        if (Array.isArray(input)) {
            const newCoords = { ...coords, [axis]: input[0] };
            setCoords(newCoords);
            setTempCoords(prev => ({ ...prev, [axis]: input[0].toString() }));
            ws.current.send(
                JSON.stringify({ type: "cartesian", data: newCoords })
            );
            return;
        }

        // Input pasa string
        setTempCoords(prev => ({ ...prev, [axis]: input }));
    };

    const handleKeyDown = (axis, e) => {
        if (e.key === "Enter") {
            let val = parseFloat(tempCoords[axis]);
            if (isNaN(val)) val = 0;

            // limitar rango -0.5 a 0.5
            if (val > 0.5) val = 0.5;
            if (val < -0.5) val = -0.5;
            const newCoords = { ...coords, [axis]: val };

            setCoords(newCoords);
            setTempCoords(prev => ({ ...prev, [axis]: val.toString() }));
            ws.current.send(
                JSON.stringify({ type: "cartesian", data: newCoords })
            );
            console.log("ENVIAR")
        }
    };

    const axes = {"X":"Lateral", "Y":"Profundidad", "Z":"Vertical"};
    return (
        <div className='flex flex-1 flex-col'
            style={{ borderBottom: '1px solid', borderColor: colors.border, color: colors.text.title }}>
            <div className='flex flex-row w-full py-2 px-5 gap-2 font-bold text-md'>
                <OpenWithIcon/>
                <p>CONTROL CARTESIANO</p>
            </div>
            <div className="flex flex-col gap-4 py-2 px-5 w-full">
                {Object.entries(axes).map(([axis, label]) => (
                    <div className='flex flex-col items-center' key={axis}> {/* Slider */}
                        <div className='flex flex-row w-full justify-between'>
                            <h3 className='text-sm text-center'>Eje {axis} ({label}) </h3>
                            <div>
                                <input type='text' className='text-sm w-[3rem] text-end mr-2'
                                    //[ ] Hacer editable nuevamente
                                    value={coords[axis]}
                                    onChange={(e) => handleChange(axis, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(axis, e)} />
                                <span>m</span>
                            </div>
                        </div>
                        <Slider.Root
                            className="relative flex items-center justify-center select-none touch-none h-8 w-full"
                            defaultValue={[0]}
                            min={-0.5}
                            max={0.5}
                            step={0.01}
                            onValueChange={(val) => handleChange(axis, val)}
                            value={[coords[axis]]}
                        >
                            <Slider.Track className="relative rounded-full h-1 w-full mx-auto overflow-hidden hover:cursor-pointer"
                                style={{ backgroundColor: colors.border }}>
                                <Slider.Range className="absolute rounded-full h-full h-full" 
                                    style={{ backgroundColor: colors.axes[axis] }}/>
                            </Slider.Track>
                            <Slider.Thumb className="block w-4 h-4 rounded-full hover:cursor-pointer" 
                                style={{ backgroundColor: colors.axes[axis] }}/>
                        </Slider.Root>               
                    </div>
                ))}
            </div>
        </div>
    )
}

export default CartesianControl
