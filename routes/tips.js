const router = require('express').Router();

const tipsController = require('../controllers/tips');

// GET /tips/
router.get('/', tipsController.getTips);

// GET /tips/:tipID
router.get('/:tipID', tipsController.getTip);

// POST /tips/create
router.post('/create', tipsController.createTip);

// PUT /tips/:tipID
router.put('/:tipID', tipsController.updateTip);

// DELETE /tips/:tipID
router.delete('/:tipID', tipsController.deleteTip);

module.exports = router