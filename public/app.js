const socket = io();

const loginContainer = document.getElementById("login-container");
const chatContainer = document.getElementById("chat-container");
const messagesContainer = document.getElementById("messages");
const typingIndicator = document.getElementById("typing-indicator");
const messageInput = document.getElementById("message-input");

// Gestion de l'inscription
document.getElementById("signup-form").addEventListener("submit", async function (e) {
    e.preventDefault();
    const username = document.getElementById("signup-username").value.trim();
    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value.trim();

    if (username && email && password) {
        const response = await fetch("/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password })
        });
        const data = await response.json();
        alert(data.message); // Affiche le message du serveur
    }
});

// Gestion de la connexion
document.getElementById("signin-form").addEventListener("submit", async function (e) {
    e.preventDefault();
    const email = document.getElementById("signin-email").value.trim();
    const password = document.getElementById("signin-password").value.trim();

    if (email && password) {
        const response = await fetch("/signin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (data.username) {
            socket.emit("join", { username: data.username });
            loginContainer.style.display = "none";
            chatContainer.style.display = "flex";
        } else {
            alert(data.message);
        }
    }
});

// Envoi de message
document.getElementById("message-form").addEventListener("submit", function (e) {
    e.preventDefault();
    const message = messageInput.value.trim();
    if (message) {
        socket.emit("message", message);
        displayMessage(message, "receiver");
        messageInput.value = "";
        socket.emit("stopTyping");
    }
});

// Indicateur de saisie
messageInput.addEventListener("input", () => {
    socket.emit("typing");
});

socket.on("typing", (username) => {
    typingIndicator.textContent = `${username} est en train de taper...`;
});

socket.on("stopTyping", () => {
    typingIndicator.textContent = "";
});

// Réception des messages
socket.on("message", (msg) => {
    displayMessage(msg, "sender");
});

// Affiche un message avec style
function displayMessage(msg, type) {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message", type);
    messageElement.textContent = msg;
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}
