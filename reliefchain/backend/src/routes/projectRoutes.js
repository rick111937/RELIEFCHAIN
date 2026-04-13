const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');

router.get('/', projectController.getAll);
router.get('/:id', projectController.getById);
router.post('/', projectController.create);

module.exports = router;
