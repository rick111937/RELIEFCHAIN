const express = require('express');
const router = express.Router();
const oracleController = require('../controllers/oracleController');

router.post('/trigger/:regionId', oracleController.triggerPreRelease);

module.exports = router;
