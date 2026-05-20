const express = require('express');
const postoController = require('../controllers/postoController');
const router = express.Router();

router.get('/postos', postoController.get);
router.post('/postos', postoController.create);
router.patch('/postos/:id', postoController.update);
router.delete('/postos/:id', postoController.destroy);

module.exports = router;
