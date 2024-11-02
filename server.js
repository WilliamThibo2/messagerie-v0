const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

io.on("connection", (socket) => {
    console.log("Un utilisateur est connecté");

    socket.on("join", (userData) => {
        if (userData.username && userData.email && userData.password) {
            socket.username = userData.username;
            io.emit("message", `${socket.username} a rejoint le chat`);
        } else {
            socket.emit("authError", "Les informations de connexion sont incomplètes.");
        }
    });

    socket.on("message", (msg) => {
        if (socket.username && msg.length <= 250) {  // Limite de longueur du message côté serveur
            io.emit("message", `${socket.username}: ${msg}`);
        }
    });

    socket.on("typing", () => {
        if (socket.username) {
            socket.broadcast.emit("typing", socket.username);
        }
    });

    socket.on("stopTyping", () => {
        socket.broadcast.emit("stopTyping");
    });

    socket.on("disconnect", () => {
        if (socket.username) {
            io.emit("message", `${socket.username} a quitté le chat`);
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
