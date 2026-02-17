const db = require('../config/db');

class Ingredient {
    static async findAll() {
        const [rows] = await db.execute('SELECT * FROM ingredientes ORDER BY nombre');
        return rows;
    }
}

module.exports = Ingredient;
