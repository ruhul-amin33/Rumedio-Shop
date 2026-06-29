const express = require('express');
const router = express.Router();
const {UpdateOrderStatus,getProductManage, getAddProduct, getDashboard,addProduct, deleteProduct, getEditProduct, editProduct, getOrders, getOrdersDetails} = require('../controllers/dashboardController');

const { isLoggedIn } = require('../middlewares/authMiddleware');

router.use(isLoggedIn); // Apply the middleware to all routes in this router meaning

router.get('/', getDashboard);  
router.get('/products-add', getAddProduct);
router.post('/products-add', addProduct);

router.get('/orders', getOrders);
router.post('/update-order-status/:id', UpdateOrderStatus);


router.get('/order-details/:id', getOrdersDetails);
router.get('/products-manage', getProductManage);

router.post('/products-delete/:id', deleteProduct);

router.get('/products-edit/:id', getEditProduct);
router.post('/products-edit/:id', editProduct);


// Reviews
const {getReviews, approveReview, deleteReview} = require('../controllers/dashboardController');
router.get('/reviews', getReviews);
router.post('/reviews/approve/:id', approveReview);
router.post('/reviews/delete/:id', deleteReview);

module.exports = router;
