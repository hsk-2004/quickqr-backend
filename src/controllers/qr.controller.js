import prisma from "../prisma.js";
import { generateQR } from '../utils/qrGenerator.js';

/**
 * POST /api/qr/generate
 * Protected
 */
export const generateQRCode = async (req, res) => {
  try {
    console.log('➡️ QR GENERATE HIT');
    console.log('🔐 JWT USER:', req.user);
    console.log('📦 BODY:', req.body);

    const { url, name } = req.body;

    // ✅ Always read correct user id from JWT
    const userId = req.user.userId || req.user.id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (!url) {
      return res.status(400).json({ message: 'URL is required' });
    }

    // 🔥 Generate QR image (base64)
    const imageUrl = await generateQR(url);

    // 🔥 Insert into DB
    const result = await pool.query(
      `INSERT INTO qr_codes (user_id, name, url, image_url)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, name?.trim() || 'Untitled QR', url.trim(), imageUrl]
    );

    res.status(201).json(result.rows[0]);
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

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const result = await pool.query(
      `SELECT *
       FROM qr_codes
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    res.json(result.rows);
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

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const result = await pool.query(
      `DELETE FROM qr_codes
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, userId]
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ message: 'QR not found or not authorized' });
    }

    res.json({ success: true, id });
  } catch (err) {
    console.error('❌ DELETE QR ERROR:', err);
    res.status(500).json({ message: 'Failed to delete QR' });
  }
};
