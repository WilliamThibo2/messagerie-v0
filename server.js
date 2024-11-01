const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Servir les fichiers statiques du dossier public
app.use(express.static(path.join(__dirname, "public")));

// Point d'entrée principal
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Configuration de Socket.io
io.on("connection", (socket) => {
    console.log("Un utilisateur est connecté");

    socket.on("message", (msg) => {
        io.emit("message", msg); // Diffuse le message à tous les utilisateurs connectés
    });

    socket.on("disconnect", () => {
        console.log("Un utilisateur est déconnecté");
    });
});

// Démarrer le serveur
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
