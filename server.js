const express = require('express')
const colors = require('colors')
const cors = require('cors')
const morgan = require('morgan')
const dotenv = require('dotenv')
const connectDb = require('./config/db')


// dot env configuration
dotenv.config();

// DB Connection
connectDb()

// rest object /
const app = express()

// midleware
app.use(cors())
app.use(express.json())
app.use(morgan('dev'))

// routes
app.get('/api/v1/',(req,res)=>{
    return res
    .status(200)
    .send("<h1>CTP Backend is working correctly</h1>")
})

app.use('/api/v1/auth',require("./routes/authRoutes"))
app.use('/api/v1/user',require("./routes/userRoutes"))


// PORT
const PORT = process.env.PORT ||8080;

// listen

app.listen(PORT,()=>{
    console.log(`server running on ${PORT}`.white.bgMagenta)
})