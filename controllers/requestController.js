
const requestModel = require('../models/requestModel') 
const conversationModel = require('../models/conversationModel')
const messageModel = require('../models/messageModel')
const {io} = require('../socket/server')

// Accept Request Controller
const acceptRequestController = async (req, res) => {
    try {
      const { requestId } = req.params; // The request ID from the URL
      const userId = req.user._id; // The authenticated user's ID
  
      // Find the request by its ID
      const request = await requestModel.findById(requestId);
  
      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }
  
      // Check if the authenticated user is the recipient of the request
      if (request.recipientId.toString() !== userId.toString()) {
        return res.status(403).json({ message: "You are not the recipient of this request" });
      }
  
      // Update the request to mark it as accepted
      request.isAccepted = true;
      request.isRead = true
      await request.save();
  
      // Create a new conversation between the requester and the recipient if it doesn't exist
      let conversation = await conversationModel.findOne({
        participants: { $all: [request.requesterId, request.recipientId] },
    });

    if (!conversation) {
        conversation = await conversationModel.create({
            participants: [request.requesterId, request.recipientId],
        });
    }

      // Emit a Socket.io event to notify both users about the accepted request
      io.to(request.requesterId.toString()).emit('requestAccepted', {
        message: 'Your request has been accepted',
        request,
      });
      io.to(request.recipientId.toString()).emit('requestAccepted', {
        message: 'You have accepted the request',
        request,
      });
  
      // Return success response
      res.status(200).json({ message: "Request accepted successfully", request });
    } catch (error) {
      res.status(500).json({ message: "Error accepting request", error });
      console.error(error);
    }
  };
  
  // Reject Request Controller
  const rejectRequestController = async (req, res) => {
    try {
      const { requestId } = req.params; // The request ID from the URL
      const userId = req.user._id; // The authenticated user's ID
  
      // Find the request by its ID
      const request = await requestModel.findById(requestId);
  
      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }
  
      // // Check if the authenticated user is the recipient of the request
      // if (request.recipientId.toString() !== userId.toString()) {
      //   return res.status(403).json({ message: "You are not the recipient of this request" });
      // }
  
      // Delete the request to reject it
      await requestModel.findByIdAndDelete(requestId);
  
      // Emit a Socket.io event to notify the requester about the rejection
      io.to(request.requesterId.toString()).emit('requestRejected', {
        message: 'Your request has been rejected',
        requestId,
      });
  
      // Return success response
      res.status(200).json({ message: "Request rejected successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error rejecting request", error });
      console.error(error);
    }
  };


  // MArk a single request as read
  const markRequestAsRead = async (req, res) => {
    const { requestId } = req.params;
  
    try {
      const request = await requestModel.findByIdAndUpdate(
        requestId,
        { isRead: true },
        { new: true } // Returns the updated document
      );
  
      if (!request) {
        return res.status(404).json({ message: 'Request not found' });
      }
  
      res.status(200).json({ message: 'Request marked as read', request });
    } catch (error) {
      res.status(500).json({ message: 'Error marking request as read', error });
    }
  };


  // Mark all filtered request as read
const markAllRequestsAsRead = async (req, res) => {
    const { userId } = req.params; // This is the `userData._id` to filter by
  
    try {
      const result = await requestModel.updateMany(
        { recipientId: userId, isRead: false },
        { isRead: true }
      );
  
      res.status(200).json({
        message: 'All requests marked as read',
        modifiedCount: result.modifiedCount || 0, // Number of requests updated
      });
    } catch (error) {
      res.status(500).json({ message: 'Error marking requests as read', error });
    }
  };



  // Get All Conversations for the Logged-In User
const getConversationController = async (req, res) => {
  try {
      const userId = req.user._id; // Get the logged-in user's ID from middleware

      // Find all conversations where the logged-in user is a participant
      const conversations = await conversationModel.find({
          participants: userId,
      })
          .populate("participants", "firstName lastName bloodGroup profile email") // Populate participants' basic info
          .populate("messages"); // Populate messages if necessary

      if (!conversations || conversations.length === 0) {
          return res.status(404).json({ message: "No conversations found" });
      }

      res.status(200).json({ conversations });
  } catch (error) {
      res.status(500).json({ message: "Error retrieving conversations", error });
      console.error(error);
  }
};


// Controller to Send a Message
const sendMessageController = async (req, res) => {
  try {
      const { conversationId, receiverId, message } = req.body;
      const senderId = req.user._id;

      // Create a new message
      const newMessage = new messageModel({
          senderId,
          receiverId,
          message
      });

      // Save the message to the database
      const savedMessage = await newMessage.save();

      // Find the conversation and add the message reference
      const conversation = await conversationModel.findByIdAndUpdate(
          conversationId,
          { $push: { messages: savedMessage._id } },
          { new: true }
      );

      // If no conversation found, return an error
      if (!conversation) {
          return res.status(404).json({ message: "Conversation not found" });
      }
      if (receiverId) {
        io.to(receiverId).emit('newMessage', {
          conversationId,
          message: savedMessage,
        });
      }
      res.status(201).json({
          message: "Message sent successfully",
          data: savedMessage
      });
  } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Error sending message", error });
  }
};

// Controller to Get Messages for a Conversation
const getMessagesController = async (req, res) => {
  try {
      const { conversationId } = req.params;

      // Find the conversation by ID and populate messages
      const conversation = await conversationModel.findById(conversationId)
          .populate({
              path: "messages",
              populate: {
                  path: "senderId receiverId",
                  select: "firstName lastName bloodGroup profile email"
              }
          });

      if (!conversation) {
          return res.status(404).json({ message: "Conversation not found" });
      }

      res.status(200).json({
          conversationId,
          messages: conversation.messages
      });
  } catch (error) {
      console.error("Error retrieving messages:", error);
      res.status(500).json({ message: "Error retrieving messages", error });
  }
};


  module.exports = {
    acceptRequestController,
    rejectRequestController,
    markRequestAsRead,
    markAllRequestsAsRead,
    getConversationController,
    getMessagesController,sendMessageController
  };