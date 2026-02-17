const fs = require('fs');
const mysql = require('mysql2/promise');
const path = require('path');

async function setupDatabase() {
    const config = {
        host: 'localhost',
        user: 'root',
        password: '', // Default XAMPP password
        multipleStatements: true
    };

    try {
        const connection = await mysql.createConnection(config);
        console.log('Connected to MySQL server.');

        const sqlPath = path.join(__dirname, 'database.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Executing SQL script...');
        await connection.query(sql);
        console.log('Database initialized successfully.');

        await connection.end();
    } catch (err) {
        console.error('Error initializing database:', err);
    }
}

setupDatabase();
