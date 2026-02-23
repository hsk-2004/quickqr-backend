import prisma from "../prisma.js";
import { generateQR } from '../utils/qrGenerator.js';

/**
 * POST /api/qr/generate
 * Protected
 */
export const generateQRCode = async (req, res) => {
  try {
    console.log('➡️ QR GENERATE HIT');
    const { url, name } = req.body;

    const userId = req.user.userId || req.user.id;
    if (!userId) return res.status(401).json({ message: 'User not authenticated' });
    if (!url) return res.status(400).json({ message: 'URL is required' });

    // 🔥 Generate QR image (base64)
    const imageUrl = await generateQR(url);

    // 🔥 Insert into DB using Prisma
    const qrCode = await prisma.qrCode.create({
      data: {
        userId: parseInt(userId),
        name: name?.trim() || 'Untitled QR',
        url: url.trim(),
        imageUrl: imageUrl
      }
    });

    // 🔄 Map back to snake_case for frontend compatibility
    res.status(201).json({
      ...qrCode,
      image_url: qrCode.imageUrl,
      created_at: qrCode.createdAt,
      user_id: qrCode.userId
    });
  } catch (err) {
    console.error('❌ QR GENERATE ERROR:', err);
    res.status(500).json({ message: 'QR generation failed' });
  }
};

/**
 * GET /api/qr/history
 * Protected
 */
export const getQRHistory = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    if (!userId) return res.status(401).json({ message: 'User not authenticated' });

    // 🔥 Fetch using Prisma
    const history = await prisma.qrCode.findMany({
      where: { userId: parseInt(userId) },
      orderBy: { createdAt: 'desc' }
    });

    // 🔄 Map back to snake_case for frontend compatibility (e.g., History.jsx)
    const mappedHistory = history.map(qr => ({
      ...qr,
      image_url: qr.imageUrl,
      created_at: qr.createdAt,
      user_id: qr.userId
    }));

    res.json(mappedHistory);
  } catch (err) {
    console.error('❌ QR HISTORY ERROR:', err);
    res.status(500).json({ message: 'Failed to load QR history' });
  }
};

/**
 * DELETE /api/qr/:id
 * Protected
 */
export const deleteQRCode = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { id } = req.params;

    if (!userId) return res.status(401).json({ message: 'User not authenticated' });

    // 🔥 Delete using Prisma (ensuring user ownership)
    const deleteResult = await prisma.qrCode.deleteMany({
      where: {
        id: parseInt(id),
        userId: parseInt(userId)
      }
    });

    if (deleteResult.count === 0) {
      return res.status(404).json({ message: 'QR not found or not authorized' });
    }

    res.json({ success: true, id });
  } catch (err) {
    console.error('❌ DELETE QR ERROR:', err);
    res.status(500).json({ message: 'Failed to delete QR' });
  }
};
