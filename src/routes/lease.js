const express = require('express');
const router = express.Router();
const leaseCtrl = require('../controllers/leaseController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.post('/', authenticate, authorize(['ADMIN','PROPERTY_MANAGER']), leaseCtrl.createLease);
router.get('/', authenticate, leaseCtrl.getLeases); // authorization inside controller

module.exports = router;
