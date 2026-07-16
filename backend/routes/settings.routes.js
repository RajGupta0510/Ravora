import { Router } from 'express';
import { SettingsController } from '../controllers/SettingsController.js';

const router = Router();

router.get('/', SettingsController.getSettings);
router.put('/', SettingsController.updateSettings);

export default router;
