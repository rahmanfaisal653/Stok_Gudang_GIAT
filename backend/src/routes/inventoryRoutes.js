const express = require('express');
const inventoryController = require('../controllers/inventoryController');

const router = express.Router();

router.get('/', (req, res, next) => {
  if (req.query.action !== 'getData') {
    return res.status(400).json({ success: false, error: 'Unknown action' });
  }

  return inventoryController.getData(req, res, next);
});

router.post('/', inventoryController.handleAction);

module.exports = router;
