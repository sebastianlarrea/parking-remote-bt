import React, { useState } from "react";

import { FaRegBuilding } from "react-icons/fa";
import { FaBluetooth } from "react-icons/fa";

import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

import "./App.scss";

function App() {
  const [snackbar, setSnackbar] = useState({ show: false, message: "" });
  const [isConnected, setIsConnected] = useState(false);
  const [bluetoothDevice, setBluetoothDevice] = useState(null);
  const [gateState, setGateState] = useState("Cerrado");

  const GateState = {
    OPENING: "Abriendo",
    CLOSING: "Cerrando",
    STOPPED: "Detenido",
    OPENED: "Abierto",
    CLOSED: "Cerrado",
  };

  async function connectBluetooth() {
    if (isConnected) {
      bluetoothDevice.server.disconnect();
      return setIsConnected(false);
    }

    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ name: "BT05" }],
        optionalServices: ["0000ffe0-0000-1000-8000-00805f9b34fb"],
      });
      const server = await device.gatt.connect();
      const service = await server.getPrimaryService(
        "0000ffe0-0000-1000-8000-00805f9b34fb"
      );
      const bluetoothCharacteristic = await service.getCharacteristic(
        "0000ffe1-0000-1000-8000-00805f9b34fb"
      );

      setBluetoothDevice(bluetoothCharacteristic);
      setIsConnected(true);
      device.addEventListener("gattserverdisconnected", onDisconnected);
    } catch (error) {
      return null;
    } 
  }

  const onDisconnected = () => {
    setIsConnected(false);
  };

  async function sendGateAction() {
    if (!bluetoothDevice) {
      setSnackbar({ show: true, message: "No se ha conectado a ningún dispositivo Bluetooth" });
      return;
    }

    const activateHash = "6ed6f8d519d6c5e733";
    const encoder = new TextEncoder();

    try {
      await bluetoothDevice.writeValue(encoder.encode(activateHash));
    } catch (error) {
      setSnackbar({ show: true, message: "Error al enviar la acción al dispositivo Bluetooth" });
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
    if (!isConnected) {
      return setSnackbar({ show: true, message: "Debes conectarte al bluetooth para poder ejecutar este tipo de acciones" });
    }

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
    <main className="main">
      <header className="header">
        <FaRegBuilding className="header__icon" />
        <h1 className="header__title">Torre Angel</h1>
      </header>
      <h2 className="subheader">Control de Acceso al Parqueadero</h2>

      <div className="card">
        <div className="status-container">
          <div
            className={`status-indicator ${
              isConnected ? "connected" : "disconnected"
            }`}
          ></div>
          <span className="status-text">
            {isConnected ? "Conectado" : "Desconectado"}
          </span>
        </div>
        <button className="connect-button" onClick={connectBluetooth}>
          <span className="connect-button__text">{!isConnected ? 'Conectar' : 'Desconectar'}</span>
          <FaBluetooth className="connect-button__icon" />
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

      <footer className="footer">
        <p className="footer__text">By <strong>Sebastián Larrea</strong></p>
      </footer>

      <Snackbar
        open={snackbar.show}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ show: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="error"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </main>
  );
}

export default App;
