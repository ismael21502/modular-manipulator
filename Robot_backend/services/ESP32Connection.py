import serial
import json
import time
#Quitar puerto y baudrate predeterminados?
class ESP32Connection:
    def __init__(self, port: str | None = None, baudrate: int = 115200):
        self.port = port
        self.baudrate = baudrate
        self.ser = None
    #[ ] Puedo agregar un return y en controller.py un await. Se enviaría un mensaje handshake mediante "send" y si el handshake es positivo, se retornará True
    # def connect(self, port=None, baudrate=None):
    #     if port is not None:
    #         self.port = port
    #     if baudrate is not None: 
    #         self.baudrate = baudrate
    #     self.ser = serial.Serial(self.port, self.baudrate, timeout=1)
    def connect(self, port=None, baudrate=None):
        if port is not None:
            self.port = port
        if baudrate is not None:
            self.baudrate = baudrate
        try:
            # Abrir puerto serie
            self.ser = serial.Serial(
                self.port,
                self.baudrate,
                timeout=0.2
            )
            # (Opcional) Dar tiempo al ESP32 para estabilizarse
            time.sleep(0.5)
            # Enviar handshake
            self.send({
                "type": "handshake",
                "values": ""
            })
            # Esperar respuesta durante 3 segundos
            timeout = 3
            start = time.monotonic()
            while time.monotonic() - start < timeout:
                response = self.read()
                if response != None:
                    print(response)
                if response == "Shaked":
                    return
            raise Exception("Se agotó el tiempo de espera.")
        except Exception:
            if self.ser is not None and self.ser.is_open:
                self.ser.close()
            self.ser = None
            raise
    def disconnect(self):
        if self.ser:
            self.ser.close()
            self.ser = None

    def send(self, data: dict): #Era async
        if not self.isConnected():
            return
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
