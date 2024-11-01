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

// Gestion des événements socket.io
io.on("connection", (socket) => {
    console.log("Un utilisateur est connecté");

    // Écouter l'événement de message envoyé par le client
    socket.on("message", (msg) => {
        // Envoyer le message à tous les clients connectés
        io.emit("message", msg);
    });

    // Déconnexion de l'utilisateur
    socket.on("disconnect", () => {
        console.log("Un utilisateur s'est déconnecté");
    });
});

// Démarrer le serveur
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
