require('dotenv').config()
const mongoose = require('mongoose')

const uri = `mongodb+srv://taskapp:${process.env.MONGOOSE_KEY}@cluster0.vamq0.mongodb.net/${process.env.DATABASE}?retryWrites=true&w=majority`

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
})

console.log('Database connected');