const db = require('../config/db');

class ShoppingList {
    static async generate(userId, startDate, endDate) {
        // Call the stored procedure
        await db.query('CALL generar_lista_semanal(?, ?, ?)', [userId, startDate, endDate]);
        return this.getList(userId);
    }

    static async getList(userId) {
        const [rows] = await db.execute(
            `SELECT lc.*, i.nombre 
             FROM lista_compra lc 
             JOIN ingredientes i ON lc.ingrediente_id = i.id 
             WHERE lc.usuario_id = ?`,
            [userId]
        );
        return rows;
    }

    static async togglePurchased(userId, listId, bought) {
        const [result] = await db.execute(
            'UPDATE lista_compra SET comprado = ? WHERE id = ? AND usuario_id = ?',
            [bought, listId, userId]
        );
        return result.affectedRows;
    }

    static async addManualItem(userId, ingredientId, quantity, unit) {
        const [result] = await db.execute(
            'INSERT INTO lista_compra (usuario_id, ingrediente_id, cantidad_total, unidad, es_manual) VALUES (?, ?, ?, ?, TRUE)',
            [userId, ingredientId, quantity, unit]
        );
        return result.insertId;
    }
    static async deleteItem(userId, listId) {
        const [result] = await db.execute(
            'DELETE FROM lista_compra WHERE id = ? AND usuario_id = ?',
            [listId, userId]
        );
        return result.affectedRows;
    }

    static async clearAll(userId) {
        const [result] = await db.execute(
            'DELETE FROM lista_compra WHERE usuario_id = ?',
            [userId]
        );
        return result.affectedRows;
    }
}

module.exports = ShoppingList;
