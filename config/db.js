require('dotenv').config()
const mongoose = require('mongoose')

function connectDB() {
    mongoose 
    .connect(process.env.DB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true   
    })   
    .then(() => console.log("Database connected!"))
    .catch(err => console.log(err));
}

module.exports = connectDB