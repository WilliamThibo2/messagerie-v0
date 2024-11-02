// Initialisation du serveur
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

// Configuration du serveur Express
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Servir les fichiers statiques (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Routage de la page d'accueil
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Gestion des connexions WebSocket
io.on('connection', (socket) => {
    console.log('Nouvel utilisateur connecté');

    // Stocker le nom de l'utilisateur pour cette session socket
    socket.on('login', (username) => {
        socket.username = username;
        io.emit('user_connected', username);
    });

    // Envoi de message
    socket.on('send_message', (message) => {
        io.emit('receive_message', {
            message: message,
            sender: socket.username
        });
    });

    // Indicateur de frappe
    socket.on('typing', () => {
        socket.broadcast.emit('typing', socket.username);
    });

    socket.on('stop_typing', () => {
        socket.broadcast.emit('stop_typing');
    });

    // Déconnexion de l'utilisateur
    socket.on('disconnect', () => {
        if (socket.username) {
            io.emit('user_disconnected', socket.username);
        }
    });
});

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});

