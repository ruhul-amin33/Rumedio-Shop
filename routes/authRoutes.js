const express = require('express');
const router = express.Router();
const { getLogin, postLogin, logout } = require('../controllers/authController');

router.get('/login', getLogin);
router.get('/register', getLogin);
router.post('/login', postLogin);
router.post('/logout', logout);



module.exports = router;
