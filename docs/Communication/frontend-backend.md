# Frontend ↔ Backend Communication

Communication between the frontend and backend is performed through WebSockets using JSON messages.

## Message Structure

All messages follow the same general structure.

```json
{
    "event": "",
    "payload": {},
    "meta": {},
    "message": ""
}
```

| Property  | Type     | Description                                                                |
| --------- | -------- | -------------------------------------------------------------------------- |
| `event`   | `string` | Identifies the type of event being transmitted.                            |
| `payload` | `object` | Contains the event-specific data. The structure depends on the event type. |
| `meta`    | `object` | Additional metadata used by the frontend.                                  |
| `message` | `string` | Human-readable message intended for logs or user notifications.            |

---

## Example

```json
{
    "event": "HARDWARE_STATE",
    "payload": {
        "connected": true
    },
    "meta": {
        "severity": "info",
        "userVisible": true
    },
    "message": "Hardware connected on COM5 at 115200 baud."
}
```

---

## Event

The `event` field identifies the action or state being communicated.

Example:

```json
"event": "HARDWARE_STATE"
```

Each event defines the expected structure of its corresponding `payload`.

---

## Payload

The `payload` contains the data associated with the event.

Example:

```json
{
    "connected": true
}
```

The payload structure is specific to each event.

---

## Meta

The `meta` object provides additional information that does not belong to the application state itself.

Example:

```json
{
    "severity": "info",
    "userVisible": true
}
```

Current fields:

| Property      | Description                                                    |
| ------------- | -------------------------------------------------------------- |
| `severity`    | Message severity (`info`, `warning`, `error`, etc.).           |
| `userVisible` | Indicates whether the message should be displayed to the user. |

---

## Message

The `message` field contains a human-readable description of the event.

It is intended for:

* Application logs.
* Terminal output.
* User notifications.

Applications should **not** rely on this field for program logic. Instead, they should use the `event` and `payload` fields.

## Required Fields

Every message **must** contain the following fields:

* `event`
* `payload`

The following fields are optional:

* `meta`
* `message`

Messages that only update the application state usually omit `meta` and `message`.

Example: 

```json
{
    "event": "ROBOT_STATE",
    "payload": {
        "joints": [...]
    }
}
```