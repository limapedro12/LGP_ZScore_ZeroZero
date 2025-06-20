---
sidebar_position: 5
---
import Highlight from "../../../styleMd/highlight"

# Reset Timeout Events

## Details

This endpoint resets all timeout events and counters for a placard (game).

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
<Highlight level="caution" inline>Must be "reset"</Highlight>

The action to perform. For this endpoint, use `"reset"`.

---

## Example Request

**Code**: <Highlight level="success" inline>200 OK</Highlight>

```json
POST /events/timeout
{
  "placardId": 123,
  "sport": "futsal",
  "action": "reset"
}
```

## Example Response

```json
{
  "success": true,
  "message": "All timeout events and counters have been reset",
  "eventsRemoved": 2
}
```