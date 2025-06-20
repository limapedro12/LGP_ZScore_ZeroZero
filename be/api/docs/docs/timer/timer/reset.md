---
sidebar_position: 5
---
import Highlight from "../../../styleMd/highlight"

# Reset Timer

## Details

This endpoint resets the main game timer for a placard (game) to the initial period and duration.

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
<Highlight level="caution" inline>Must be "reset"</Highlight>

The action to perform. For this endpoint, use `"reset"`.

---

## Example Request

**Code**: <Highlight level="success" inline>200 OK</Highlight>

```json
POST /timer/timer
{
  "placardId": 123,
  "sport": "futsal",
  "action": "reset"
}
```

## Example Response

```json
{
  "message": "Timer reset",
  "status": "paused",
  "remaining_time": 1200,
  "period": 1,
  "total_periods": 2
}
```