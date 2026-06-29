const db = require('../config/db');
const XLSX = require('xlsx');


/** ---------------- HOME ROUTE ---------------- */
exports.getHome = async (req, res) => {
  try {
   //// const db = req.app.locals.db;
    const [rows] = await db.execute('SELECT * FROM products LIMIT 12');
    const totalItems = req.session.totalItems || 0;

    res.render('pages/home', { 
      title: "Products",
      products: rows,
      total_items: totalItems,
      searchBar: 'hidden',
      phone: req.session.user ? req.session.user.phone : ''
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
};


/** ---------------- SEARCH ---------------- */
exports.searchProducts = async (req, res) => {
  // If browser request (no XHR header), render search results page
  const wantsJson = req.headers.accept?.includes("application/json") || req.headers["x-requested-with"] === "XMLHttpRequest";
  const q = (req.query.q || "").trim();
  if (!wantsJson) {
    return res.render("pages/searchResults", {
      title: "সার্চ ফলাফল - " + q,
      phone: req.session.user ? req.session.user.phone : ""
    });
  }
  try {
  //// const db = req.app.locals.db;
    let result;

    if (!q || q.toLowerCase() === "null") {
      result = await db.execute(
        "SELECT * FROM products ORDER BY popularity DESC LIMIT 12"
      );
    } else {
      result = await db.execute(
        "SELECT * FROM products WHERE name LIKE ? ORDER BY id DESC LIMIT 12",
        [`%${q}%`]
      );
    }

    res.json(result[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Search failed" });
  }
};


/** ---------------- CONTACT ---------------- */
exports.getContact = (req, res) => {

  const totalItems = req.session.totalItems || 0;

  res.render("pages/contact", {
    title: "Contact Us",
    total_items: totalItems,
    success: null
  });

};


exports.submitMessage = async (req, res) => {
 //// const db = req.app.locals.db;
  const { name, email, comment } = req.body;
  const totalItems = req.session.totalItems || 0;

  try {

    await db.execute(
      'INSERT INTO user_details(name, email, comment) VALUES(?,?,?)',
      [name, email, comment]
    );

    res.render('pages/contact', {
      title: "Contact Us",
      total_items: totalItems,
      success: 'ধন্যবাদ! আপনার বার্তা সফলভাবে পাঠানো হয়েছে।'
    });

  } catch (err) {

    console.error(err);

    res.render('pages/contact', {
      title: "Contact Us",
      total_items: totalItems,
      success: 'দুঃখিত! তথ্য সংরক্ষণ করতে সমস্যা হয়েছে।'
    });

  }
};


/** ---------------- NEWSLETTER ---------------- */
exports.subscribeNewsletter = async (req, res) => {

  const { email } = req.body;
 //// const db = req.app.locals.db;

  if (!email)
    return res.status(400).json({ message: 'Email is required' });

  try {

    await db.execute(
      'INSERT INTO newsletter_subscribers(email) VALUES(?)',
      [email]
    );

    res.json({ message: 'Subscribed successfully' });

  } catch (err) {

    if (err.code === 'ER_DUP_ENTRY')
      return res.status(400).json({ message: 'Email already subscribed' });

    console.error(err);

    res.status(500).json({ message: 'Server error' });

  }
};


/** ---------------- CHECKOUT PAGE ---------------- */
exports.getCheckout = async (req, res) => {
 //// const db = req.app.locals.db;

  const totalItems = req.session.totalItems || 0;
  const userId = req.session.user ? req.session.user.id : null;
  let cartItems = [];

  if (userId) {

    const [rows] = await db.execute(
      'SELECT product_id, quantity FROM cart_items WHERE user_id = ?',
      [userId]
    );

    cartItems = rows;
  }

  res.render("pages/checkout", {
    title: "Checkout",
    total_items: totalItems,
    user_id: userId,
    cart_items: cartItems
  });

};


/** ---------------- PLACE ORDER ---------------- */
exports.postCheckout = async (req, res) => {

   //// const db = req.app.locals.db;
  const {
    userId, email, firstName, lastName,
    country, street, city, district,
    phone, payment, deliveryArea
  } = req.body;

  req.session.checkoutInfo = req.body;

  try {

    const [cartItems] = await db.execute(
      `SELECT ci.product_id, ci.quantity, p.price
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = ?`,
      [userId]
    );

    if (cartItems.length === 0)
      return res.status(400).send("Cart is empty");

    const total = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity, 0
    );

    const [orderResult] = await db.execute(
      `INSERT INTO orders 
      (user_id,email,first_name,last_name,country,street,city,district,phone,payment_method,total,delivery_area)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [userId, email, firstName, lastName, country, street, city, district, phone, payment, total, deliveryArea]
    );

    const orderId = orderResult.insertId;

    req.session.checkoutInfo.orderId = orderId;

    for (const item of cartItems) {

      await db.execute(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?,?,?,?)',
        [orderId, item.product_id, item.quantity, item.price]
      );

    }

    await db.execute(
      'DELETE FROM cart_items WHERE user_id = ?',
      [userId]
    );

    res.redirect('/order-success');

  } catch (err) {

    console.error(err);
    res.status(500).send("Checkout failed");

  }
};


/** ---------------- ORDER SUCCESS ---------------- */
exports.getOrderSuccess = (req, res) => {
 //// const db = req.app.locals.db;

  const totalItems = req.session.totalItems || 0;
  const checkoutInfo = req.session.checkoutInfo || {};

  delete req.session.checkoutInfo;

  res.render("pages/orderSuccess", {
    title: "Order Success",
    total_items: totalItems,
    order: checkoutInfo
  });

};


/** ---------------- ORDER TRACKING PAGE ---------------- */
exports.getOrdersTracking = (req, res) => {

   //// const db = req.app.locals.db;
  res.render("pages/ordersTracking", {
    title: "Order Tracking",
    orders: null,
    trackingCode: '',
    phone: '',
    error: null
  });

};


/** ---------------- TRACK ORDER (by tracking code OR phone number) ---------------- */
exports.postOrdersTracking = async (req, res) => {
  const { trackingCode, phone } = req.body;

  const renderPage = (orders, error) => res.render('pages/ordersTracking', {
    title: 'Order Tracking',
    orders: orders || null,
    error: error || null,
    trackingCode: trackingCode || '',
    phone: phone || ''
  });

  const hasCode  = trackingCode && trackingCode.trim() !== '';
  const hasPhone = phone && phone.replace(/\D/g, '').length >= 6;

  if (!hasCode && !hasPhone) {
    return renderPage(null, 'ট্র্যাকিং কোড বা ফোন নম্বর দিন।');
  }

  try {
    const baseSelect = `
      SELECT o.id, o.first_name, o.phone, o.street, o.city, o.district,
             o.payment_method, o.total, o.delivery_area, o.created_at,
             o.tracking_code, oi.product_id, oi.quantity, oi.price, oi.order_status,
             p.name AS product_name
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id`;

    let rows;
    if (hasCode) {
      const code = trackingCode.trim().toUpperCase();
      [rows] = await db.execute(
        `${baseSelect} WHERE o.tracking_code = ? ORDER BY o.created_at DESC`,
        [code]
      );
    } else {
      // Phone numbers are stored in different formats (+8801..., 8801..., 01...).
      // Match on the last 10 digits (the core BD mobile number) so any format works.
      const last10 = phone.replace(/\D/g, '').slice(-10);
      [rows] = await db.execute(
        `${baseSelect} WHERE RIGHT(REGEXP_REPLACE(o.phone, '[^0-9]', ''), 10) = ? ORDER BY o.created_at DESC`,
        [last10]
      );
    }

    if (!rows.length) {
      return renderPage(null, hasCode
        ? 'এই ট্র্যাকিং কোডে কোনো অর্ডার পাওয়া যায়নি।'
        : 'এই ফোন নম্বরে কোনো অর্ডার পাওয়া যায়নি।');
    }

    // Group the joined rows back into one object per order (an order can have many items)
    const grouped = {};
    const orderIds = [];
    rows.forEach(r => {
      if (!grouped[r.id]) {
        grouped[r.id] = {
          id: r.id, first_name: r.first_name, phone: r.phone, street: r.street,
          city: r.city, district: r.district, payment_method: r.payment_method,
          total: r.total, delivery_area: r.delivery_area, created_at: r.created_at,
          tracking_code: r.tracking_code, order_status: r.order_status, items: []
        };
        orderIds.push(r.id);
      }
      grouped[r.id].items.push({
        product_id: r.product_id,
        product_name: r.product_name,
        quantity: r.quantity,
        price: r.price
      });
    });

    renderPage(orderIds.map(id => grouped[id]));
  } catch (err) {
    console.error(err);
    res.status(500).send('Tracking failed');
  }
};


/** ---------------- THANK YOU PAGE ---------------- */
exports.getThankYou = (req, res) => {
  const { orderId, trackingCode } = req.query;
  res.render("pages/thank-you", {
    title: "Thank You",
    orderId: orderId || null,
    trackingCode: trackingCode || null,
    orderItems: []
  });
};


/* ---------------- Download Excel ---------------- */

exports.downloadExcel = async (req, res) => {

  try {

    const [rows] = await db.query(`
      SELECT 
          o.id AS order_id,
          o.first_name AS customer_name,
          o.phone,
          o.street,
          o.city,
          o.district,
          o.delivery_area,
          p.name AS product_name,
          oi.quantity,
          oi.price
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      ORDER BY o.id
    `);

    const ordersMap = {};

    rows.forEach(row => {

      if (!ordersMap[row.order_id]) {

        const deliveryCharge =
          row.delivery_area === 'dhaka' ? 80 : 130;

        ordersMap[row.order_id] = {
          order_id: row.order_id,
          customer_name: row.customer_name,
          phone: row.phone,
          street: row.street,
          city: row.city,
          district: row.district,
          delivery_area: row.delivery_area,
          delivery_charge: deliveryCharge,
          products: [],
          total: 0
        };
      }

      ordersMap[row.order_id].products.push({
        product_name: row.product_name,
        quantity: row.quantity,
        price: row.price
      });

      ordersMap[row.order_id].total +=
        row.quantity * row.price;
    });

    Object.values(ordersMap).forEach(order => {
      order.total += order.delivery_charge;
    });

    const excelRows = [];

    Object.values(ordersMap).forEach(order => {

      order.products.forEach((p, index) => {

        excelRows.push({
          Order_ID: index === 0 ? order.order_id : "",
          Customer_Name: index === 0 ? order.customer_name : "",
          Phone: index === 0 ? order.phone : "",
          Street: index === 0 ? order.street : "",
          City: index === 0 ? order.city : "",
          District: index === 0 ? order.district : "",
          Delivery_Area: index === 0 ? order.delivery_area : "",
          Product_Name: p.product_name,
          Quantity: p.quantity,
          Price: p.price,
          Delivery_Charge: index === 0 ? order.delivery_charge : "",
          Total: index === 0 ? order.total : ""
        });

      });

    });

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelRows);

    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

    const buffer = XLSX.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx'
    });

    res.setHeader(
      'Content-Disposition',
      'attachment; filename=orders.xlsx'
    );

    res.send(buffer);

  } catch (err) {
    console.error(err);
    res.status(500).send('Database Error');
  }
};


exports.getSubscribers = async (req, res) => {

  try {

    const [rows] = await db.query(`
      SELECT 
        id,
        email,
        subscribed_at
      FROM newsletter_subscribers
      ORDER BY subscribed_at DESC
    `);

    res.render('pages/subscribers', {
      subscribers: rows,
      layout: 'layouts/dashboard',
      title: 'Subscribers'
    });

  } catch (err) {

    console.error(err);

    res.status(500).send('Error fetching subscribers');
  }
};
