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
    return username.length >= 3 && emailRegex.test(email) && password.length >= 6;
};

app.post("/signup", (req, res) => {
    const { username, email, password } = req.body;
    console.log("Signup request:", username, email); // log de débogage
    if (!validateUserData(username, email, password)) {
        return res.status(400).json({ message: "Données invalides" });
    }
    registerUser(username, email, password, (err) => {
        if (err) {
            console.error("Signup error:", err); // log de l'erreur
            res.status(400).json({ message: "Échec de l'inscription. L'utilisateur ou l'email existe déjà." });
        } else {
            res.json({ message: "Inscription réussie. Vous pouvez vous connecter." });
        }
    });
});

app.post("/signin", (req, res) => {
    const { email, password } = req.body;
    console.log("Signin request:", email); // log de débogage
    authenticateUser(email, password, (err, user) => {
        if (err || !user) {
            console.error("Signin error:", err); // log de l'erreur
            res.status(400).json({ message: "Échec de la connexion. Email ou mot de passe incorrect." });
        } else {
            const token = generateToken(user);
            res.json({ message: "Connexion réussie", username: user.username, token });
        }
    });
});

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
    getMessages((err, rows) => {
        if (!err) {
            rows.forEach(row => {
                socket.emit("message", `${row.username}: ${row.message}`);
            });
        }
    });

    socket.on("message", (msg) => {
        saveMessage(socket.username, msg);
        io.emit("message", `${socket.username}: ${msg}`);
    });

    socket.on("typing", () => {
        socket.broadcast.emit("typing", socket.username);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
