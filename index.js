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
let parsedData = { co2: 0, nh3: 0, nox: 0 };
const sensorData = {
  sensor1: { co2: 0, nh3: 0, nox: 0 },
  sensor2: { co2: 0, nh3: 0, nox: 0 },
  sensor3: { co2: 0, nh3: 0, nox: 0 },
};

// MQTT Client Event Handlers
client.on('connect', () => {
  console.log('Connected to MQTT broker');
  // client.subscribe('MQ135/sensor1', (err) => {
  //   if (!err) {
  //     console.log('Subscribed to topic: MQ135/sensor1');
  //   }
  // });
  // Subscribe to both sensor topics
  ['MQ135/sensor1', 'MQ135/sensor2','MQ135/sensor3'].forEach((topic) => {
    client.subscribe(topic, (err) => {
      if (!err) {
        console.log(`Subscribed to topic: ${topic}`);
      }
    });
  });
});

client.on('message', (topic, message) => {
  console.log(`Message received on topic ${topic}: ${message.toString()}`);
  latestMessage = message.toString(); // Update the latest message

  // Parse the message to extract CO2, NH3, and NOx values
  const regex = /CO2\s*=\s*([\d.]+)\s*;\s*NH3\s*=\s*([\d.]+)\s*;\s*NOx\s*=\s*([\d.]+)/;
  const match = latestMessage.match(regex);
  if (match) {
    parsedData = {
      co2: parseFloat(match[1]),
      nh3: parseFloat(match[2]),
      nox: parseFloat(match[3]),
    };

    // Update the respective sensor data
    if (topic === 'MQ135/sensor1') {
      sensorData.sensor1 = parsedData;
    } 
    else if (topic === 'MQ135/sensor2') {
      sensorData.sensor2 = parsedData;
    } else if (topic === 'MQ135/sensor3'){
      sensorData.sensor3 = parsedData;
    }
  }
});

// Route ke halaman dashboard
app.get('/', (req, res) => {
  res.render('dashboard', { data: sensorData });
});

app.get('/api/data', (req, res) => {
  res.set('Cache-Control', 'no-store'); // Prevent caching
  res.json(parsedData);
});

// Jalankan server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
