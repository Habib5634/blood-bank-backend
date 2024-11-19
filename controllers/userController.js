const userModel = require('../models/userModel')
const bcrypt = require("bcryptjs");
const requestModel = require('../models/requestModel') 

const {io} = require('../socket/server')


const getUserController = async (req, res) => {
  try {
    // find User
    const user = await userModel.findById({ _id: req.user._id })
    // validation
    if (!user) {
      res.status(500).send({
        success: false,
        message: "User Not Found",
        error,
      });
    }
    // for hiding the password in response
    user.password = undefined


    res.status(200).send({
      success: true,
      mesage: "Login Succesfully",
      user
    })
    // console.log(req.user._id)
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In getUser API",
      error,
    });
  }

}

// UPDATE USER
const updateUserController = async (req, res) => {
  try {
    // find user
    const user = await userModel.findById({ _id: req.user._id });
    //validation
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "user not found",
      });
    }

    //update

    const { userName, firstName, lastName } = req.body;
    if (userName) user.userName = userName;
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    //save user
    await user.save();

    // for hiding the password in response
    user.password = undefined
    res.status(200).send({
      success: true,
      message: "User Updated SUccessfully",
      user
    })
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In Udpate Userr API",
      error,
    });
  }
};


// UPDATE USER PASSWORR
const updatePasswordController = async (req, res) => {
  try {
    //find user
    const user = await userModel.findById({ _id: req.user._id });
    //valdiation
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Usre Not Found",
      });
    }
    // get data from user
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(500).send({
        success: false,
        message: "Please Provide Old or New PasswOrd",
      });
    }
    //check user password  | compare password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(500).send({
        success: false,
        message: "Invalid old password",
      });
    }
    //hashing password
    var salt = bcrypt.genSaltSync(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
    await user.save();
    res.status(200).send({
      success: true,
      message: "Password Updated!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In Password Update API",
      error,
    });
  }
};

// RESET PASSWORd
const resetPasswordController = async (req, res) => {
  try {
    const { email, newPassword, answer } = req.body;
    if (!email || !newPassword || !answer) {
      return res.status(500).send({
        success: false,
        message: "Please Privide All Fields",
      });
    }
    const user = await userModel.findOne({ email, answer });
    if (!user) {
      return res.status(500).send({
        success: false,
        message: "User Not Found or invlaid answer",
      });
    }
    //hashing password
    var salt = bcrypt.genSaltSync(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
    await user.save();
    res.status(200).send({
      success: true,
      message: "Password Reset SUccessfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "eror in PASSWORD RESET API",
      error,
    });
  }
};


// DLEETE PROFILE ACCOUNT
const deleteProfileController = async (req, res) => {
  try {
    await userModel.findByIdAndDelete(req.params.id);
    return res.status(200).send({
      success: true,
      message: "Your account has been deleted",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Erorr In Delete Profile API",
      error,
    });
  }
};


const searchController = async (req, res) => {
  try {
    // Extract city and bloodGroup from query parameters
    const { city, bloodGroup } = req.query;

    // Validation to ensure both parameters are provided
    if (!city || !bloodGroup) {
      return res.status(400).send({
        success: false,
        message: 'Please provide both city and bloodGroup as query parameters.',
      });
    }

    // Escape special characters in bloodGroup (e.g., +)
    const escapedBloodGroup = bloodGroup.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Find users that match the specified city and bloodGroup, case-insensitively
    const users = await userModel.find({
      city: { $regex: new RegExp(`^${city}$`, 'i') },
      bloodGroup: { $regex: new RegExp(`^${escapedBloodGroup}$`, 'i') }
    });
    // %2B
    console.log(users);

    // Check if any users are found
    if (users.length === 0) {
      return res.status(404).send({
        success: false,
        message:  `No Donor found in the ${city.toUpperCase()} city and with ${bloodGroup.toUpperCase()} blood group.`,
      });
    }

    // Send back the found users
    res.status(200).send({
      success: true,
      message: 'Users found successfully.',
      data: users,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: 'Error in search API',
      error,
    });
  }
};


// get All Users
// Controller function to get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find().select('-password');; // Fetch all users from the database
    res.status(200).json(users);
    // for hiding the password in response
    users.password = undefined     // Send the users as a JSON response
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error. Failed to fetch users." });
  }
};

//send requests
const sendRequestController = async (req, res) => {
  try {
    const { recipientId } = req.params;
    const requesterId = req.user._id; // Assuming `req.user` contains the authenticated user's ID from `authMiddleware`

    // Check if a request already exists
    const existingRequest = await requestModel.findOne({ requesterId, recipientId });
    if (existingRequest) {
      return res.status(400).json({ message: "Request already sent" });
    }
  // Check if a request from recipient to requester already exists
  const reverseRequest = await requestModel.findOne({ requesterId: recipientId, recipientId: requesterId });
  if (reverseRequest) {
    return res.status(400).json({ message: "Request already received from this user" });
  }
    // Create a new request
    const newRequest = await requestModel.create({
      requesterId,
      recipientId,
      isAccepted: false
    });
    if (recipientId) {
      // Emit a Socket.io event after creating the request
      console.log(`Emitting 'newRequest' to recipient: ${recipientId}, with request:`, newRequest); // Debugging line
      io.to(recipientId).emit('newRequest', { message: 'You have a new request', request: newRequest });
    }
    console.log(`New request emitted to recipient with ID: ${recipientId}`);

    res.status(200).json({ message: "Request sent successfully", request: newRequest });
  } catch (error) {
    res.status(500).json({ message: "Error sending request", error });
    console.log(error)
  }
};

// Get Request Controller
const getRequestsController = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch requests sent to and from the authenticated user
    const requests = await requestModel.find({
      $or: [
        { requesterId: userId },   // Matches requests where the user is the requester
        { recipientId: userId }    // Matches requests where the user is the recipient
      ]
    })
    .populate('requesterId', 'firstName lastName email profile bloodGroup city') // Populates requester details
    .populate('recipientId', 'firstName lastName email profile bloodGroup city');

    
    res.status(200).json({ requests });
    // Emit to the user's room to notify them of the request update
    io.to(userId).emit('requestsUpdated', requests);
  } catch (error) {
    res.status(500).json({ message: "Error fetching requests", error });
    console.log(error)
  }
};



module.exports = { getUserController, updateUserController, updatePasswordController, resetPasswordController,deleteProfileController,searchController ,sendRequestController,getRequestsController,getAllUsers}

