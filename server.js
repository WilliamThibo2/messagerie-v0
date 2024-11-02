const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const bodyParser = require("body-parser");
const { registerUser, authenticateUser } = require("./database");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Route d'inscription
app.post("/signup", (req, res) => {
    const { username, email, password } = req.body;
    registerUser(username, email, password, (err) => {
        if (err) {
            res.status(400).json({ message: "Échec de l'inscription. L'utilisateur ou l'email existe déjà." });
        } else {
            res.json({ message: "Inscription réussie. Vous pouvez vous connecter." });
        }
    });
});

// Route de connexion
app.post("/signin", (req, res) => {
    const { email, password } = req.body;
    authenticateUser(email, password, (err, user) => {
        if (err || !user) {
            res.status(400).json({ message: "Échec de la connexion. Email ou mot de passe incorrect." });
        } else {
            res.json({ message: "Connexion réussie", username: user.username });
        }
    });
});

// Connexion à Socket.IO
io.on("connection", (socket) => {
    console.log("Un utilisateur est connecté");

    socket.on("join", (username) => {
        socket.username = username;
        io.emit("message", `${socket.username} a rejoint le chat`);
    });

    socket.on("message", (msg) => {
        io.emit("message", `${socket.username}: ${msg}`);
    });

    socket.on("typing", () => {
        socket.broadcast.emit("typing", socket.username);
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
