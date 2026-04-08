const express = require('express');
const router = express.Router();
const { getBusinesses, getBusiness, createBusiness, updateBusiness, deleteBusiness } = require('../controllers/business.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate, schemas } = require('../middleware/validate.middleware');

router.use(protect);
router.get('/', getBusinesses);
router.get('/:id', getBusiness);
router.post('/', validate(schemas.business), createBusiness);
router.put('/:id', updateBusiness);
router.delete('/:id', deleteBusiness);

module.exports = router;
