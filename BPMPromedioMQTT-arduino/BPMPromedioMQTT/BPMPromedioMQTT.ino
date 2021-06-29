#include "EspMQTTClient.h"
#include <Wire.h>
#include "MAX30105.h"
#include "heartRate.h"

MAX30105 particleSensor;

EspMQTTClient client(
  "MAX_LINE_DIANA",            // Nombre WIFI
  "florecita",                 // Contraseña WIFI
  "data-nec.cloud.shiftr.io",  // MQTT Broker Server
  "data-nec",                  // Usuario
  "ODB7aMesSDvAgsDT",          // Contraseña / Token
  "DATA-Sara",                 // Nombre del dispositivo
  1883                        // Puerto
);

String mensaje = "false";
const byte RATE_SIZE = 4; //Increase this for more averaging. 4 is good.
byte rates[RATE_SIZE]; //Array of heart rates
byte rateSpot = 0;
long lastBeat = 0; //Time at which the last beat occurred

float beatsPerMinute;
int beatAvg;

int period = 1000;
unsigned long time_now = 0;

String randNumberNic, randNumberAndres;

void setup() {
  Serial.begin(115200);
  Serial.println("Initializing...");
  if (!particleSensor.begin(Wire, I2C_SPEED_FAST)) {
    Serial.println("MAX30105 was not found. Please check wiring/power. ");
    while (1);
  }
  Serial.println("Place your index finger on the sensor with steady pressure.");
  particleSensor.setup();
  particleSensor.setPulseAmplitudeRed(0x0A);
  particleSensor.setPulseAmplitudeGreen(0);
}

void onConnectionEstablished() {
  client.subscribe("Transelectronicxs/valor_test", [](const String & topic, const String & message) {
    mensaje = message;
  });
}

void loop() {
  client.loop();
  long irValue = particleSensor.getIR();
  if (checkForBeat(irValue) == true) {
    long delta = millis() - lastBeat;
    lastBeat = millis();
    beatsPerMinute = 60 / (delta / 1000.0);
    if (beatsPerMinute < 255 && beatsPerMinute > 20) {
      rates[rateSpot++] = (byte)beatsPerMinute;
      rateSpot %= RATE_SIZE;
      beatAvg = 0;
      for (byte x = 0 ; x < RATE_SIZE ; x++)
        beatAvg += rates[x];
      beatAvg /= RATE_SIZE;
    }
  }
  Serial.print("IR=");
  Serial.print(irValue);
  Serial.print(", BPM=");
  Serial.print(beatsPerMinute);
  Serial.print(", Avg BPM=");
  Serial.print(beatAvg);
  if (irValue < 50000) Serial.print(" No finger?");
  String PromedioBeat = String(beatAvg);

  if (millis() >= time_now + period && mensaje == "true") {
    time_now += period;
    client.publish("BPM-promedio/Nic", PromedioBeat);
  }
}
