require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const expressSession = require('express-session');
const MongoStore = require('connect-mongo')

// The "function" folder is where I keep my middlware files.
const connectMongo = require('./functions/mongo-connection')
const { dataOps, fileOps } = require('./functions/ops')

const app = express()

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))
app.use(expressSession({
    secret: 'max',
    saveUninitialized: false,
    resave: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URL }),  
  }))
app.use(connectMongo(process.env.MONGO_URL, {useNewUrlParser: true, useUnifiedTopology: true}));
app.use(dataOps())
app.use(fileOps())


const writingRoutes = require('./routes/writing')
const adminRoutes = require('./routes/admin')
app.use('/writing', writingRoutes)
app.use('/', adminRoutes)


// Server ---
const http = require('http')
const PORT = process.env.PORT || 9000

app.set('port', PORT)

const server = http.createServer(app)

server.listen(PORT, () => console.log(`Server running on port ${PORT}`))