const Recipe = require('../models/recipeModel');

exports.getRecipes = async (req, res) => {
    try {
        // req.user.id comes from auth middleware
        const userId = req.user.id;
        const recipes = await Recipe.findAllAvailable(userId);
        res.json(recipes);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createRecipe = async (req, res) => {
    try {
        const recipeId = await Recipe.create(req.user.id, req.body);
        res.status(201).json({ message: 'Recipe created', id: recipeId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getRecipeById = async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
        
        const ingredients = await Recipe.getIngredients(req.params.id);
        res.json({ ...recipe, ingredients });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
