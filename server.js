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

    // Gestion de l'authentification avec pseudonyme, e-mail, et mot de passe
    socket.on("join", (userData) => {
        if (userData.username && userData.email && userData.password) {
            socket.username = userData.username; // Associe le pseudonyme à la connexion
            io.emit("message", `${socket.username} a rejoint le chat`);
        } else {
            socket.emit("authError", "Les informations de connexion sont incomplètes.");
        }
    });

    socket.on("message", (msg) => {
        // Émet le message avec seulement le pseudonyme de l'utilisateur
        io.emit("message", `${socket.username}: ${msg}`);
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
