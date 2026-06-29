'use strict';
const express        = require('express');
const session        = require('express-session');
const path           = require('path');
const dotenv         = require('dotenv');
const expressLayouts = require('express-ejs-layouts');
const fileUpload     = require('express-fileupload');
const moment         = require('moment-timezone');

dotenv.config();

const app  = express();
const port = process.env.PORT || 3000;

/* ── Security headers (no helmet needed) ── */
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

/* ── Body parsers ── */
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

/* ── Static files ── */
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1d',
  etag:   true
}));

/* ── Session (secure) ── */
app.use(session({
  secret:            process.env.SESSION_SECRET || require('crypto').randomBytes(32).toString('hex'),
  resave:            false,
  saveUninitialized: false,
  name:              'lbsid',          // don't expose default 'connect.sid'
  cookie: {
    httpOnly: true,                    // JS cannot access cookie
    secure:   process.env.NODE_ENV === 'production', // HTTPS in prod
    sameSite: 'lax',
    maxAge:   7 * 24 * 60 * 60 * 1000 // 7 days
  }
}));

/* ── File upload ── */
app.use(fileUpload({
  limits:         { fileSize: 5 * 1024 * 1024 }, // 5MB max
  abortOnLimit:   true,
  safeFileNames:  true,
  preserveExtension: true
}));

app.use(expressLayouts);

/* ── EJS ── */
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layouts/main');

/* ── Global locals ── */
app.use((req, res, next) => {
  res.locals.formatTime = (date, fmt = 'YYYY-MM-DD HH:mm:ss') =>
    moment(date).tz('Asia/Dhaka').format(fmt);
  res.locals.searchBar = 'hidden';
  res.locals.phone     = req.session.user ? req.session.user.phone : '';
  next();
});

/* ── Routes ── */
const authRoutes      = require('./routes/authRoutes');
const productRoutes   = require('./routes/productRoutes');
const cartRoutes      = require('./routes/cartRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const homeRoutes      = require('./routes/homeRoutes');

app.use('/',          homeRoutes);
app.use('/auth',      authRoutes);
app.use('/products',  productRoutes);
app.use('/cart',      cartRoutes);
app.use('/dashboard', dashboardRoutes);

/* ── 404 handler ── */
app.use((req, res) => {
  res.status(404).render('pages/home', {
    title: '404 - পাওয়া যায়নি',
    phone: res.locals.phone
  });
});

/* ── Error handler ── */
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).send('সার্ভার সমস্যা হয়েছে।');
});

/* ── Start ── */
app.listen(port, () => {
  console.log(`✅ Server running → http://localhost:${port}`);
});
