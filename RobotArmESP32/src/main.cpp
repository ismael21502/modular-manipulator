#include <Arduino.h>
#include <ArduinoJson.h>
#include <ESP32Servo.h>
#define MAX_JOINTS 8
#define MAX_END_EFFECTORS 1

int jointPins[MAX_JOINTS] = {16, 17, 18, 19, 21, 22, 23, 25};
Servo joints[MAX_JOINTS];

int endEffectorPins[MAX_END_EFFECTORS] = {5};
Servo endEffectors[MAX_END_EFFECTORS];

int clamp(int val, int minVal, int maxVal)
{
  return val < minVal ? minVal : (val > maxVal ? maxVal : val);
}

void parseJson(const String &jsonStr)
{
  StaticJsonDocument<512> doc;
  DeserializationError error = deserializeJson(doc, jsonStr);
  if (error)
  {
    Serial.print("JSON error: ");
    Serial.println(error.c_str());
    return;
  }
  if (doc["type"] == "move_joints")
  {
    JsonArray values = doc["values"];
    if (values.isNull())
      return;
    for (int i = 0; i < MAX_JOINTS && i < values.size(); ++i)
    {
      int angle = clamp(values[i], 0, 180);
      joints[i].write(angle);
    }
  }
  else if (doc["type"] == "move_end_effector")
  {
    JsonArray values = doc["values"];
    if (values.isNull())
      return;
    for (int i = 0; i < MAX_END_EFFECTORS && i < values.size(); ++i)
    {
      int angle = clamp(values[i], 0, 180);
      endEffectors[i].write(angle);
    }
  }
}

void setup()
{
  Serial.begin(115200);
  for (int i = 0; i < MAX_JOINTS; ++i)
  {
    joints[i].attach(jointPins[i]);
  }
  for (int i = 0; i < MAX_END_EFFECTORS; ++i)
  {
    endEffectors[i].attach(endEffectorPins[i]);
  }
  Serial.setTimeout(10);
}

void loop()
{
  while (Serial.available())
  {
    String string = Serial.readStringUntil('\n');
    Serial.println(string);
    parseJson(string);
  }
}
