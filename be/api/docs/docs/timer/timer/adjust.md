---
sidebar_position: 4
---
import Highlight from "../../../styleMd/highlight"

# Adjust Timer

## Details

This endpoint adjusts the remaining time of the main game timer for a placard (game) by a given number of seconds.

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
<Highlight level="caution" inline>Must be "adjust"</Highlight>

The action to perform. For this endpoint, use `"adjust"`.

### seconds
<Highlight level="info">Body Parameter</Highlight>
<Highlight level="danger">Required</Highlight>
<Highlight level="note">Integer</Highlight>

The number of seconds to add (positive) or subtract (negative) from the timer.

---

## Example Request

**Code**: <Highlight level="success" inline>200 OK</Highlight>

```json
POST /timer/timer
{
  "placardId": 123,
  "sport": "futsal",
  "action": "adjust",
  "seconds": -30
}
```

## Example Response

```json
{
  "message": "Timer adjusted by -30 seconds",
  "status": "paused"
}
```

---

## Error Responses

### Missing Seconds

**Code**: <Highlight level="danger" inline>400 Bad Request</Highlight>

```json
{
  "error": "Missing seconds parameter"
}
```