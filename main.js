require('dotenv').config({ path: `${__dirname}/.env.dev` });

const http = require('http');
const { Server } = require('socket.io');
const express = require('express');

const app = express();

const httpServer = http.createServer(app);
const io = new Server(httpServer);
httpServer.listen(process.env.PORT_HTTP, () => console.log(`[HTTP] Listening on port ${process.env.PORT_HTTP}`));

app.use('/three', express.static(__dirname + '/node_modules/three'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/app/index.html');
});

app.get('/app-script', (req, res) => {
    res.sendFile(__dirname + '/app/index.js');
});

io.on('connection', (socket) => {
    console.log(`[SOCKET] New socket <${socket.id}>`);
    socket.on('update-position', (x, y) => {
        io.fetchSockets().then(sockets => {
            const clientSockets = sockets.filter(s => s.handshake.address === socket.handshake.address && s.id !== socket.id);
            clientSockets.forEach(s => {
                s.emit('position-change', x, y, socket.id);
            });
        });
    });
    socket.on('disconnect', () => {
        io.fetchSockets().then(sockets => {
            const clientSockets = sockets.filter(s => s.handshake.address === socket.handshake.address && s.id !== socket.id);
            clientSockets.forEach(s => {
                s.emit('client-disconnect', socket.id);
            });
        });
    });
});