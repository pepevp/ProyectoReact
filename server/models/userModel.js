const db = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
    static async findByEmail(email) {
        const [rows] = await db.execute('SELECT * FROM usuarios WHERE email = ?', [email]);
        return rows[0];
    }

    static async findById(id) {
        const [rows] = await db.execute('SELECT * FROM usuarios WHERE id = ?', [id]);
        return rows[0];
    }

    static async create(userData) {
        const { nombre_usuario, email, contrasena } = userData;
        const hashedPassword = await bcrypt.hash(contrasena, 10);
        
        const [result] = await db.execute(
            'INSERT INTO usuarios (nombre_usuario, email, contrasena) VALUES (?, ?, ?)',
            [nombre_usuario, email, hashedPassword]
        );
        return result.insertId;
    }
}

module.exports = User;
