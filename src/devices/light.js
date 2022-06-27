const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);



app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    console.log('a user connected');
    io.emit('light_on', 'true');
    io.emit('door_locked', 1, 'true');
    io.emit('true', 'door_locked', 'kitchen');
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});







// /**
//  * Configure Express.js parsing middleware
//  */
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));


// var lights = {1: true} // true=on false=off

// app.get('lights/:id', async (req, res) => {
//     res.status(200).json({
//         id: req.params.id,
//         status: lights[req.params.id]
//     });
// });

// app.post('lights/:id/turnon', async (req, res) => {
//     lights[req.params.id] = true
//     res.status(201).send();
// });


// /* Default 404 handler */
// app.use((req, res) => {
//     res.status(404);
//     res.json({ error: 'Not found' });
// });

// const port = process.env.PORT || 8081;

// app.listen(port, () => {
//     console.log(`Server listening on port ${port}`);
// });
