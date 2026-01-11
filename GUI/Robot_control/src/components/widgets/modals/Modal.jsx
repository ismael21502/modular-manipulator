import React from 'react'

function Modal({ onClose, children, className, style }) {
    return (
        <div className={`fixed h-full w-full bg-black/80 right-0 top-0 flex justify-center items-center z-1000 ${className}`}
            onClick={onClose}
            style={style}>
            {children}
        </div>
    )
}

export default Modal