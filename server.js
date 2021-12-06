const express = require('express')
const app = express()
const connectDB = require('./config/db')
const files = require('./routes/files')

const PORT = process.env.PORT || 8000

//routes

app.use('/api', files)

connectDB()
app.listen(PORT, ()=>{
    console.log(`server is running on port ${PORT}`)
})