const express = require('express')
const app = express()
const productRoutes = require('./routes/products')
const orderRoutes = require('./routes/orders')
const userRoutes = require('./routes/users')
const { static } = require('express')
require('./mongoose')

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/uploads', static('uploads'))
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
    return res.status(200).json({});
  }
  next();
});

app.use('/products', productRoutes)
app.use('/orders', orderRoutes)
app.use('/users', userRoutes)

//When no route matches
app.use((req, res, next) => {
  const error = new Error('Url Not found')
  error.status = 404
  next(error)
})

app.use((error, req, res, next) => {
  res.status(error.status || 500)
  res.json({
    error: {
      message: error.message
    }
  })
})



module.exports = app