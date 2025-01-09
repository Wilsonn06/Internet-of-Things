import paho.mqtt.client as mqtt
import serial
import json

# MQTT broker details
broker = "broker.emqx.io"
port = 1883
topic = "MQ135/sensor1"
username = "emqx"
password = "public"

# Location name (can be changed as needed)
location_name = "Lokasi 1"

# Serial port details (update with your Arduino's port and baud rate)
arduino_port = "COM5"  # Replace with the correct port (e.g., /dev/ttyUSB0 on Linux)
baud_rate = 9600

try:
    # Connect to Arduino via serial
    ser = serial.Serial(arduino_port, baud_rate)
    print(f"Connected to Arduino on {arduino_port}")
except Exception as e:
    print(f"Failed to connect to Arduino: {e}")
    exit()

# Create an MQTT client instance
client = mqtt.Client()

# Set username and password for the MQTT broker
client.username_pw_set(username, password)

try:
    # Connect to the MQTT broker
    client.connect(broker, port, 60)
    print(f"Connected to MQTT broker at {broker}:{port}")
    
    while True:
        # Read data from Arduino
        if ser.in_waiting > 0:
            arduino_message = ser.readline().decode('utf-8').strip()
            print(f"Message from Arduino: {arduino_message}")
            
            # Parse the existing message format
            regex = r"CO2\s*=\s*([\d.]+)\s*;\s*NH3\s*=\s*([\d.]+)\s*;\s*NOx\s*=\s*([\d.]+)"
            import re
            match = re.match(regex, arduino_message)
            
            if match:
                # Create a dictionary with both sensor data and location
                message_dict = {
                    "location": location_name,
                    "co2": float(match.group(1)),
                    "nh3": float(match.group(2)),
                    "nox": float(match.group(3))
                }
                
                # Convert to JSON string
                json_message = json.dumps(message_dict)
                
                # Publish the JSON message to the MQTT broker
                client.publish(topic, json_message)
                print(f"Published data with location to topic '{topic}'")
            else:
                print("Failed to parse Arduino message")
            
except Exception as e:
    print(f"Failed to connect or publish: {e}")
finally:
    # Clean up
    client.disconnect()
    ser.close()