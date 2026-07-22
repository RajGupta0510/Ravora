import { Router } from 'express';
import { NewsController } from '../controllers/NewsController.js';

const router = Router();

router.get('/latest', NewsController.getLatestNews);
router.get('/search', NewsController.searchNews);
router.get('/categories', NewsController.getCategories);
router.get('/bookmarks', NewsController.getBookmarks);
router.post('/:id/bookmark', NewsController.bookmarkArticle);
router.get('/asset/:symbol', NewsController.getAssetNews);
router.get('/sentiment/:symbol', NewsController.getSentimentSummary);

export default router;
