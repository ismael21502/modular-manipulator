from serial.tools import list_ports   

import asyncio
from serial.tools import list_ports

class DeviceDiscovery:

    def __init__(self):
        self._lastPorts = []
        self._notifiers = []
        self.baudrates = [
            {'label': 9600, 'value': 9600},
            {'label': 19200, 'value': 19200},
            {'label': 38400, 'value': 38400},
            {'label': 57600, 'value': 57600},
            {'label': 115200, 'value': 115200},
        ]

    def _scanPorts(self):
        return [
            {'label': p.device, 'value': p.device}
            for p in list_ports.comports()
        ]

    async def run(self, interval=2):
        while True:
            print("RUNNING")
            currentPorts = self._scanPorts()

            if currentPorts != self._lastPorts:
                self._lastPorts = currentPorts
                await self.sendOptions({
                    "ports": currentPorts,
                    "baudrates": self.baudrates
                })

            await asyncio.sleep(interval)

    async def sendOptions(self, options):
        for notifier in list(self._notifiers):
            try:
                await notifier({
                    "event": "HARDWARE_CONFIG",
                    "payload": options
                })
            except:
                self._notifiers.remove(notifier)

    def addNotifier(self, notifier):
        self._notifiers.append(notifier)

    def removeNotifier(self, notifier):
        self._notifiers.remove(notifier)
        
    async def notifyCurrent(self, notifier):
        # print("ENTER notifyCurrent")
        # await asyncio.sleep(0.5)
        # print("EXIT notifyCurrent")
        try:
            print("CURRENT: ")
            options = {
                "ports": self._scanPorts(),
                "baudrates": self.baudrates
            }
            await notifier({
                "event": "HARDWARE_CONFIG",
                "payload": options
            })
            
        except Exception as e:
            print(e)