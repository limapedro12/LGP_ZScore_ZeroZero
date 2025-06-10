---
sidebar_position: 3
---
import Highlight from "../../../styleMd/highlight"

# Get Shot Clock Status

## Details

This endpoint retrieves the current status of the shot clock for a placard (game).

**URL:** `/timer/shotclock`  
**Method:** `GET`  

## Parameters

### placardId
<Highlight level="info">Query Parameter</Highlight>
<Highlight level="danger">Required</Highlight>
<Highlight level="note">Integer</Highlight>

The unique identifier of the placard (game).

### sport
<Highlight level="info">Query Parameter</Highlight>
<Highlight level="danger">Required</Highlight>
<Highlight level="note">String</Highlight>

The sport type. Must be one of: `futsal`, `basketball`, `volleyball`.

### action
<Highlight level="info">Query Parameter</Highlight>
<Highlight level="danger">Required</Highlight>
<Highlight level="note">String</Highlight>
<Highlight level="caution" inline>Must be "status"</Highlight>

The action to perform. For this endpoint, use `"status"`.

---

## Example Request

**Code**: <Highlight level="success" inline>200 OK</Highlight>

```json
GET /timer/shotclock?placardId=123&sport=basketball&action=status
```

## Example Response

```json
{
  "status": "paused",
  "team": "home",
  "remaining_time": 12,
  "duration": 24
}
```