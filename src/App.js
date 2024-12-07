import React, { useState } from "react";
import "./App.css";

let bluetoothCharacteristic;

async function connectBluetooth() {
  try {
    const device = await navigator.bluetooth.requestDevice({
      filters: [{ name: "BT05" }],
      optionalServices: ["0000ffe0-0000-1000-8000-00805f9b34fb"], // UUID del servicio del HM-10
    });
    const server = await device.gatt.connect();
    const service = await server.getPrimaryService(
      "0000ffe0-0000-1000-8000-00805f9b34fb"
    ); // UUID del servicio del HM-10
    bluetoothCharacteristic = await service.getCharacteristic(
      "0000ffe1-0000-1000-8000-00805f9b34fb"
    ); // UUID de la característica del HM-10
    console.log("Conexión Bluetooth exitosa");
  } catch (error) {
    console.error("Error al conectar Bluetooth:", error);
  }
}

async function sendGateAction() {
  if (!bluetoothCharacteristic) {
    console.error("No hay conexión Bluetooth establecida.");
    return;
  }

  const messageInput = "1";
  const encoder = new TextEncoder();

  try {
    await bluetoothCharacteristic.writeValue(encoder.encode(messageInput));
    console.log("Notificaciones habilitadas");
  } catch (error) {
    console.error("Error al enviar mensaje:", error);
  }
}

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [gateState, setGateState] = useState("Cerrado");

  const GateState = {
    OPENING: "Abriendo",
    CLOSING: "Cerrando",
    STOPPED: "Detenido",
    OPENED: "Abierto",
    CLOSED: "Cerrado"
  };

  const GateAction = {
    CLOSE: "Cerrar",
    OPEN: "Abrir",
    STOP: "Detener"
  }

  function startSpinner() {
    const spinner = document.querySelector(".spinner");
    spinner.classList.add("active");

    setTimeout(() => {
      spinner.classList.remove("active");
    }, 5000);
  }

  return (
    <>
      <button onClick={connectBluetooth}>Conectar</button>

      <button
        className="circle-button"
        onClick={() => {
          switch (gateState) {
            case GateState.CLOSED:
              setGateState(GateState.OPENING);

              setTimeout(() => {
                setGateState(GateState.OPENED);
              }, 5000);

              break;

            case GateState.OPENED:
              setGateState(GateState.CLOSING);

              setTimeout(() => {
                setGateState(GateState.CLOSED);
              }, 5000);

              break;

            default: 
              setGateState(GateState.CLOSING);
          }

          sendGateAction();
          startSpinner();
        }}
      >
        <div className="inner-circle">
          <span className="button-text">{gateState}</span>
          <div className="spinner"></div>
        </div>
      </button>
    </>
  );
}

export default App;
