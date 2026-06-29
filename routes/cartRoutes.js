
const express = require('express');
const router = express.Router();
const pool = require('../config/db'); 
const { postAddToCart } = require('../controllers/cartController');
const { getCartItems } = require('../controllers/cartController');
const { deleteCartItem } = require('../controllers/cartController');

const { isLoggedIn } = require('../middlewares/authMiddleware');


router.post('/add',  postAddToCart);
router.get('/',  getCartItems);
router.post('/delete', deleteCartItem);
module.exports = router;
