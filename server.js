const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

app.get("/", (req, res) => {
    res.send("Serveur de chat en temps réel");
});

io.on("connection", (socket) => {
    console.log("Nouvel utilisateur connecté");

    // Réception et diffusion des messages
    socket.on("chatMessage", (msg) => {
        io.emit("message", msg);
    });

    socket.on("disconnect", () => {
        console.log("Utilisateur déconnecté");
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
