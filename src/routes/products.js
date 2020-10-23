const express = require('express')
const router = express.Router()
const Product = require('../models/products')
const { userAuth, roleAuth } = require('../middleware/auth')
const mongoose = require('mongoose')
const multer = require('multer')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/')
  },
  filename: function (req, file, cb) {
    //path acc. to windows, remove replace() on mac
    cb(null, new Date().toISOString().replace(/:|\./g, '') + '-' + file.originalname)
  }
})

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
    cb(null, true)
  } else {
    cb(null, false)
  }
}
const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter
})

router.get('/', (req, res, next) => {
  Product.find()
    .select('name price productImage')
    .then(docs => {
      const response = {
        count: docs.length,
        products: docs.map(doc => {
          return {
            name: doc.name,
            price: doc.price,
            productImage: doc.productImage,
            _id: doc._id,
            request: {
              type: 'GET',
              url: 'http://localhost:3000/products/' + doc._id
            }
          }
        })
      }
      res.status(200).json(response)
    })
    .catch(err => res.status(500).json({ error: err }))
})

router.post('/', userAuth, roleAuth, upload.single('productImage'), (req, res, next) => {
  const product = new Product({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    price: req.body.price,
    productImage: (!req.file) ? null : req.file.path
  })
  product.save()
    .then(result => {
      res.status(201).json({
        message: "Product added",
        crestedProduct: {
          name: result.name,
          price: result.price,
          productImage: result.productImage,
          _id: result._id,
          request: {
            type: 'GET',
            url: 'http://localhost:3000/products/' + result._id
          }
        }
      })
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      })
    })
})

router.get('/:productId', (req, res, next) => {
  const id = req.params.productId
  Product.findById(id)
    .then(doc => {
      if (doc) {
        res.status(200).json(doc)
      } else {
        res.status(404).json({ error: 'Product not found' })
      }
    })
    .catch(err => {
      res.status(500).json({ error: err })
    })
})

router.patch('/:productId', userAuth, roleAuth, (req, res, next) => {
  const id = req.params.productId
  Product.updateOne({ _id: id }, req.body)
    .then(result => {
      if (result) {
        res.status(200).json({ message: 'Product updated', payload: result })
      } else {
        res.status(404).json({ message: 'Product not found' })
      }
    })
    .catch(err => res.status(500).json({ error: err }))
})

router.delete('/:productId', userAuth, roleAuth, (req, res, next) => {
  const id = req.params.productId
  Product.deleteOne({ _id: id })
    .then(doc => res.status(200).json({ message: 'Product deleted' }))
    .catch(err => res.status(500).json({ error: err }))
})

module.exports = router