'use strict';
const db   = require('../config/db');
const fs   = require('fs');
const path = require('path');
const { uploadFiles, deleteByUrl, isCloudinaryUrl } = require('../config/cloudinary');

/* ── helpers ──
   Images are now stored on Cloudinary. uploadImages() returns full secure_url
   strings (e.g. https://res.cloudinary.com/...) which are saved directly into
   the products.image_name JSON array. deleteImages() removes them from
   Cloudinary, but still falls back to deleting old local /public/images files
   for any legacy products that still reference a local filename. */
const uploadImages = async (files) => {
  return uploadFiles(files, 'products');
};

const deleteImages = async (images) => {
  for (const img of images || []) {
    if (!img || img === 'default.jpg') continue;
    if (isCloudinaryUrl(img)) {
      await deleteByUrl(img);
    } else {
      const p = path.join(__dirname, '..', 'public', 'images', img);
      if (fs.existsSync(p)) fs.unlinkSync(p);
    }
  }
};

/* ══ DASHBOARD ══ */

exports.getDashboard = async (req, res) => {
  try {
    const [[{totalOrders}]]     = await db.execute('SELECT COUNT(*) AS totalOrders FROM orders');
    const [[{totalProducts}]]   = await db.execute('SELECT COUNT(*) AS totalProducts FROM products');
    const [[{totalRevenue}]]    = await db.execute('SELECT COALESCE(SUM(total),0) AS totalRevenue FROM orders');

    res.render('pages/dashboard', {
      title: 'Dashboard', layout: 'layouts/dashboard',
      totalOrders, totalProducts, totalRevenue
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Database error');
  }
};

/* ══ ADD PRODUCT ══ */
exports.getAddProduct = (req, res) => {
  res.render('pages/addProduct', { title: 'Add Product', layout: 'layouts/dashboard', total_items: 0 });
};

exports.addProduct = async (req, res) => {
  try {
    let { name, description, price, stock, category, custom_category, discounted_price, is_discount_enabled } = req.body;

    // If "Other/Custom" category, use custom input
    const finalCategory = (category === 'custom' && custom_category) ? custom_category.trim() : category;

    const imageNames = await uploadImages(req.files?.images);
    if (!imageNames.length) imageNames.push('default.jpg');

    await db.execute(
      `INSERT INTO products (name,description,price,stock,category,image_name,discounted_price,is_discount_enabled)
       VALUES (?,?,?,?,?,?,?,?)`,
      [name, description, price, stock, finalCategory, JSON.stringify(imageNames),
       discounted_price || null, is_discount_enabled ? 1 : 0]
    );
    res.redirect('/dashboard/products-manage');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

/* ══ EDIT PRODUCT ══ */
exports.getEditProduct = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).send('Product not found');
    res.render('pages/productUpdate', {
      title: 'Edit Product', layout: 'layouts/dashboard',
      product: rows[0], total_items: 0
    });
  } catch (err) { res.status(500).send('DB error'); }
};

exports.editProduct = async (req, res) => {
  const { id } = req.params;
  try {
    let { name, description, regular_price, stock, category, custom_category,
          discounted_price, is_discount_enabled } = req.body;

    const finalCategory = (category === 'custom' && custom_category) ? custom_category.trim() : category;

    const [old] = await db.execute('SELECT image_name FROM products WHERE id=?', [id]);
    if (!old.length) return res.status(404).send('Product not found');
    let oldImages = [];
    try { oldImages = JSON.parse(old[0].image_name || '[]'); } catch {}

    let imageNames = oldImages;
    const newFiles = req.files?.images;
    if (newFiles) {
      await deleteImages(oldImages);
      imageNames = await uploadImages(newFiles);
    }
    if (!imageNames.length) imageNames.push('default.jpg');

    await db.execute(
      `UPDATE products SET name=?,description=?,price=?,stock=?,category=?,
       image_name=?,discounted_price=?,is_discount_enabled=? WHERE id=?`,
      [name, description||'', regular_price||0, stock||0, finalCategory,
       JSON.stringify(imageNames), discounted_price||null,
       is_discount_enabled ? 1 : 0, id]
    );
    res.redirect('/dashboard/products-manage');
  } catch (err) {
    console.error('editProduct error:', err);
    res.status(500).send('Server Error: ' + err.message);
  }
};

/* ══ DELETE PRODUCT ══ */
exports.deleteProduct = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT image_name FROM products WHERE id=?', [req.params.id]);
    if (rows.length) {
      try { await deleteImages(JSON.parse(rows[0].image_name||'[]')); } catch {}
    }
    await db.execute('DELETE FROM products WHERE id=?', [req.params.id]);
    res.redirect('/dashboard/products-manage');
  } catch (err) { res.status(500).send('Error'); }
};

