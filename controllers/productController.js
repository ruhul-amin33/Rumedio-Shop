const db = require('../config/db');
const XLSX = require('xlsx');

exports.getAllProducts = async (req, res) => {
  //const db = req.app.locals.db;

  try {
    const [rows] = await db.execute('SELECT * FROM products');
    res.render('pages/product', { products: rows, title: 'Products', total_items: req.session.totalItems });
  } catch (err) {
    console.error(err);
    res.send('Error fetching products');
  }
};

exports.getProductById = async (req, res) => {
  //const db = req.app.locals.db;
  const productId = req.params.id;  

  try {
    const [rows] = await db.execute('SELECT * FROM products WHERE id = ?', [productId]);
    if (rows.length === 0) {
      return res.status(404).send('Product not found');
    }
    res.render('pages/product', { product: rows[0], title: 'Product Details', total_items: req.session.totalItems });
  } catch (err) {
    console.error(err);
    res.send('Error fetching product');
  }
};

exports.get_AllProducts = async (req, res) => {
  //const db = req.app.locals.db;

  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;

    // Get min & max price from DB
    const [minPriceResult] = await db.execute('SELECT MIN(discounted_price) AS min FROM products');
    const [maxPriceResult] = await db.execute('SELECT MAX(discounted_price) AS max FROM products');

    const min = parseInt(req.query.min) || Math.floor(minPriceResult[0].min);
    const max = parseInt(req.query.max) || Math.ceil(maxPriceResult[0].max);

    const sort = (req.query.sort || 'DEFAULT').toUpperCase();
    const categoryName = req.params.name || 'all';

    // Store min/max/sort in session
    req.session.min = min;
    req.session.max = max;
    req.session.sort = sort;

    // console.log(min, max, sort, categoryName);

    // Count total items
    const countQuery = categoryName === 'all'
      ? 'SELECT COUNT(*) AS count FROM products WHERE discounted_price BETWEEN ? AND ?'
      : 'SELECT COUNT(*) AS count FROM products WHERE category = ? AND discounted_price BETWEEN ? AND ?';
    const countValues = categoryName === 'all' ? [min, max] : [categoryName, min, max];
    const [countResult] = await db.execute(countQuery, countValues);
    const totalItems = parseInt(countResult[0].count);

    // Determine order
    const orderBy = sort === 'ASC' ? 'discounted_price ASC' :
                    sort === 'DESC' ? 'discounted_price DESC' : 'popularity DESC';

    // Fetch products with pagination
    const query = categoryName === 'all'
      ? `SELECT * FROM products WHERE discounted_price BETWEEN ? AND ? ORDER BY ${orderBy} LIMIT ? OFFSET ?`
      : `SELECT * FROM products WHERE category = ? AND discounted_price BETWEEN ? AND ? ORDER BY ${orderBy} LIMIT ? OFFSET ?`;
    const values = categoryName === 'all' ? [min, max, limit, offset] : [categoryName, min, max, limit, offset];
    // NOTE: db.query() used here instead of db.execute() — MySQL 8's prepared-statement
    // protocol throws "ER_WRONG_ARGUMENTS: Incorrect arguments to mysqld_stmt_execute"
    // when LIMIT/OFFSET are passed as placeholders via execute(). query() avoids this
    // (values are still safely escaped, this is not a SQL-injection risk).
    const [rows] = await db.query(query, values);

    // Get category counts
    const [categoryCounts] = await db.execute(`
      SELECT category, COUNT(*) AS count
      FROM products
      GROUP BY category
      ORDER BY count DESC
    `);

    res.render('pages/allProducts', {
      products: rows,
      title: categoryName === 'all' ? 'All Products' : categoryName,
      total_items: totalItems,      // FIXED: use totalItems instead of session
      currentPage: page,
      totalPages: Math.ceil(totalItems / limit),
      sort: sort,
      min: min,
      max: max,
      searchBar: "",
      categories: categoryCounts
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching products');
  }
};
exports.post_AllProducts = async (req, res) => {
  //const db = req.app.locals.db;

  try {
    req.session.minInput = req.body.min;
    req.session.maxInput = req.body.max;

    const page = parseInt(req.body.page) || 1; 
    const limit = parseInt(req.body.limit) || 9;
    const offset = (page - 1) * limit;

    const minPrice = req.session.minInput;
    const maxPrice = req.session.maxInput;

    const [countResult] = await db.execute(
      'SELECT COUNT(*) AS count FROM products WHERE price >= ? AND price <= ?',
      [minPrice, maxPrice]
    );
    const totalItems = parseInt(countResult[0].count);

    const [rows] = await db.query(
      'SELECT * FROM products WHERE price >= ? AND price <= ? ORDER BY price ASC LIMIT ? OFFSET ?',
      [minPrice, maxPrice, limit, offset]
    );

    res.render('pages/rangedProducts', {
      products: rows,
      title: 'All Products',
      total_items: req.session.totalItems,
      minPrice,
      maxPrice,
      currentPage: page,
      totalPages: Math.ceil(totalItems / limit)
    });

  } catch (err) {
    console.error(err);
    res.send('Error fetching products');
  }
};
