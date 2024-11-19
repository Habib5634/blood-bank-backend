const { io } = require('socket.io-client');

// Connect to the Socket.io server
const socket = io('http://localhost:5000');

// Listen for connection
socket.on('connect', () => {
  console.log(`Connected to server with socket ID: ${socket.id}`);

  // Emit a test event to the server
  socket.emit('testEvent', { test: 'This is a test message' });

  // Join a specific room (you can replace 'room1' with any room ID)
  const roomId = 'room1';
  socket.emit('joinRoom', roomId);
  console.log(`Requested to join room: ${roomId}`);
});

// Listen for test response from server
socket.on('testResponse', (data) => {
  console.log('Received response from server:', data);
});

// Listen for disconnect
socket.on('disconnect', () => {
  console.log('Disconnected from server');
});
