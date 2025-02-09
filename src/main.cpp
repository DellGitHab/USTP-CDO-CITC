#include <WiFi.h>
#include <HTTPClient.h>
#include <MFRC522.h>
#include <SPIFFS.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>  // Include the LCD library

// Define the RFID pins
#define RST_PIN 0
#define SS_PIN 5

// Define the buzzer pin
#define BUZZER_PIN 27 // GPIO27 for the piezo buzzer

MFRC522 mfrc522(SS_PIN, RST_PIN);

// Define the LCD address (adjust as per your module)
LiquidCrystal_I2C lcd(0x27, 16, 2);  // 16x2 LCD, I2C address 0x27

const char* ssid = "kent";
const char* password = "kent12345";

String rfidTag = "";

// Function declarations
void sendToServer(String rfid);
void writeToFile(String rfid);
void triggerBuzzer(); // Function to trigger the buzzer

void setup() {
  Serial.begin(115200);

  // Connect to WiFi
  WiFi.begin(ssid, password);
  Serial.println("Connecting to WiFi...");
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(1000);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nConnected to WiFi");
  } else {
    Serial.println("\nFailed to connect to WiFi");
  }

  // Initialize SPI for RFID
  SPI.begin();
  mfrc522.PCD_Init();

  // Initialize SPIFFS
  if (!SPIFFS.begin(true)) {
    Serial.println("Failed to mount SPIFFS filesystem");
    return;
  }
  Serial.println("SPIFFS mounted successfully");

  // Set up the buzzer pin
  pinMode(BUZZER_PIN, OUTPUT);

  // Initialize the LCD
  Wire.begin(); // Initialize I2C communication
  lcd.begin(16, 2);
  lcd.setBacklight(1); // Turn on the backlight
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("System ready");

  Serial.println("Setup complete. Ready to scan RFID cards.");
}

void loop() {
  // Check for a new RFID card
  if (mfrc522.PICC_IsNewCardPresent() && mfrc522.PICC_ReadCardSerial()) {
    rfidTag = "";

    // Read the RFID tag
    for (byte i = 0; i < mfrc522.uid.size; i++) {
      rfidTag += String(mfrc522.uid.uidByte[i], HEX);
    }
    rfidTag.toUpperCase(); // Convert to uppercase

    // Ensure the RFID tag is not empty
    if (rfidTag.length() > 0) {
      Serial.println("RFID Tag: " + rfidTag);

      // Display the RFID tag on the LCD
      lcd.clear(); // Clear previous text
      lcd.setCursor(0, 0);
      lcd.print("Scanned:");
      lcd.setCursor(0, 1);
      lcd.print(rfidTag);

      triggerBuzzer();        // Trigger the buzzer
      writeToFile(rfidTag);   // Write RFID tag to the file
      sendToServer(rfidTag);  // Send the RFID tag to the server

      delay(2000);            // Display the scanned tag for 2 seconds

      // Reset the LCD to "System ready"
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("System ready");
    } else {
      Serial.println("Empty RFID tag detected. Ignoring...");
    }

    // Wait 1 second before allowing the next scan
    delay(1000);
  }
}

void sendToServer(String rfid) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Not connected to WiFi. Cannot send data.");
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Server Error:");
    lcd.setCursor(0, 1);
    lcd.print("No WiFi");
    delay(2000); // Display the error for 2 seconds
    return;
  }

  HTTPClient http;
  String serverUrl = "http://192.168.213.207/ezmonitor/rfid/rfid_receiver.php";
  String postData = "rfid=" + rfid;

  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/x-www-form-urlencoded");

  int httpResponseCode = http.POST(postData);
  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.println("Server Response: " + response);
  } else {
    Serial.printf("Error in sending data to server. HTTP Code: %d\n", httpResponseCode);
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Server Error");
    delay(2000); // Display the error for 2 seconds
  }

  http.end(); // Close connection
}

void writeToFile(String rfid) {
  File file = SPIFFS.open("/current_rfid.txt", FILE_WRITE);
  if (!file) {
    Serial.println("Failed to open file for writing");
    return;
  }

  file.println(rfid); // Write RFID to the file
  file.close();       // Close the file

  Serial.println("RFID written to current_rfid.txt");
}

void triggerBuzzer() {
  digitalWrite(BUZZER_PIN, HIGH); // Turn the buzzer on
  delay(200);                     // Wait for 200 milliseconds
  digitalWrite(BUZZER_PIN, LOW);  // Turn the buzzer off
}
