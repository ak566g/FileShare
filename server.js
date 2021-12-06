const express = require('express')
const path = require('path')
const app = express()
const connectDB = require('./config/db')
const files = require('./routes/files')

const PORT = process.env.PORT || 8000
// template engine
app.set('views', path.join(__dirname, '/views'))
app.set('view engine', 'ejs')

//routes
app.use('/api', files)

connectDB()
app.listen(PORT, ()=>{
    console.log(`server is running on port ${PORT}`)
})