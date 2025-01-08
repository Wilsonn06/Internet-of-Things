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

// Object to store sensor data with timestamps
const sensorData = {
  sensor1: { data: null, lastUpdate: 0 },
  sensor2: { data: null, lastUpdate: 0 },
  sensor3: { data: null, lastUpdate: 0 }
};

// Timeout duration for considering sensor data as stale (in milliseconds)
const DATA_TIMEOUT = 5000; // 5 seconds

// MQTT Client Event Handlers
client.on('connect', () => {
  console.log('Connected to MQTT broker');
  ['MQ135/sensor1', 'MQ135/sensor2', 'MQ135/sensor3'].forEach((topic) => {
    client.subscribe(topic, (err) => {
      if (!err) {
        console.log(`Subscribed to topic: ${topic}`);
      }
    });
  });
});

client.on('message', (topic, message) => {
  console.log(`Message received on topic ${topic}: ${message.toString()}`);
  
  // Parse the message to extract CO2, NH3, and NOx values
  const regex = /CO2\s*=\s*([\d.]+)\s*;\s*NH3\s*=\s*([\d.]+)\s*;\s*NOx\s*=\s*([\d.]+)/;
  const match = message.toString().match(regex);
  
  if (match) {
    const parsedData = {
      co2: parseFloat(match[1]),
      nh3: parseFloat(match[2]),
      nox: parseFloat(match[3])
    };

    // Update the respective sensor data with timestamp
    const sensorId = topic.split('/')[1]; // Extract sensor1, sensor2, or sensor3
    if (sensorData[sensorId]) {
      sensorData[sensorId] = {
        data: parsedData,
        lastUpdate: Date.now()
      };
    }
  }
});

// Route ke halaman dashboard
app.get('/', (req, res) => {
  const activeData = getActiveSensorData();
  res.render('dashboard', { data: activeData });
});

// Function to get only active sensor data
function getActiveSensorData() {
  const currentTime = Date.now();
  const activeData = {};

  Object.entries(sensorData).forEach(([sensorId, sensorInfo]) => {
    if (sensorInfo.data && (currentTime - sensorInfo.lastUpdate) < DATA_TIMEOUT) {
      activeData[sensorId] = sensorInfo.data;
    }
  });

  return activeData;
}

// Modified API endpoint to return only active sensor data
app.get('/api/data', (req, res) => {
  res.set('Cache-Control', 'no-store');
  const activeData = getActiveSensorData();
  res.json(activeData);
});

// Jalankan server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});