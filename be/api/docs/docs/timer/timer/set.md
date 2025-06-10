---
sidebar_position: 6
---
import Highlight from "../../../styleMd/highlight"

# Set Timer

## Details

This endpoint sets the remaining time and period of the main game timer for a placard (game) to specific values.

**URL:** `/timer/timer`  
**Method:** `POST`  

## Parameters

### placardId
<Highlight level="info">Body Parameter</Highlight>
<Highlight level="danger">Required</Highlight>
<Highlight level="note">Integer</Highlight>

The unique identifier of the placard (game).

### sport
<Highlight level="info">Body Parameter</Highlight>
<Highlight level="danger">Required</Highlight>
<Highlight level="note">String</Highlight>

The sport type. Must be one of: `futsal`, `basketball`, `volleyball`.

### action
<Highlight level="info">Body Parameter</Highlight>
<Highlight level="danger">Required</Highlight>
<Highlight level="note">String</Highlight>
<Highlight level="caution" inline>Must be "set"</Highlight>

The action to perform. For this endpoint, use `"set"`.

### time
<Highlight level="info">Body Parameter</Highlight>
<Highlight level="danger">Required</Highlight>
<Highlight level="note">Integer</Highlight>

The new time (in seconds) to set for the timer.

### period
<Highlight level="info">Body Parameter</Highlight>
<Highlight level="success">Optional</Highlight>
<Highlight level="note">Integer</Highlight>

The period to set (defaults to current period if not provided).

---

## Example Request

**Code**: <Highlight level="success" inline>200 OK</Highlight>

```json
POST /timer/timer
{
  "placardId": 123,
  "sport": "futsal",
  "action": "set",
  "time": 600,
  "period": 2
}
```

## Example Response

```json
{
  "message": "Timer manually changed to 10:0 and period 2",
  "status": "paused",
  "period": 2,
  "total_periods": 2
}
```

---

## Error Responses

### Missing Time

**Code**: <Highlight level="danger" inline>400 Bad Request</Highlight>

```json
{
  "error": "Missing time parameter"
}
```

### Invalid Period

**Code**: <Highlight level="danger" inline>400 Bad Request</Highlight>

```json
{
  "error": "Invalid period value"
}
```