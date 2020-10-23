const jwt = require('jsonwebtoken')
const ROLE = require('../roles')

const userAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.SECRET)
    req.userData = decoded
    next()
  } catch (error) {
    return res.status(401).json({
      message: 'Login again'
    })
  }
}

const roleAuth = (req, res, next) => {
  if (req.userData.role !== ROLE.ADMIN) {
    return res.status(401).json({
      message: 'Forbidden resource'
    })
  }
  next()
}

module.exports = {
  userAuth,
  roleAuth
}