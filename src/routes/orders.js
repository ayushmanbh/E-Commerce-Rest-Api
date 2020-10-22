const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const Order = require('../models/orders')
const Product = require('../models/products')
const auth = require('../middleware/auth')


router.get('/', auth, (req, res, next) => {
  Order.find({ user: req.userData._id })
    .populate('product', 'name price')
    .exec()
    .then(docs => {
      res.status(200).json({
        count: docs.length,
        orders: docs.map(doc => {
          return {
            _id: doc._id,
            product: doc.product,
            quantity: doc.quantity,
            dateCreated: doc.dateCreated,
            request: {
              type: 'GET',
              url: 'http://localhost:3000/orders/' + doc._id
            }
          }
        })
      })
    }).catch(err => {
      res.status(500).json({
        error: err
      })
    })

})

router.post('/', auth, (req, res, next) => {
  Product.findById(req.body.productId)
    .then(product => {
      if (!product) {
        return res.status(404).json({
          message: 'Product not found'
        })
      }
      const order = new Order({
        _id: new mongoose.Types.ObjectId(),
        quantity: req.body.quantity,
        product: req.body.productId,
        user: req.userData._id
      })
      return order.save()
    })
    .then(result => {
      res.status(201).json({
        message: 'Order added',
        request: {
          type: 'GET',
          url: 'http://localhost:3000/orders/' + result._id
        }
      })
    })
    .catch(err => {
      res.status(500).json({
        error: err
      })
    })
})

router.get('/:orderId', auth, (req, res, next) => {
  Order.findOne({ _id: req.params.orderId, user: req.userData._id })
    .populate('product', 'name price')
    .exec()
    .then(order => {
      if (!order) {
        return res.status(404).json({
          message: 'Order not found'
        })
      }

      res.status(200).json({
        order,
        request: {
          type: 'GET',
          url: 'http://localhost/orders/'
        }
      })
    })
    .catch(err => {
      res.status(500).json({
        error: err
      })
    })
})

router.delete('/:orderId', auth, (req, res, next) => {
  Order.findOneAndDelete({ _id: req.params.orderId, user: req.userData._id })
    .exec()
    .then(order => {
      res.status(200).json({
        message: 'Order deleted'
      })
    })
    .catch(err => {
      res.status(500).json({
        error: err
      })
    })
})

module.exports = router