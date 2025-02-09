#include <WiFi.h>
#include <SPIFFS.h>
#include <MFRC522.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// Pin configuration for the RFID RC522
#define SS_PIN 5  
#define RST_PIN 0 

// Piezo buzzer pin
#define BUZZER_PIN 27

MFRC522 rfid(SS_PIN, RST_PIN);
LiquidCrystal_I2C lcd(0x27, 16, 2); // I2C address 

// WiFi credentials
const char* ssid = "kent";
const char* password = "kent12345";

String deviceID = "";

// Function to initialize the buzzer
void setupBuzzer() {
  ledcSetup(0, 1000, 8);         // Channel 0, 1kHz frequency, 8-bit resolution
  ledcAttachPin(BUZZER_PIN, 0); 
}

// Function to trigger the buzzer
void triggerBuzzer() {
  ledcWrite(0, 255);             // Turn on buzzer
  ledcWriteTone(0, 1000);        // Set tone frequency
  delay(200);                    // Play tone for 200ms
  ledcWrite(0, 0);               // Turn off buzzer
}

// Function to reset the LCD with a default message
void resetLCD() {
  lcd.clear();
  delay(50);                     // Allow LCD to stabilize
  lcd.setCursor(0, 0);
  lcd.print("System Ready");
}

// Function to display a custom message on the LCD
void displayMessage(String line1, String line2 = "") {
  lcd.clear();                   // Clear the screen
  delay(50);                     // Allow screen to stabilize
  lcd.setCursor(0, 0);           // Start at the first row
  lcd.print(line1);              // Display the first line
  if (line2 != "") {
    lcd.setCursor(0, 1);         // Move to the second row
    lcd.print(line2);            // Display the second line
  }
}

// WiFi and RFID setup
void setup() {
  // Start serial communication
  Serial.begin(115200);

  // Initialize SPIFFS
  if (!SPIFFS.begin(true)) {
    Serial.println("Failed to mount SPIFFS");
    return;
  }

  // Read the device ID from SPIFFS
  File file = SPIFFS.open("/device_id.txt", "r");
  if (!file) {
    Serial.println("Failed to open device ID file");
    return;
  }
  deviceID = file.readString();
  file.close();
  Serial.println("Device ID: " + deviceID);

  // Initialize WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected");

  // Initialize the RFID reader
  SPI.begin();
  rfid.PCD_Init();
  delay(1000);
  Serial.println("RFID Reader Initialized");

  // Initialize the LCD
  lcd.init(); 
  lcd.backlight();
  resetLCD(); // Display "System Ready"

  // Initialize the buzzer
  setupBuzzer();
}

// Function to send RFID data to the backend and display response
void sendRfidData(String rfidNumber) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    String serverUrl = "http://192.168.213.207:3000/api/rfid"; 
    String jsonPayload = "{\"rfid_number\":\"" + rfidNumber + "\", \"device_id\":\"" + deviceID + "\"}";

    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");
    int httpCode = http.POST(jsonPayload);

    if (httpCode > 0) {
      String response = http.getString();
      Serial.println("Response: " + response);

      // Parse the response and display status
      if (response.indexOf("\"Logged In\"") != -1) {
        displayMessage("Logged In");
      } else if (response.indexOf("\"Logged Out\"") != -1) {
        displayMessage("Logged Out");
      } else if (response.indexOf("\"Unauthorized\"") != -1) {
        displayMessage("Unauthorized");
      } else if (response.indexOf("\"Expired\"") != -1) {
        displayMessage("RFID Expired");
      } else {
        displayMessage("Unknown Status");
      }
    } else {
      Serial.println("Error on sending POST request");
      displayMessage("POST Failed", "Check Network");
    }
    http.end();

    // Display the status for 2 seconds
    delay(2000);
    resetLCD();
  } else {
    Serial.println("WiFi not connected");
    displayMessage("WiFi Failed", "Check Connection");
    delay(2000);
    resetLCD();
  }
}

void loop() {
  // Look for new RFID scans
  if (rfid.PICC_IsNewCardPresent()) {
    Serial.println("New card detected!");
    if (rfid.PICC_ReadCardSerial()) {
      String rfidNumber = "";
      for (byte i = 0; i < rfid.uid.size; i++) {
        rfidNumber += String(rfid.uid.uidByte[i], HEX);
      }
      rfidNumber.toUpperCase(); // Ensure the RFID number is in uppercase

      Serial.println("RFID Number: " + rfidNumber);

      // Trigger the buzzer
      triggerBuzzer();

      // Send the RFID data to the backend
      sendRfidData(rfidNumber);

      rfid.PICC_HaltA();
      rfid.PCD_StopCrypto1();
    } else {
      Serial.println("Failed to read card serial");
    }
  }

  delay(1000); // Check for RFID every second
}
