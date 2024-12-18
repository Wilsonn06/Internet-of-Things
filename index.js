const express = require('express');
const app = express();
const path = require('path');
const mqtt = require('mqtt');

// MQTT Broker Configuration
const broker = 'mqtt://broker.emqx.io';
const options = {
  port: 1883,
  clientId: `mqtt_${Math.random().toString(16).slice(3)}`,
  username: 'emqx',
  password: 'public',
};

// Connect to the MQTT broker
const client = mqtt.connect(broker, options);

// Set view engine menjadi EJS
app.set('view engine', 'ejs');
app.set('views', './views');


// Akses file statis (CSS)
app.use(express.static(path.join(__dirname, 'public')));

// Variable to store the latest message
let latestMessage = 'No messages yet';

// MQTT Client Event Handlers
client.on('connect', () => {
  console.log('Connected to MQTT broker');
  client.subscribe('/nodejs/mqtt', (err) => {
    if (!err) {
      console.log('Subscribed to topic: /nodejs/mqtt');
    }
  });
});

client.on('message', (topic, message) => {
  console.log(`Message received on topic ${topic}: ${message.toString()}`);
  latestMessage = message.toString(); // Update the latest message
});

// Route ke halaman dashboard
app.get('/', (req, res) => {
  res.render('dashboard', { message: latestMessage });
});

// Jalankan server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
