const express = require('express');
const router  = express.Router();
const { getMembers, inviteMember, updateMemberRole, removeMember, getMyBusinesses } = require('../controllers/team.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.get('/',                  getMembers);
router.get('/my-businesses',     getMyBusinesses);
router.post('/invite',           inviteMember);
router.put('/:userId/role',      updateMemberRole);
router.delete('/:userId',        removeMember);

module.exports = router;
