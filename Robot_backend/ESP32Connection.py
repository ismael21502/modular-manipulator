import serial
import json

class ESP32Connection:
    def __init__(self, port, baudrate=115200):
        self.port = port
        self.baudrate = baudrate
        self.ser = None

    def connect(self):
        self.ser = serial.Serial(self.port, self.baudrate, timeout=1)

    def disconnect(self):
        if self.ser:
            self.ser.close()
            self.ser = None

    def send(self, data: dict):
        if not self.ser:
            raise RuntimeError("ESP32 not connected")
        msg = json.dumps(data) + "\n"
        # print(msg)
        self.ser.write(msg.encode())

    def sendList(self, values: list):
        if not self.ser:
            raise RuntimeError("ESP32 not connected")
        
        msg = ",".join(str(v) for v in values) + "\n"
        print(msg)
        self.ser.write(msg.encode())

    def read(self):
        if self.ser and self.ser.in_waiting:
            return self.ser.readline().decode().strip()
