import React, { useState } from "react";
import { FaRegBuilding } from "react-icons/fa";
import { FaBluetooth } from "react-icons/fa";

import "./App.scss";

let bluetoothCharacteristic;

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [gateState, setGateState] = useState("Cerrado");

  const GateState = {
    OPENING: "Abriendo",
    CLOSING: "Cerrando",
    STOPPED: "Detenido",
    OPENED: "Abierto",
    CLOSED: "Cerrado",
  };

  async function connectBluetooth() {
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ name: "BT05" }],
        optionalServices: ["0000ffe0-0000-1000-8000-00805f9b34fb"],
      });
      const server = await device.gatt.connect();
      const service = await server.getPrimaryService(
        "0000ffe0-0000-1000-8000-00805f9b34fb"
      );
      bluetoothCharacteristic = await service.getCharacteristic(
        "0000ffe1-0000-1000-8000-00805f9b34fb"
      );
      
      setIsConnected(true);
      device.addEventListener('gattserverdisconnected', onDisconnected);
    } catch (error) {
      console.error("Error al conectar Bluetooth:", error);
    }
  }

  const onDisconnected = () => {
    setIsConnected(false);
  };

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

  function startSpinner() {
    const spinner = document.querySelector(".spinner");
    spinner.classList.add("active");

    setTimeout(() => {
      spinner.classList.remove("active");
    }, 5000);
  }

  function handleActionClick() {
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
  }

  return (
    <section className="main">
      <div className="header">
        <FaRegBuilding className="header__icon" />
        <h1 className="header__title">Torre Angel</h1>
      </div>
      <h2 className="subheader">Control de Acceso al Parqueadero</h2>
      
      <div className="card">
        <div className="status-container">
          <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}></div>
          <span className="status-text">{isConnected ? 'Conectado' : 'Desconectado'}</span>
        </div>
        <button className="connect-button" onClick={connectBluetooth}>
          <FaBluetooth />
        </button>
      </div>

      <div className="content">
        <button className="circle-button" onClick={handleActionClick}>
          <div className="inner-circle">
            <span className="button-text">{gateState}</span>
            <div className="spinner"></div>
          </div>
        </button>
      </div>
    </section>
  );
}

export default App;