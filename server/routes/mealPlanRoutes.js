const express = require('express');
const router = express.Router();
const mealPlanController = require('../controllers/mealPlanController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, mealPlanController.getPlan);
router.post('/', auth, mealPlanController.addMeal);
router.delete('/:id', auth, mealPlanController.removeMeal);

module.exports = router;
