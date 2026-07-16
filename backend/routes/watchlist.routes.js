import { Router } from 'express';
import { WatchlistController } from '../controllers/WatchlistController.js';

const router = Router();

router.get('/', WatchlistController.getWatchlist);
router.post('/', WatchlistController.addSymbol);
router.delete('/:symbol', WatchlistController.removeSymbol);

export default router;
