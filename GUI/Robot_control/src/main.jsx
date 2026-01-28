import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from './context/themes/ThemeContext.jsx'
import { WebSocketProvider } from './context/WebSocketContext.jsx'
import { RobotStateProvider } from './context/RobotState.jsx'
import { RobotConfigProvider } from './context/RobotConfig.jsx'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RobotConfigProvider>
      <RobotStateProvider>
        <WebSocketProvider>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </WebSocketProvider>
      </RobotStateProvider>
    </RobotConfigProvider>
    
  </StrictMode>,
)
