const router = require('express').Router();
const { body } = require('express-validator');

const tipsController = require('../controllers/tips');

// GET /tips/
router.get('/', tipsController.getTips);

// GET /tips/:tipID
router.get('/:tipID', tipsController.getTip);

// POST /tips/create
router.post('/create', [
  body('position').trim().isLength({ min: 1, max: 20 }),
  body('shiftType').trim().isLength({ min: 1, max: 20 }),
  body('amount').isFloat({ min: 0, max: 1000000 }),
  body('shiftLength').isFloat({ gt: 0, max: 1000 }),
  body('date').isISO8601()
], tipsController.createTip);

// PUT /tips/:tipID
router.put('/:tipID', [
  body('position').trim().isLength({ min: 1, max: 20 }),
  body('shiftType').trim().isLength({ min: 1, max: 20 }),
  body('amount').isFloat({ min: 0, max: 1000000 }),
  body('shiftLength').isFloat({ gt: 0, max: 1000 }),
  body('date').isISO8601()
], tipsController.updateTip);

// DELETE /tips/:tipID
router.delete('/:tipID', tipsController.deleteTip);

module.exports = router