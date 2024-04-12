import http from 'node:http';
import WebSocket, { WebSocketServer } from 'ws';

const server = http.createServer();
const wss = new WebSocketServer({ server });

const clients = new Set();

const SIGNALS = {
  CALLS: {
    OFFERS: [],
    CANDIDATES: [],
  },
  RESPONSES: {
    ANSWERS: [],
    CANDIDATES: [],
  },
};

wss.on('connection', (ws) => {
  clients.add(ws);
  // ws.send('Conectado al servidor WebSockets');

  ws.on('message', (message) => {
    const parsedMessage = JSON.parse(message.toString());

    if (parsedMessage.type === 'offerCandidates') {
      SIGNALS.CALLS.CANDIDATES.push(parsedMessage);

      for (let client of clients) {
        if (client.readyState === WebSocket.OPEN && client !== ws) {
          client.send(JSON.stringify(parsedMessage));
        }
      }
    }

    if (parsedMessage.type === 'offer') {
      SIGNALS.CALLS.OFFERS.push(parsedMessage);
      // Reenvía el mensaje a todos los clientes conectados
      // excepto  el origen

      for (let client of clients) {
        if (client.readyState === WebSocket.OPEN && client !== ws) {
          client.send(JSON.stringify(parsedMessage));
        }
      }
    }

    if (parsedMessage.type === 'answerCandidates') {
      SIGNALS.RESPONSES.CANDIDATES.push(parsedMessage);

      for (let client of clients) {
        if (client.readyState === WebSocket.OPEN && client !== ws) {
          client.send(JSON.stringify(parsedMessage));
        }
      }
    }

    if (parsedMessage.type === 'answer') {
      SIGNALS.RESPONSES.ANSWERS.push(parsedMessage);
      // Reenvía el mensaje a todos los clientes conectados
      // excepto  el origen

      for (let client of clients) {
        if (client.readyState === WebSocket.OPEN && client !== ws) {
          client.send(JSON.stringify(parsedMessage));
        }
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
