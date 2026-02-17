const db = require('../config/db');

class MealPlan {
    static async getWeeklyPlan(userId, startDate, endDate) {
        const [rows] = await db.execute(
            `SELECT ps.*, r.titulo, r.url_imagen 
             FROM planificacion_semanal ps 
             JOIN recetas r ON ps.receta_id = r.id 
             WHERE ps.usuario_id = ? AND ps.fecha BETWEEN ? AND ?`,
            [userId, startDate, endDate]
        );
        return rows;
    }

    static async addMeal(userId, recipeId, date, mealType) {
        const [result] = await db.execute(
            'INSERT INTO planificacion_semanal (usuario_id, receta_id, fecha, tipo_comida) VALUES (?, ?, ?, ?)',
            [userId, recipeId, date, mealType]
        );
        return result.insertId;
    }

    static async removeMeal(userId, mealId) {
        const [result] = await db.execute(
            'DELETE FROM planificacion_semanal WHERE id = ? AND usuario_id = ?',
            [mealId, userId]
        );
        return result.affectedRows;
    }
}

module.exports = MealPlan;
