import serial
import json

#Quitar puerto y baudrate predeterminados?
class ESP32Connection:
    def __init__(self, port: str | None = None, baudrate: int = 115200):
        self.port = port
        self.baudrate = baudrate
        self.ser = None

    def connect(self, port=None, baudrate=None):
        if port is not None:
            self.port = port
        if baudrate is not None: 
            self.baudrate = baudrate
        self.ser = serial.Serial(self.port, self.baudrate, timeout=1)

    def disconnect(self):
        if self.ser:
            self.ser.close()
            self.ser = None

    async def send(self, data: dict):
        if not self.isConnected():
            return
            # raise RuntimeError("ESP32 not connected")
        msg = json.dumps(data) + "\n"
        # print(msg)
        self.ser.write(msg.encode())

    # def sendList(self, values: list):
    #     if not self.ser:
    #         raise RuntimeError("ESP32 not connected") 
        
    #     msg = ",".join(str(v) for v in values) + "\n"
    #     self.ser.write(msg.encode())

    def read(self):
        if self.ser and self.ser.in_waiting:
            return self.ser.readline().decode().strip()
     
    #Revisar esto
    def isConnected(self):
        return self.ser is not None and self.ser.is_open
