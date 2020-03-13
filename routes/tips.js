const router = require('express').Router();
const { body } = require('express-validator');

const tipsController = require('../controllers/tips');
const isAuth = require('../middleware/isAuth');

// GET /tips/
router.get('/', isAuth, tipsController.getTips);

// GET /tips/download
router.get('/download', isAuth, tipsController.getTipsFile);

// GET /tips/:tipID
router.get('/:tipID', isAuth, tipsController.getTip);

// POST /tips/create
router.post(
  '/create',
  isAuth,
  [
    body('position').trim().isLength({ min: 1, max: 20 }),
    body('shiftType').trim().isLength({ min: 1, max: 20 }),
    body('amount').isFloat({ min: 0, max: 1000000 }),
    body('shiftLength').isFloat({ gt: 0, max: 1000 }),
    body('date').isISO8601()
  ], 
  tipsController.createTip
);

// PUT /tips/:tipID
router.put(
  '/:tipID', 
  isAuth,
  [
    body('position').trim().isLength({ min: 1, max: 20 }),
    body('shiftType').trim().isLength({ min: 1, max: 20 }),
    body('amount').isFloat({ min: 0, max: 1000000 }),
    body('shiftLength').isFloat({ gt: 0, max: 1000 }),
    body('date').isISO8601()
  ], 
  tipsController.updateTip
);

// POST /tips/upload
router.post('/upload', isAuth, tipsController.convertFileToTips);

// DELETE /tips/:tipID
router.delete('/:tipID', isAuth, tipsController.deleteTip);

module.exports = router