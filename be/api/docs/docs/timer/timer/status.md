---
sidebar_position: 3
---
import Highlight from "../../../styleMd/highlight"

# Get Timer Status

## Details

This endpoint retrieves the current status of the main game timer for a placard (game).

**URL:** `/timer/timer`  
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
GET /timer/timer?placardId=123&sport=futsal&action=status
```

## Example Response

```json
{
  "message": "Timer status",
  "status": "paused",
  "remaining_time": 1200,
  "period": 1,
  "total_periods": 2
}
```