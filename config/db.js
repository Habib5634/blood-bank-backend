const mongoose = require('mongoose')
const colors = require('colors')
// functoion mongodb connection
const connectDb = async ()=>{
    try {
        await mongoose.connect(process.env.MONGO_URL)
        console.log(`connect to db ${mongoose.connection.host}`.bgWhite)
        
    } catch (error) {
        console.log("DB Error", error, colors.bgRed)
    }
}


module.exports = connectDb