const express = require('express');
const externalActivityController = require('../controller/externalActivityController');
const externalApiKey = require('../middleware/externalApiKey');
const { validateExternalActivity } = require('../validator/externalActivityValidator');

const router = express.Router();

router.post('/activity', externalApiKey, validateExternalActivity, externalActivityController.create);

module.exports = router;
