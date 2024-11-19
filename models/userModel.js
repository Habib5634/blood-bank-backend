const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: [true, 'use name is required'],
        unique: true
    },
    email: {
        type: String,
        required: [true, 'email is required'],
        unique: true
    },
    password:{
        type:String,
        required:[true, 'password is required']
    },
    country:{
        type:String,
        // required:[true, 'country is required']
    },
    state:{
        type:String,
        // required:[true, 'state is required']
    },
    city:{
        type:String,
        // required:[true, 'cty is required']
    },
    school:{
        type:String,
        // required:[true, 'school or organization name is required']
    },
    age:{
        type:Number,
        // required:[true, 'age is required']
    },
    gender:{
        type:String,
        // required:[true, 'gender is required']
        enum:['male','female','other']
    },
    bloodGroup:{
        type:String,
        // required:[true, 'blood Group is required'],
        enum:['A+','A-','B+','B-','AB+','AB-','O+','O-']

    },
    userType:{
        type:String,
        // required:[true, 'userType is required'],
        enum:['user','admin']
    },
    firstName:{
        type:String,
        // required:[true, 'gender is required']
    },
    lastName:{
        type:String,
        // required:[true, 'gender is required']
    },
    profile:{
        type:String,
        default:'https://w7.pngwing.com/pngs/178/595/png-transparent-user-profile-computer-icons-login-user-avatars-thumbnail.png'
    },
    answer:{
        type:String,
        required:[true,'answer is required']
    }

},{timestamps:true})

module.exports = mongoose.model('User',userSchema)