const socket = io({ auth: { token: localStorage.getItem("token") } });

const messageSound = new Audio("message-sound.mp3");
const typingSound = new Audio("typing-sound.mp3");
const loginContainer = document.getElementById("login-container");
const chatContainer = document.getElementById("chat-container");
const messagesContainer = document.getElementById("messages");
const typingIndicator = document.getElementById("typing-indicator");

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
        if (data.token) {
            localStorage.setItem("token", data.token);
            socket.emit("join", { username: data.username });
            loginContainer.style.display = "none";
            chatContainer.style.display = "flex";
        } else {
            alert(data.message);
        }
    }
});

function displayMessage(msg, type) {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message", type);

    const avatar = document.createElement("div");
    avatar.classList.add("avatar");
    avatar.textContent = msg.charAt(0).toUpperCase();

    messageElement.appendChild(avatar);
    messageElement.textContent = msg;
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

socket.on("message", (msg) => {
    messageSound.play();
    displayMessage(msg, "sender");
});

socket.on("typing", (username) => {
    typingIndicator.textContent = `${username} est en train de taper...`;
    typingSound.play();
});
