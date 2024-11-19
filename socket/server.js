const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

// Initialize Express and create an HTTP server
const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Allow requests from all origins (adjust as necessary)
    methods: ["GET", "POST"],
    allowedHeaders: ["Authorization"],
    credentials: true

  },
});

// Middleware for parsing JSON
app.use(express.json());

// Set up a basic route to test the server
app.get('/socket', (req, res) => {
  res.send('Socket.io server is running');
});

// Socket.io connection event
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Test event: Listen for a custom event from the client
  // socket.on('testEvent', (data) => {
  //   console.log("Received 'testEvent' from client with data:", data);
  //   socket.emit('testResponse', { message: 'Server received testEvent' });
  // });

  // Join a room (you could use the user's ID or any unique identifier)
  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    console.log(`User with socket ID ${socket.id} joined room: ${roomId}`);
  });

  // Disconnect event
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Start the server
const SOCKET_PORT = process.env.SOCKET_PORT || 5000;
server.listen(SOCKET_PORT, () => {
  console.log(`socket Server is running on http://localhost:${SOCKET_PORT}`);
});

module.exports= {app,io,server}