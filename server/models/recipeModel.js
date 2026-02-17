const db = require('../config/db');

class Recipe {
    static async findAllAvailable(userId) {
        // Uses the VIEW created in SQL script
        const [rows] = await db.execute('SELECT * FROM vista_recetas_disponibles WHERE espectador_id = ?', [userId]);
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.execute('SELECT * FROM recetas WHERE id = ?', [id]);
        return rows[0];
    }

    static async getIngredients(recipeId) {
        const [rows] = await db.execute(
            `SELECT i.nombre, ir.cantidad, ir.unidad 
             FROM ingredientes_receta ir 
             JOIN ingredientes i ON ir.ingrediente_id = i.id 
             WHERE ir.receta_id = ?`,
            [recipeId]
        );
        return rows;
    }

    static async create(userId, recipeData) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const { titulo, instrucciones, porciones, ingredientes } = recipeData;

            // 1. Insert Recipe
            const [res] = await connection.execute(
                'INSERT INTO recetas (titulo, instrucciones, porciones, usuario_id, es_sistema) VALUES (?, ?, ?, ?, FALSE)',
                [titulo, instrucciones, porciones || 1, userId]
            );
            const recipeId = res.insertId;

            // 2. Process Ingredients
            if (ingredientes && ingredientes.length > 0) {
                for (const ing of ingredientes) {
                    // Check if ingredient exists, or insert it (simple approach: insert ignore or select first)
                    // For simplicity, let's try to find it first.
                    let [existing] = await connection.execute('SELECT id FROM ingredientes WHERE nombre = ?', [ing.nombre]);
                    let ingredientId;

                    if (existing.length > 0) {
                        ingredientId = existing[0].id;
                    } else {
                        const [newIng] = await connection.execute('INSERT INTO ingredientes (nombre, categoria_id) VALUES (?, NULL)', [ing.nombre]);
                        ingredientId = newIng.insertId;
                    }

                    // Link ingredient to recipe
                    await connection.execute(
                        'INSERT INTO ingredientes_receta (receta_id, ingrediente_id, cantidad, unidad) VALUES (?, ?, ?, ?)',
                        [recipeId, ingredientId, ing.cantidad, ing.unidad]
                    );
                }
            }

            await connection.commit();
            return recipeId;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
}

module.exports = Recipe;
