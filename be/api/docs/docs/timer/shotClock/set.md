---
sidebar_position: 6
---
import Highlight from "../../../styleMd/highlight"

# Set Shot Clock

## Details

This endpoint sets the remaining time of the shot clock for a placard (game) to a specific value.

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
<Highlight level="caution" inline>Must be "set"</Highlight>

The action to perform. For this endpoint, use `"set"`.

### time
<Highlight level="info">Body Parameter</Highlight>
<Highlight level="danger">Required</Highlight>
<Highlight level="note">Integer</Highlight>

The new time (in seconds) to set for the shot clock.

### team
<Highlight level="info">Body Parameter</Highlight>
<Highlight level="success">Optional</Highlight>
<Highlight level="note">String</Highlight>
<Highlight level="caution" inline>Must be "home" or "away" if provided</Highlight>

The team for which the shot clock is set. If not provided, uses the active team.

---

## Example Request

**Code**: <Highlight level="success" inline>200 OK</Highlight>

```json
POST /timer/shotclock
{
  "placardId": 123,
  "sport": "basketball",
  "action": "set",
  "time": 14,
  "team": "away"
}
```

## Example Response

```json
{
  "message": "Shot clock set to 14 seconds for away team",
  "status": "paused",
  "team": "away",
  "remaining_time": 14,
  "duration": 24
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

### Invalid Time

**Code**: <Highlight level="danger" inline>400 Bad Request</Highlight>

```json
{
  "error": "Time must be a non-negative value"
}
```