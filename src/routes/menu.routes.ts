import { Router } from 'express';
import { MenuController } from '../controllers/menu.controller';

const router = Router();

// Header Menu Routes
router.get('/header', MenuController.getHeaderMenu);
router.put('/header', MenuController.updateHeaderMenu);
router.post('/header/publish', MenuController.publishHeaderMenu);
router.post('/header/reset', MenuController.resetHeaderMenu);

// Footer Menu Routes
router.get('/footer', MenuController.getFooterMenu);
router.put('/footer', MenuController.updateFooterMenu);
router.post('/footer/publish', MenuController.publishFooterMenu);
router.post('/footer/reset', MenuController.resetFooterMenu);

export default router;
