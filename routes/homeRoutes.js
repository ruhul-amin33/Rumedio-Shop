'use strict';
const express = require('express');
const router  = express.Router();

const {
  getHome, downloadExcel, getSubscribers,
  searchProducts, getContact, submitMessage,
  subscribeNewsletter, getCheckout, postCheckout,
  getOrderSuccess, getOrdersTracking, postOrdersTracking,
  getThankYou
} = require('../controllers/homeController');

const { postReview, getProductReviews } = require('../controllers/reviewController');

router.get('/',               getHome);
router.get('/search',         searchProducts);
router.get('/download-excel', downloadExcel);
router.get('/subscribers',    getSubscribers);

router.get('/contact',        getContact);
router.post('/submit-msg',    submitMessage);

router.post('/subscribe',     subscribeNewsletter);

router.post('/reviews/submit',      postReview);
router.get('/reviews/:productId',   getProductReviews);

router.get('/checkout',       getCheckout);
router.post('/checkout',      postCheckout);

router.get('/order-success',  getOrderSuccess);

router.get('/orders-tracking',  getOrdersTracking);
router.post('/ordersTracking',  postOrdersTracking);

router.get('/thank-you',      getThankYou);

module.exports = router;
