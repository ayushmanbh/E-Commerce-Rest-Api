const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const { userAuth } = require('../middleware/auth')
const User = require('../models/users')
const { sendConfirmationMail } = require('../emails/emails')

router.post('/signup', (req, res, next) => {
  User.find({ email: req.body.email })
    .exec()
    .then(user => {
      if (user.length >= 1) {
        return res.status(409).json({
          message: 'Email already exists'
        })
      }
      bcrypt.hash(req.body.password, 10, function (err, hash) {
        if (err) {
          return res.status(500).json({
            error: err
          })
        }
        const createdUser = new User({
          _id: new mongoose.Types.ObjectId(),
          email: req.body.email,
          password: hash,
          role: req.body.role
        })
        createdUser.save()
          .then(result => {
            sendConfirmationMail(result.email)
            res.status(201).json({
              message: 'User added'
            })
          })
          .catch(err => {
            res.status(500).json({
              error: err
            })
          })
      })
    })
})

router.get('/confirmation', userAuth, (req, res, next) => {
  User.findByIdAndUpdate(req.userData._id, { isConfirmed: true })
    .exec()
    .then(user => {
      if (!user) {
        return res.status(404).json({
          message: 'Invalid user'
        })
      }

      res.status(200).json({
        message: 'Account confirmed. Please login'
      })
    })
    .catch(err => {
      res.status(500).json({
        error: err
      })
    })
})

router.post('/login', (req, res, next) => {
  User.findOne({ email: req.body.email })
    .exec()
    .then(user => {
      if (user.length < 1) {
        return res.status(401).json({
          message: 'Auth failed'
        })
      }
      bcrypt.compare(req.body.password, user.password, function (err, result) {
        if (err) {
          return res.status(401).json({
            message: 'Auth failed'
          })
        }

        if (result) {
          const token = jwt.sign({
            email: user.email,
            role: user.role,
            _id: user._id
          },
            process.env.SECRET,
            {
              expiresIn: "1h"
            }
          )
          return res.status(200).json({
            message: 'Acess granted',
            token
          })
        }

        res.status(401).json({
          message: 'Auth failed'
        })
      });
    })
    .catch(err => {
      res.status(500).json({
        error: err
      })
    })
})

router.delete('/:userId', userAuth, (req, res, next) => {
  User.findOneAndDelete({ _id: req.params.userId })
    .then(result => {
      if (!result) {
        return res.status(404).json({
          message: 'User not found'
        })
      }
      res.status(200).json({
        message: 'User got deleted'
      })
    })
    .catch(err => {
      res.status(500).json({
        error: err
      })
    })
})

module.exports = router
