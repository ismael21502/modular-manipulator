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

| Property | Required | Type | Description |
|----------|:--------:|------|-------------|
| `event` | Yes | `string` | Identifies the event being transmitted. |
| `payload` | Yes | `object` | Contains the data associated with the event. Its structure depends on the event type. |
| `meta` | No | `object` | Contains additional metadata for the frontend. |
| `message` | No | `string` | Human-readable description intended for logs or user notifications. |

---

## Examples

### Complete message

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

### State update message

Messages that only update the application state usually omit the optional `meta` and `message` fields.

```json
{
    "event": "ROBOT_STATE",
    "payload": {
        "joints": [...]
    }
}
```

---

## Event

The `event` field identifies the action or state being communicated.

```json
"event": "HARDWARE_STATE"
```

Each event defines the expected structure of its corresponding `payload`.

---

## Payload

The `payload` field contains the data associated with an event.

Its structure varies depending on the event type.

Example:

```json
{
    "connected": true
}
```

---

## Meta

The optional `meta` object contains additional information used by the frontend.

Example:

```json
{
    "severity": "info",
    "userVisible": true
}
```

Current fields:

| Property | Description |
|----------|-------------|
| `severity` | Message severity (`info`, `warning`, `error`, etc.). |
| `userVisible` | Indicates whether the message should be displayed to the user. |

---

## Message

The optional `message` field contains a human-readable description of the event.

It is intended for:

- Application logs.
- Terminal output.
- User notifications.

> [!NOTE]
> Frontend logic should rely on the `event` and `payload` fields, **not** on the `message` field.