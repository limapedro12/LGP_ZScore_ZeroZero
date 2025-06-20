---
sidebar_position: 1
---
import Highlight from "../../../styleMd/highlight"

# Start Timer

## Details

This endpoint starts the main game timer for a placard (game). If the timer is already running, it returns the current status.

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
<Highlight level="caution" inline>Must be "start"</Highlight>

The action to perform. For this endpoint, use `"start"`.

---

## Example Request

**Code**: <Highlight level="success" inline>200 OK</Highlight>

```json
POST /timer/timer
{
  "placardId": 123,
  "sport": "futsal",
  "action": "start"
}
```

## Example Response

```json
{
  "message": "Timer started"
}
```

---

## Error Responses

### Invalid Method

**Code**: <Highlight level="danger" inline>405 Method Not Allowed</Highlight>

```json
{
  "error": "Invalid request method. Only POST is allowed for start action."
}
```