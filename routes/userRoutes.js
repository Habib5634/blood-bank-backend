const express = require('express')
const { getUserController, updateUserController, resetPasswordController, updatePasswordController, deleteProfileController, searchController, sendRequestController, getRequestsController, getAllUsers } = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const { markRequestAsRead, markAllRequestsAsRead, acceptRequestController, rejectRequestController, getConversationController, sendMessageController, getMessagesController } = require('../controllers/requestController');

const router = express.Router()
// routes

// get users
router.get('/getOneUser/',authMiddleware,getUserController)

//password update
router.post("/updatePassword", authMiddleware, updatePasswordController);
// UPDATE PROFILE
router.put("/updateUser", authMiddleware, updateUserController);
// RESET PASSWORD
router.post("/resetPassword", authMiddleware, resetPasswordController);

// delete USER
router.delete("/deleteUser/:id", authMiddleware, deleteProfileController);

//search donor
router.get('/searchDonor/',authMiddleware,searchController)

// Send a request to a user by their ID
router.post('/sendRequest/:recipientId', authMiddleware, sendRequestController);

// Get all requests for the authenticated user
router.get('/getRequests', authMiddleware, getRequestsController);
// Get all requests for the authenticated user
router.get('/get-users', authMiddleware, getAllUsers);

// Route for marking a single request as read
router.patch('/:requestId/mark-read',authMiddleware, markRequestAsRead);

// Route for marking all filtered requests as read
router.patch('/mark-all-read/:userId',authMiddleware, markAllRequestsAsRead);



// Route to accept a request
router.put('/:requestId/accept', authMiddleware, acceptRequestController);

// Route to reject a request
router.delete('/:requestId/reject', authMiddleware, rejectRequestController);

// Route to reject a request
router.get('/conversation', authMiddleware, getConversationController);

// send message route
router.post('/send',authMiddleware,sendMessageController)
router.get('/:conversationId/messages',authMiddleware,getMessagesController)



module.exports = router