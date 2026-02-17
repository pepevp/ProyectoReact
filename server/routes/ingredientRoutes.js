const express = require('express');
const router = express.Router();
const ingredientController = require('../controllers/ingredientController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, ingredientController.getAllIngredients);

module.exports = router;
