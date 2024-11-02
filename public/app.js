const socket = io();

const loginContainer = document.getElementById("login-container");
const chatContainer = document.getElementById("chat-container");
const messagesContainer = document.getElementById("messages");
const typingIndicator = document.getElementById("typing-indicator");
const messageInput = document.getElementById("message-input");

// Gestion de la connexion
document.getElementById("login-form").addEventListener("submit", function (e) {
    e.preventDefault();
    const username = document.getElementById("username-input").value.trim();
    const email = document.getElementById("email-input").value.trim();
    const password = document.getElementById("password-input").value.trim();

    if (username && email && password) {
        socket.emit("join", { username, email, password });
        loginContainer.style.display = "none";
        chatContainer.style.display = "flex";
    }
});

// Envoi de message avec limite de longueur
document.getElementById("message-form").addEventListener("submit", function (e) {
    e.preventDefault();
    const message = messageInput.value;
    if (message && message.length <= 250) {  // Limite à 250 caractères
        socket.emit("message", message);
        displayMessage(message, "receiver");
        messageInput.value = "";
        socket.emit("stopTyping");
    } else {
        alert("Le message est trop long.");
    }
});

// Indicateur de saisie avec délai
let typingTimeout;
messageInput.addEventListener("input", () => {
    socket.emit("typing");
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        socket.emit("stopTyping");
    }, 1000);  // Arrête l'indicateur après 1 seconde d'inactivité
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

// Réception des erreurs d'authentification
socket.on("authError", function (errorMsg) {
    alert(errorMsg);
    loginContainer.style.display = "flex";
    chatContainer.style.display = "none";
});

// Affiche un message avec style
function displayMessage(msg, type) {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message", type);
    messageElement.textContent = msg;
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}
