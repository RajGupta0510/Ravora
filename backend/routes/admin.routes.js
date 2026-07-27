import { Router } from 'express';
import { AdminController } from '../controllers/AdminController.js';
import { authorizeAdmin } from '../middleware/authorize.js';

const router = Router();

// Secure admin diagnostic metrics using authorizeAdmin middleware
router.get('/diagnostics', authorizeAdmin, AdminController.getDiagnostics);

export default router;
