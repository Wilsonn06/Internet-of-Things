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

// Variables to store the latest messages
let messages = {
  sensor1: 'No messages yet from sensor1',
  sensor2: 'No messages yet from sensor2',
  sensor3: 'No messages yet from sensor3',
};

// MQTT Client Event Handlers
client.on('connect', () => {
  console.log('Connected to MQTT broker');
  client.subscribe('MQ135/sensor1', (err) => {
    if (!err) {
      console.log('Subscribed to topic: MQ135/sensor1');
    }
  });
  client.subscribe('MQ135/sensor2', (err) => {
    if (!err) {
      console.log('Subscribed to topic: MQ135/sensor2');
    }
  });
  client.subscribe('MQ135/sensor3', (err) => {
    if (!err) {
      console.log('Subscribed to topic: MQ135/sensor3');
    }
  });
});

client.on('message', (topic, message) => {
  console.log(`Message received on topic ${topic}: ${message.toString()}`);
  if (topic === 'MQ135/sensor1') {
    messages.sensor1 = message.toString();
  } else if (topic === 'MQ135/sensor2') {
    messages.sensor2 = message.toString();
  } else if (topic === 'MQ135/sensor3') {
    messages.sensor3 = message.toString();
  }
});

// Route ke halaman dashboard
app.get('/', (req, res) => {
  res.render('dashboard', { messages });
});

// Jalankan server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
