import express from 'express';
import {
  generateQRCode,
  getQRHistory,
  deleteQRCode,
} from '../controllers/qr.controller.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// 🔥 Create QR
router.post('/generate', authMiddleware, generateQRCode);

// 🔥 Get QR history
router.get('/history', authMiddleware, getQRHistory);

// 🔥 Delete QR (IMPORTANT)
router.delete('/:id', authMiddleware, deleteQRCode);

export default router;
