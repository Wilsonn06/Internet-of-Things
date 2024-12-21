const int MQ135_PIN = A0; // Analog pin connected to MQ-135
const float R_L = 1000;   // Load resistance in ohms
const float R0 = 10;      // Replace with your calculated R0

// Calibration constants for each gas
const float m_CO2 = -0.3, b_CO2 = 0.7;
const float m_NH3 = -0.4, b_NH3 = 1.0;
const float m_NOx = -0.5, b_NOx = 1.2;

void setup() {
  Serial.begin(9600);
}

void loop() {
  int sensorValue = analogRead(MQ135_PIN); // Read sensor value
  float voltage = sensorValue * (5.0 / 1023.0); // Convert to voltage
  float Rs = ((5.0 - voltage) * R_L) / voltage; // Calculate Rs

  // Calculate concentrations
  float CO2 = pow(10, (m_CO2 * log10(Rs / R0) + b_CO2));
  float NH3 = pow(10, (m_NH3 * log10(Rs / R0) + b_NH3));
  float NOx = pow(10, (m_NOx * log10(Rs / R0) + b_NOx));

  // Print results in the desired format
  Serial.print("CO2 = ");
  Serial.print(CO2);
  Serial.print(" ; NH3 = ");
  Serial.print(NH3);
  Serial.print(" ; NOx = ");
  Serial.println(NOx);

  delay(1000); // Wait 1 second
}
