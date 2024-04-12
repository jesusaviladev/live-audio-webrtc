import http from 'node:http';
import WebSocket, { WebSocketServer } from 'ws';

const server = http.createServer((request, response) => {
  // Este servidor solo maneja conexiones WebSocket
  // En proyectos reales, también tendrías que manejar otras solicitudes HTTP
});

const wss = new WebSocketServer({ server });

const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);

  ws.on('message', (message) => {
    console.log(message, 'from client');
    // Reenvía el mensaje a todos los clientes conectados
    for (let client of clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message.toString());
      }
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
  });
});

const port = 8080;

server.listen(port, () => {
  console.log(`Servidor WebSocket escuchando en http://localhost:${port}`);
});
