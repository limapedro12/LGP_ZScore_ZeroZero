---
sidebar_position: 2
---
import Highlight from "../../../styleMd/highlight"

# Pause Timeout

## Details

This endpoint pauses the currently running timeout for a placard (game).

**URL:** `/events/timeout`  
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
<Highlight level="caution" inline>Must be "pause"</Highlight>

The action to perform. For this endpoint, use `"pause"`.

---

## Example Request

**Code**: <Highlight level="success" inline>200 OK</Highlight>

```json
POST /events/timeout
{
  "placardId": 123,
  "sport": "futsal",
  "action": "pause"
}
```

## Example Response

```json
{
  "message": "Timeout paused",
  "status": "paused",
  "team": "home",
  "remaining_time": 30
}
```

---

## Error Responses

### No Timeout Running

**Code**: <Highlight level="danger" inline>400 Bad Request</Highlight>

```json
{
  "error": "No timeout currently running",
  "status": "inactive"
}
```