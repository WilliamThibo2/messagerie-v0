const socket = io();

// Gestion du formulaire de connexion
document.getElementById("login-form").addEventListener("submit", function (e) {
    e.preventDefault();
    const usernameInput = document.getElementById("username-input");
    const username = usernameInput.value.trim();
    if (username) {
        socket.emit("join", username); // Envoie le pseudonyme au serveur
        document.getElementById("login-container").style.display = "none";
        document.getElementById("chat-container").style.display = "flex";
    }
});

// Gestion de l'envoi de message
document.getElementById("message-form").addEventListener("submit", function (e) {
    e.preventDefault();
    const messageInput = document.getElementById("message-input");
    const message = messageInput.value;
    if (message) {
        socket.emit("message", message); // Envoie le message au serveur
        messageInput.value = ""; // Efface le champ de saisie
    }
});

// Réception des messages
socket.on("message", function (msg) {
    const messageElement = document.createElement("div");
    messageElement.textContent = msg;
    document.getElementById("messages").appendChild(messageElement);
});
