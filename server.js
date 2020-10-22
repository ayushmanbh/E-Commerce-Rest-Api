const http = require('http')
const app = require('./src/app')

const server = http.createServer(app)

const port = 3000 || process.env.PORT

server.listen(port, () => console.log(`Server listening at ${port}`))