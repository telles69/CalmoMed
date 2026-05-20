const express = require('express');
const userController = require('../controllers/userController');
const router = express.Router();

router.get('/users', userController.get);
router.post('/users', userController.create);
router.patch('/users/:id', userController.update);
router.delete('/users/:id', userController.destroy);

module.exports = router;
