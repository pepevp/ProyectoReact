const Ingredient = require('../models/ingredientModel');

exports.getAllIngredients = async (req, res) => {
    try {
        const ingredients = await Ingredient.findAll();
        res.json(ingredients);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
