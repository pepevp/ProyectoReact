const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const auth = require('../middleware/authMiddleware');

router.post('/', auth, recipeController.createRecipe);
router.get('/', auth, recipeController.getRecipes);
router.get('/:id', auth, recipeController.getRecipeById);

module.exports = router;
