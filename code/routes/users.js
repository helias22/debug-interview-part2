const { Router } = require('express');
const { getUserById, getUsersByOrg, updateUser } = require('../repositories/user-repo');
const { upsertContact } = require('../repositories/contacts-repo');
const { validateUUID, validateEmail } = require('../utils/validators');
const { handleRouteError } = require('../utils/errors');
const { createLogger } = require('../utils/logger');

const log = createLogger('users-route');
const router = Router();

router.get('/', async (req, res) => {
  try {
    const { organizationId } = req.orgContext;
    const users = await getUsersByOrg(organizationId);
    res.json({ data: users });
  } catch (error) {
    handleRouteError(res, error);
  }
});

router.get('/:userId', async (req, res) => {
  try {
    validateUUID(req.params.userId, 'userId');
    const user = await getUserById(req.params.userId);
    res.json({ data: user });
  } catch (error) {
    handleRouteError(res, error);
  }
});

router.patch('/:userId', async (req, res) => {
  try {
    validateUUID(req.params.userId, 'userId');
    const updated = await updateUser(req.params.userId, req.body);
    log.info('User updated via API', { userId: req.params.userId });
    res.json({ data: updated });
  } catch (error) {
    handleRouteError(res, error);
  }
});

router.put('/:userId/contacts', async (req, res) => {
  try {
    validateUUID(req.params.userId, 'userId');
    const { contactType, contactValue, isPrimary } = req.body;
    const contact = await upsertContact(req.params.userId, contactType, contactValue, isPrimary);
    log.info('Contact upserted', { userId: req.params.userId, contactType });
    res.json({ data: contact });
  } catch (error) {
    handleRouteError(res, error);
  }
});

module.exports = router;
