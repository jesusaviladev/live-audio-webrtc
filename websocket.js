export const createWebSocket = (url) => {
  const socket = new WebSocket(url);

  socket.onopen = function (e) {
    console.log('[open] Conexión establecida');
  };

  socket.onmessage = function (event) {
    console.log(`[message] Datos recibidos del servidor: ${event.data}`);
  };

  socket.onclose = function (event) {
    if (event.wasClean) {
      console.log(
        `[close] Conexión cerrada limpiamente, código=${event.code} motivo=${event.reason}`
      );
    } else {
      console.log('[close] La conexión se cayó');
    }
  };

  socket.onerror = function (error) {
    console.log(`[error] ${error.message}`);
  };

  return socket;
};
