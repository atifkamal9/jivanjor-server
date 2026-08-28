import { Router } from 'express';
import { pinCodeController } from '../controllers/pincode.controller';

const router = Router();

router.get('/', (req, res) => pinCodeController.getPinCodes(req, res));
router.post('/', (req, res) => pinCodeController.replacePinCodes(req, res));
router.post('/replace', (req, res) => pinCodeController.replacePinCodes(req, res));

export default router;
