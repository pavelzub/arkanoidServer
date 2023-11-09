import http from 'http';
import { WebSocketServer } from 'ws';
import express from 'express';
import { nanoid } from 'nanoid';

const app = express();

const server = http.createServer(app);

const webSocketServer = new WebSocketServer({ server });

let players = {};

function updatePlayerInfo(data, id) {
    players[id] = data;

    const message = JSON.stringify({ event: "PLAYERS_UPDATE", players: players });
    webSocketServer.clients.forEach(client => client.send(message));
}

const dispatchEvent = (message, ws, id) => {
    try {
        const data = JSON.parse(message);
        switch (data.event) {
            case "PLAYER_INFO_UPDATE": 
                updatePlayerInfo(data.position, id)
                break;
            default: 
                ws.send((new Error("Wrong query")).message);
        }
    } catch (e) {
        ws.send((new Error("Джейсон говна")).message);
    }
    
}

webSocketServer.on('connection', ws => {
    const playerId = nanoid();
    ws.on('message', m => dispatchEvent(m, ws, playerId));
    ws.on("error", e => ws.send(e));
    ws.on("close", e => delete players[playerId]);

    ws.send(JSON.stringify({ event: "PLAYER_ID", id: playerId }));
});

server.listen(8999, () => console.log("Server started"))
