'use strict';
const db = require('../config/db');

/* ── helpers ── */
const toBengali2English = (str) => {
  if (!str) return str;
  const bn = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
  let s = String(str);
  bn.forEach((d, i) => { s = s.replace(new RegExp(d, 'g'), i); });
  return s;
};

const genTracking = (id) =>
  'LBD-' + String(id).padStart(5,'0') + '-' +
  Math.random().toString(36).substring(2,5).toUpperCase();

/* ── Ensure tracking_code column exists (auto-migrate) ── */
const ensureTrackingCol = async () => {
  try {
    await db.execute(`
      ALTER TABLE orders
      ADD COLUMN IF NOT EXISTS tracking_code VARCHAR(30) DEFAULT NULL
    `);
  } catch (e) {
    /* MariaDB/MySQL < 10.x fallback — column may already exist */
    if (!e.message.includes('Duplicate column')) {
      console.warn('tracking_code column note:', e.message);
    }
  }
};
ensureTrackingCol(); // run once on startup

/* ══ POST /cart/add  (checkout submit) ══ */
exports.postAddToCart = async (req, res) => {
  try {
    const {
      firstName, street, city, district, phone,
      payment, cartItems, totalAmount, deliveryCharge, deliveryArea
    } = req.body;

    /* validation */
    if (!cartItems || !cartItems.length)
      return res.status(400).json({ error: 'কার্ট খালি।' });
    if (!firstName || !street || !city || !district || !phone)
      return res.status(400).json({ error: 'সব তথ্য পূরণ করুন।' });

    const cleanPhone = toBengali2English(phone).replace(/\D/g, '').slice(0, 15);
    const total      = parseFloat(totalAmount) || 0;
    const delivery   = deliveryArea === 'dhaka' ? 80 : 130;

    /* 1 — insert order */
    const [orderResult] = await db.execute(
      `INSERT INTO orders
         (user_id, first_name, street, city, district, phone,
          payment_method, total, delivery_area)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [cleanPhone, firstName.trim(), street.trim(), city.trim(),
       district.trim(), cleanPhone,
       payment || 'ক্যাশ অন ডেলিভারি', total, deliveryArea || 'unknown']
    );

    const orderId = orderResult.insertId;

    /* 2 — insert order items */
    for (const item of cartItems) {
      await db.execute(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES (?, ?, ?, ?)`,
        [orderId, item.id, item.quantity, parseFloat(item.price)]
      );
    }

    /* 3 — generate & save tracking code (graceful if column missing) */
    let trackingCode = null;
    try {
      trackingCode = genTracking(orderId);
      await db.execute(
        'UPDATE orders SET tracking_code = ? WHERE id = ?',
        [trackingCode, orderId]
      );
    } catch (trackErr) {
      console.warn('Could not save tracking code:', trackErr.message);
      /* order still placed, tracking just won't work until migration */
    }

    return res.status(200).json({
      text: 'Order placed successfully.',
      orderId,
      trackingCode: trackingCode || ('ORD-' + orderId)
    });

  } catch (err) {
    console.error('Checkout Error:', err);
    return res.status(500).json({ error: 'সার্ভার সমস্যা: ' + err.message });
  }
};

/* ══ GET /cart ══ */
exports.getCartItems = (req, res) => {
  res.render('pages/cart', {
    phone: req.session.user ? req.session.user.phone : ''
  });
};

/* ══ Get cart count (used in session) ══ */
exports.getCartCount = async (userId) => {
  try {
    const [rows] = await db.execute(
      'SELECT COALESCE(SUM(quantity),0) AS total FROM cart_items WHERE user_id = ?',
      [userId]
    );
    return parseInt(rows[0].total) || 0;
  } catch { return 0; }
};

/* ══ POST /cart/delete ══ */
exports.deleteCartItem = async (req, res) => {
  try {
    const userId = req.session?.user?.id;
    if (!userId) return res.json({ success: false, message: 'Not logged in' });
    await db.execute(
      'DELETE FROM cart_items WHERE user_id = ? AND product_id = ?',
      [userId, req.body.product_id]
    );
    req.session.totalItems = await exports.getCartCount(userId);
    res.redirect('back');
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: 'Database error' });
  }
};
