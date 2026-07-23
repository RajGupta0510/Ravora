import { Router } from 'express';
import { UserController } from '../controllers/UserController.js';
import { SettingsController } from '../controllers/SettingsController.js';

const router = Router();

router.get('/profile', UserController.getProfile);
router.put('/profile', UserController.updateProfile);
router.post('/onboard', UserController.completeOnboarding);
router.post('/feedback', UserController.submitFeedback);

// Settings mounted under /user/settings
router.get('/settings', SettingsController.getSettings);
router.post('/settings', SettingsController.updateSettings);

export default router;
