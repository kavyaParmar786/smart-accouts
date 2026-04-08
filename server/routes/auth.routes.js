const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile, changePassword, switchBusiness } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate, schemas } = require('../middleware/validate.middleware');

router.post('/register', validate(schemas.register), register);
router.post('/login', validate(schemas.login), login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.put('/switch-business/:businessId', protect, switchBusiness);

module.exports = router;
