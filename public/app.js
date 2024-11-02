const socket = io();

// Gestion du formulaire de connexion
document.getElementById("login-form").addEventListener("submit", function (e) {
    e.preventDefault();
    const username = document.getElementById("username-input").value.trim();
    const email = document.getElementById("email-input").value.trim();
    const password = document.getElementById("password-input").value.trim();

    if (username && email && password) {
        socket.emit("join", { username, email, password }); // Envoie les infos de connexion au serveur
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

// Réception des erreurs d'authentification
socket.on("authError", function (errorMsg) {
    alert(errorMsg); // Affiche une alerte avec le message d'erreur
    document.getElementById("login-container").style.display = "flex";
    document.getElementById("chat-container").style.display = "none";
});
