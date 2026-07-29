import { Router } from 'express';
import { SettingController } from '../controllers/setting.controller';

const router = Router();

router.get('/', SettingController.getSettings);
router.put('/', SettingController.updateSettings);

export default router;
