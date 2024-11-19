const userModel = require('../models/userModel')
const bcrypt = require("bcryptjs")
const JWT = require('jsonwebtoken')

// REGISTER
const registerController = async (req, res) => {
    try {
            const {userName,email,password,country,state,city,schoolage,gender,age,userType,firstName,lastName,profile,answer,bloodGroup} = req.body
            // vslidation
            if(!userName || !email ||!password || !answer){
                return res.status(400).send({
                    success:false,
                    message:'please provide required fields'
                })
            }
            // user exist!!!
            const existing= await userModel.findOne({userName})
            if(existing){
                return res.status(500).send({
                    success:false,
                    message:"UserName Already taken"
                })
            }
                
        // hashing password
        var salt = bcrypt.genSaltSync(10)
        const hashedPassword = await bcrypt.hash(password, salt)

            // save user
            const user = await userModel.create({userName,email,password:hashedPassword,country,state,city,schoolage,gender,age,userType,firstName,lastName,profile,answer,bloodGroup});
            res.status(201).send({
                success:true,
                message:"Successfully Registered"
            })

    } catch (error) {
        console.log(error)
        res.status(500).send({
            success:false,
            message:"Error in register API",
            error
        })
    }
}

const loginController = async (req,res)=>{
    try {
        const {email, password} = req.body;

        //validation
        if(!email || !password){
            return res.status(500).send({
                succes:false,
                message:"email or password is missing",
                error
            })

        }

        // check user  and compare password
       const user = await userModel.findOne({email})
        if(!user){
            return res.status(404).send({
                success:false,
                message:'use Not Found'
            })
        }

        // check user password | compare password
        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch){
            return res.status(500).send({
                success:false,
                message:"Invalid Password"
            })
        }
        // create token
        const token = JWT.sign({_id:user._id,userName:user.userName},process.env.JWT_SECRET, {expiresIn:"7d"} )


        // for hiding password in response
        user.password = undefined

        res.status(200).send({
            success:true,
            mesage:"Login Succesfully",
            user,
            token
        })

        
    } catch (error) {
        console.log(error);
        res.status(500).send({
          success: false,
          message: "Error In Login API",
          error,
        });
      }
    }


module.exports = { registerController,loginController }