/* ══ ORDERS ══ */
exports.getOrders = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT DISTINCT o.id, o.first_name AS username, o.phone, o.total,
        o.street, o.city, o.district, o.delivery_area, o.created_at,
        o.tracking_code, oi.order_status
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      ORDER BY o.created_at DESC
    `);
    res.render('pages/orders', { orders: rows, title: 'Orders', layout: 'layouts/dashboard' });
  } catch (err) { res.status(500).send('DB error'); }
};

exports.getOrdersDetails = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT oi.id AS order_item_id, oi.order_id, oi.product_id,
        p.name AS product_name, p.image_name,
        oi.quantity, oi.price, (oi.quantity * oi.price) AS total_price
      FROM order_items oi
      INNER JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?`, [req.params.id]);
    res.render('pages/orderDetails', {
      orderItems: rows, orderId: req.params.id,
      title: 'Order Details', layout: 'layouts/dashboard', total_items: 0
    });
  } catch (err) { res.status(500).send('Error'); }
};

/* ══ UPDATE ORDER STATUS ══ */
exports.UpdateOrderStatus = async (req, res) => {
  try {
    const { order_status } = req.body;
    await db.execute('UPDATE order_items SET order_status=? WHERE order_id=?',
      [order_status, req.params.id]);
    res.redirect('/dashboard/orders');
  } catch (err) { res.status(500).send('Error'); }
};

/* ══ PRODUCT MANAGE ══ */
exports.getProductManage = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM products ORDER BY id ASC');
    res.render('pages/productManage', {
      title: 'Manage Products', products: rows,
      total_items: 0, layout: 'layouts/dashboard'
    });
  } catch (err) { res.status(500).send('DB error'); }
};

/* ══ REVIEWS (admin approve) ══ */
exports.getReviews = async (req, res) => {
  try {
    const [reviews] = await db.execute(`
      SELECT r.*, p.name AS product_name
      FROM product_reviews r
      LEFT JOIN products p ON r.product_id = p.id
      ORDER BY r.created_at DESC
    `);
    res.render('pages/reviews', { reviews, title: 'Reviews', layout: 'layouts/dashboard' });
  } catch (err) { res.status(500).send('DB error'); }
};

exports.approveReview = async (req, res) => {
  try {
    await db.execute('UPDATE product_reviews SET is_approved=1 WHERE id=?', [req.params.id]);
    res.redirect('/dashboard/reviews');
  } catch (err) { res.status(500).send('DB error'); }
};

exports.deleteReview = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT image_name FROM product_reviews WHERE id=?', [req.params.id]);
    const img = rows[0]?.image_name;
    if (img) {
      if (isCloudinaryUrl(img)) {
        await deleteByUrl(img);
      } else {
        const p = path.join(__dirname, '..', 'public', 'images', img);
        if (fs.existsSync(p)) fs.unlinkSync(p);
      }
    }
    await db.execute('DELETE FROM product_reviews WHERE id=?', [req.params.id]);
    res.redirect('/dashboard/reviews');
  } catch (err) { res.status(500).send('DB error'); }
};
