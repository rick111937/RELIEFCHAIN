const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/fraudController');

router.post('/analyze',   ctrl.analyzeProof);
router.get('/registry',   ctrl.getRegistry);
router.get('/stats',      ctrl.getStats);

module.exports = router;
