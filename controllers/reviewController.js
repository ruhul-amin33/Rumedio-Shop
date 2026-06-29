'use strict';
const db   = require('../config/db');
const { uploadFile } = require('../config/cloudinary');

exports.postReview = async (req, res) => {
  try {
    const { product_id, reviewer_name, phone, rating, comment } = req.body;
    if (!product_id || !reviewer_name || !rating)
      return res.status(400).json({ ok: false, message: 'সব তথ্য পূরণ করুন।' });

    let image_name = null;
    if (req.files?.review_image) {
      image_name = await uploadFile(req.files.review_image, 'reviews');
    }

    await db.execute(
      `INSERT INTO product_reviews (product_id, reviewer_name, phone, rating, comment, image_name, is_approved)
       VALUES (?,?,?,?,?,?,0)`,
      [product_id, reviewer_name.trim(), phone||null, parseInt(rating)||5, comment?.trim()||null, image_name]
    );

    res.json({ ok: true, message: 'রিভিউ সফলভাবে জমা হয়েছে! অনুমোদনের পর প্রকাশিত হবে।' });
  } catch (err) {
    console.error('Review error:', err);
    res.status(500).json({ ok: false, message: 'সার্ভার সমস্যা।' });
  }
};

exports.getProductReviews = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT id, reviewer_name, rating, comment, image_name, created_at
       FROM product_reviews WHERE product_id=? AND is_approved=1
       ORDER BY created_at DESC`,
      [req.params.productId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json([]);
  }
};
