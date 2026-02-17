const ShoppingList = require('../models/shoppingListModel');

exports.generateList = async (req, res) => {
    try {
        const { startDate, endDate } = req.body;
        const list = await ShoppingList.generate(req.user.id, startDate, endDate);
        res.json(list);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getList = async (req, res) => {
    try {
        const list = await ShoppingList.getList(req.user.id);
        res.json(list);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.togglePurchased = async (req, res) => {
    try {
        const { bought } = req.body;
        await ShoppingList.togglePurchased(req.user.id, req.params.id, bought);
        res.json({ message: 'Updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.deleteItem = async (req, res) => {
    try {
        await ShoppingList.deleteItem(req.user.id, req.params.id);
        res.json({ message: 'Item removed' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.clearList = async (req, res) => {
    try {
        await ShoppingList.clearAll(req.user.id);
        res.json({ message: 'List cleared' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
