const express = require('express')
const path = require('path')
const app = express()
const cors = require('cors')
const connectDB = require('./config/db')
const files = require('./routes/files')

const PORT = process.env.PORT || 8000

app.use(express.static('public'))
app.use(express.json())

// template engine
app.set('views', path.join(__dirname, '/views'))
app.set('view engine', 'ejs')

//routes
app.use('/api', files)

connectDB()

// setting cors
const corsOptions = {
    origin: process.env.ALLOWED_CLIENTS.split(',')
}

app.use(cors(corsOptions))

app.listen(PORT, ()=>{
    console.log(`server is running on port ${PORT}`)
})