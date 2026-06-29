'use strict';
const db      = require('../config/db');
const bcrypt  = require('bcryptjs');
const SALT_ROUNDS = 10;

/* ── Simple in-memory rate limiter (no extra package needed) ── */
const loginAttempts = new Map(); // key: IP, value: { count, firstAttempt }
const MAX_ATTEMPTS  = 10;        // max attempts
const WINDOW_MS     = 15 * 60 * 1000; // 15 min window

function isRateLimited(ip) {
  const now  = Date.now();
  const data = loginAttempts.get(ip);
  if (!data) return false;
  if (now - data.firstAttempt > WINDOW_MS) { loginAttempts.delete(ip); return false; }
  return data.count >= MAX_ATTEMPTS;
}

function recordAttempt(ip) {
  const now  = Date.now();
  const data = loginAttempts.get(ip);
  if (!data || Date.now() - data.firstAttempt > WINDOW_MS) {
    loginAttempts.set(ip, { count: 1, firstAttempt: now });
  } else {
    data.count++;
  }
}

function clearAttempts(ip) { loginAttempts.delete(ip); }

/* ── Render helpers ── */
const renderLogin = (res, message = '') =>
  res.render('pages/login', { title: 'Login', total_items: 0, message, layout: false });

/* ── GET /auth/login ── */
exports.getLogin = (req, res) => renderLogin(res);

/* ── POST /auth/login ── */
exports.postLogin = async (req, res) => {
  const ip       = req.ip || req.connection.remoteAddress || 'unknown';
  const { phone, password } = req.body;

  /* basic input validation */
  if (!phone || !password) return renderLogin(res, 'ফোন নম্বর ও পাসওয়ার্ড দিন।');

  /* rate limit check */
  if (isRateLimited(ip)) {
    return renderLogin(res, 'অনেকবার ভুল চেষ্টা। ১৫ মিনিট পর আবার চেষ্টা করুন।');
  }

  /* sanitize: phone should be digits only */
  const cleanPhone = String(phone).replace(/\D/g, '').slice(0, 20);
  if (cleanPhone.length < 10) return renderLogin(res, 'সঠিক ফোন নম্বর দিন।');

  try {
    const [rows] = await db.execute(
      'SELECT id, phone, password, role FROM users WHERE phone = ? LIMIT 1',
      [cleanPhone]
    );
    const user = rows[0];

    if (!user) {
      recordAttempt(ip);
      return renderLogin(res, 'ফোন নম্বর বা পাসওয়ার্ড ভুল।');
    }

    /* compare password — support both plain (legacy) and bcrypt */
    let match = false;
    if (user.password.startsWith('$2b$') || user.password.startsWith('$2a$')) {
      match = await bcrypt.compare(password, user.password);
    } else {
      /* legacy plain-text — compare then upgrade to bcrypt */
      match = (user.password === password);
      if (match) {
        const hashed = await bcrypt.hash(password, SALT_ROUNDS);
        await db.execute('UPDATE users SET password = ? WHERE id = ?', [hashed, user.id]);
      }
    }

    if (!match) {
      recordAttempt(ip);
      return renderLogin(res, 'ফোন নম্বর বা পাসওয়ার্ড ভুল।');
    }

    /* success */
    clearAttempts(ip);
    req.session.regenerate(err => {
      if (err) return res.status(500).send('Session error');
      req.session.user = { id: user.id, phone: user.phone, role: user.role };
      return res.redirect(user.role === 'admin' ? '/dashboard' : '/');
    });

  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).render('pages/login', {
      title: 'Login', total_items: 0,
      message: 'সার্ভার সমস্যা। আবার চেষ্টা করুন।', layout: false
    });
  }
};

/* ── LOGOUT ── */
exports.logout = (req, res) => {
  req.session.destroy(err => {
    if (err) console.error('Logout error:', err);
    res.clearCookie('connect.sid');
    res.redirect('/auth/login');
  });
};
