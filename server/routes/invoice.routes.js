const express = require('express');
const router = express.Router();
const { getInvoices, getInvoice, createInvoice, updateInvoice, deleteInvoice, recordPayment, getInvoiceStats } = require('../controllers/invoice.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate, schemas } = require('../middleware/validate.middleware');

router.use(protect);
router.get('/stats', getInvoiceStats);
router.get('/', getInvoices);
router.get('/:id', getInvoice);
router.post('/', validate(schemas.invoice), createInvoice);
router.put('/:id', updateInvoice);
router.delete('/:id', deleteInvoice);
router.post('/:id/payment', recordPayment);

module.exports = router;
