const db = require('./config/db');
const bcrypt = require('bcryptjs');

async function updatePassword() {
    try {
        const password = '123456';
        const hashedPassword = await bcrypt.hash(password, 10);
        
        await db.execute('UPDATE usuarios SET contrasena = ? WHERE email = ?', [hashedPassword, 'jose@test.com']);
        
        console.log('Password updated for jose@test.com');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

updatePassword();
