const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public"))); // Sert le dossier public

// Route principale
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

io.on("connection", (socket) => {
    console.log("Un utilisateur est connecté");

    // Gestion de l'authentification avec username
    socket.on("join", (username) => {
        socket.username = username; // Associe un pseudonyme à la connexion
        io.emit("message", `${username} a rejoint le chat`);
    });

    socket.on("message", (msg) => {
        // Émet le message avec le pseudonyme de l'utilisateur
        io.emit("message", `${socket.username}: ${msg}`);
    });

    socket.on("disconnect", () => {
        console.log("Un utilisateur s'est déconnecté");
        if (socket.username) {
            io.emit("message", `${socket.username} a quitté le chat`);
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
