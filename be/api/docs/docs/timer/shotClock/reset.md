---
sidebar_position: 5
---
import Highlight from "../../../styleMd/highlight"

# Reset Shot Clock

## Details

This endpoint resets the shot clock for a placard (game) to the initial duration.

**URL:** `/timer/shotclock`  
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

### team
<Highlight level="info">Body Parameter</Highlight>
<Highlight level="success">Optional</Highlight>
<Highlight level="note">String</Highlight>
<Highlight level="caution" inline>Must be "home" or "away" if provided</Highlight>

The team for which the shot clock is reset. If not provided, uses the active team.

---

## Example Request

**Code**: <Highlight level="success" inline>200 OK</Highlight>

```json
POST /timer/shotclock
{
  "placardId": 123,
  "sport": "basketball",
  "action": "reset",
  "team": "home"
}
```

## Example Response

```json
{
  "message": "Shot clock reset for home team",
  "status": "paused",
  "team": "home",
  "remaining_time": 24
}
```

---

## Error Responses

### No Active Shot Clock

**Code**: <Highlight level="success" inline>200 OK</Highlight>

```json
{
  "message": "No active shot clock to reset",
  "status": "paused"
}
```