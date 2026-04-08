const express = require('express');
const router = express.Router();
const { getTransactions, getTransaction, createTransaction, updateTransaction, deleteTransaction, getSummary } = require('../controllers/transaction.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate, schemas } = require('../middleware/validate.middleware');

router.use(protect);
router.get('/summary', getSummary);
router.get('/', getTransactions);
router.get('/:id', getTransaction);
router.post('/', validate(schemas.transaction), createTransaction);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

module.exports = router;
