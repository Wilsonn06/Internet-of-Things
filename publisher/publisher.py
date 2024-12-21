import paho.mqtt.client as mqtt
import serial

# MQTT broker details
broker = "broker.emqx.io"
port = 1883
topic = "MQ135/sensor2"
username = "emqx"
password = "public"

# Serial port details (update with your Arduino's port and baud rate)
arduino_port = "COM10"  # Replace with the correct port (e.g., /dev/ttyUSB0 on Linux)
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
            
            # Publish the Arduino message to the MQTT broker
            client.publish(topic, arduino_message)
            print(f"Published '{arduino_message}' to topic '{topic}'")
except Exception as e:
    print(f"Failed to connect or publish: {e}")
finally:
    # Clean up
    client.disconnect()
    ser.close()
