const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const jwt = require("jsonwebtoken");
const { registerUser, authenticateUser, generateToken, saveMessage, getMessages } = require("./database");

require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.json());
app.use(express.static("public"));

const validateUserData = (username, email, password) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/;
    return username.length >= 3 && emailRegex.test(email) && passwordRegex.test(password);
};

// Route pour l'inscription
app.post("/signup", (req, res) => {
    const { username, email, password } = req.body;
    if (!validateUserData(username, email, password)) {
        return res.status(400).json({ message: "Données invalides" });
    }
    registerUser(username, email, password, (err) => {
        if (err) {
            res.status(400).json({ message: "Échec de l'inscription. L'utilisateur ou l'email existe déjà." });
        } else {
            res.json({ message: "Inscription réussie. Vous pouvez vous connecter." });
        }
    });
});

// Route pour la connexion
app.post("/signin", (req, res) => {
    const { email, password } = req.body;
    authenticateUser(email, password, (err, user) => {
        if (err || !user) {
            res.status(400).json({ message: "Échec de la connexion. Email ou mot de passe incorrect." });
        } else {
            const token = generateToken(user);
            res.json({ message: "Connexion réussie", username: user.username, token });
        }
    });
});

// Middleware pour authentifier les utilisateurs avec les sockets
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) return next(new Error("Authentication error"));
            socket.username = decoded.username;
            next();
        });
    } else {
        next(new Error("Authentication error"));
    }
}).on("connection", (socket) => {
    getMessages((err, messages) => {
        if (!err) socket.emit("load_messages", messages);
    });

    socket.on("send_message", (message) => {
        saveMessage(socket.username, message);
        io.emit("receive_message", { message, sender: socket.username });
    });

    socket.on("typing", () => {
        socket.broadcast.emit("typing", socket.username);
    });

    socket.on("stop_typing", () => {
        socket.broadcast.emit("stop_typing");
    });

    socket.on("disconnect", () => {
        io.emit("user_disconnected", socket.username);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
