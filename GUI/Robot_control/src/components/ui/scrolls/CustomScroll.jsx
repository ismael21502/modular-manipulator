import * as ScrollArea from '@radix-ui/react-scroll-area';
import { forwardRef } from "react";

const CustomScroll = forwardRef(function CustomScroll({ children, className, scrollbarColor = '#00000010', thumbColor = `#FFF` }, ref) {
    return (
        <ScrollArea.Root className={`flex-1 relative overflow-hidden w-full h-full min-h-0 ${className}`}>
            <ScrollArea.Viewport className="w-full h-full min-w-0" ref={ref}>
                {children}
            </ScrollArea.Viewport>
            <ScrollArea.Scrollbar
                className="flex flex-col select-none touch-none p-0.5 rounded-full w-2.5"
                orientation="vertical"
                style={{backgroundColor: scrollbarColor}}
            >
                <ScrollArea.Thumb className="relative rounded-5 rounded-full" style={{backgroundColor: thumbColor}}/>
            </ScrollArea.Scrollbar>
            {/* <ScrollArea.Corner className="" /> */}
        </ScrollArea.Root>
    );
})

export default CustomScroll;
