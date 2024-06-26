import express from 'express';
const router = express.Router();
import upload from '../upload/multerConfig.js';

import { registerUser, sendOtpMail, authUser,logoutUser,submitKycVerification } from '../controller/userController.js';

router.post('/', registerUser);
router.post('/login', authUser);
router.post('/send-otp-mail', sendOtpMail);
router.post('/logout', logoutUser);
router.post('/kyc', upload.single('idProofImage'), submitKycVerification);


export default router;
