const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/predictionController');

router.get('/', ctrl.getAllPredictions);
router.get('/:regionId', ctrl.getRegionPrediction);

module.exports = router;
