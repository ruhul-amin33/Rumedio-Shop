const express = require('express');
const router = express.Router();
const { getAllProducts,  getProductById, get_AllProducts, post_AllProducts} = require('../controllers/productController');

router.get('/', getAllProducts); // homepage
router.get('/category/:name', get_AllProducts); //product page
router.post('/category/:name', post_AllProducts);
router.get('/:id', getProductById);



module.exports = router;
