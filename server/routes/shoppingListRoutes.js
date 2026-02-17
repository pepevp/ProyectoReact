const express = require('express');
const router = express.Router();
const shoppingListController = require('../controllers/shoppingListController');
const auth = require('../middleware/authMiddleware');

router.post('/generate', auth, shoppingListController.generateList);
router.get('/', auth, shoppingListController.getList);
router.put('/:id', auth, shoppingListController.togglePurchased);
router.delete('/clear', auth, shoppingListController.clearList); // Must be before /:id to avoid conflict
router.delete('/:id', auth, shoppingListController.deleteItem);

module.exports = router;
