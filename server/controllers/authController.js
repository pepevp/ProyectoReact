const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
    try {
        const { nombre_usuario, email, contrasena } = req.body;
        
        // Check if user exists
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const userId = await User.create({ nombre_usuario, email, contrasena });
        
        const token = jwt.sign({ id: userId }, process.env.JWT_SECRET || 'secret_key', { expiresIn: '1h' });

        res.status(201).json({ token, user: { id: userId, nombre_usuario, email, es_premium: 0 } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, contrasena } = req.body;

        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(contrasena, user.contrasena);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret_key', { expiresIn: '1h' });

        res.json({ token, user: { id: user.id, nombre_usuario: user.nombre_usuario, email: user.email, es_premium: user.es_premium } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
