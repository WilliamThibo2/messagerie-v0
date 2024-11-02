const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");

const db = new sqlite3.Database("./users.db", (err) => {
    if (err) console.error("Erreur de connexion à la base de données :", err);
    else console.log("Base de données SQLite connectée.");
});

// Crée la table utilisateurs si elle n'existe pas
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            email TEXT UNIQUE,
            password TEXT
        )
    `);
});

// Fonction pour enregistrer un nouvel utilisateur
const registerUser = (username, email, password, callback) => {
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) return callback(err);
        db.run(
            `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`,
            [username, email, hash],
            callback
        );
    });
};

// Fonction pour vérifier les informations de connexion
const authenticateUser = (email, password, callback) => {
    db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
        if (err) return callback(err);
        if (!user) return callback(null, false); // Utilisateur non trouvé
        bcrypt.compare(password, user.password, (err, res) => {
            if (res) callback(null, user); // Succès
            else callback(null, false); // Mot de passe incorrect
        });
    });
};

module.exports = { registerUser, authenticateUser };
