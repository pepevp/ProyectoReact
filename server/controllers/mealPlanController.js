const MealPlan = require('../models/mealPlanModel');

exports.getPlan = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            return res.status(400).json({ message: 'Start and end dates are required' });
        }
        const plan = await MealPlan.getWeeklyPlan(req.user.id, startDate, endDate);
        res.json(plan);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.addMeal = async (req, res) => {
    try {
        const { recipeId, date, mealType } = req.body;
        const id = await MealPlan.addMeal(req.user.id, recipeId, date, mealType);
        res.status(201).json({ id, ...req.body });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.removeMeal = async (req, res) => {
    try {
        await MealPlan.removeMeal(req.user.id, req.params.id);
        res.json({ message: 'Meal removed' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
