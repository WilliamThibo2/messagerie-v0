const socket = io();

document.getElementById("message-form").addEventListener("submit", function (e) {
    e.preventDefault();
    const messageInput = document.getElementById("message-input");
    const message = messageInput.value;
    if (message) {
        socket.emit("message", message); // Envoie le message au serveur
        messageInput.value = ""; // Efface le champ de saisie
    }
});

socket.on("message", function (msg) {
    const messageElement = document.createElement("div");
    messageElement.textContent = msg;
    document.getElementById("messages").appendChild(messageElement);
});
