---
sidebar_position: 1
---
import Highlight from "../../../styleMd/highlight"

# Start Timeout

## Details

This endpoint starts a timeout for a team in a placard (game). It checks the allowed number of timeouts and updates the timer.

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
<Highlight level="caution" inline>Must be "start"</Highlight>

The action to perform. For this endpoint, use `"start"`.

### team
<Highlight level="info">Body Parameter</Highlight>
<Highlight level="danger">Required</Highlight>
<Highlight level="note">String</Highlight>
<Highlight level="caution" inline>Must be "home" or "away"</Highlight>

The team requesting the timeout.

---

## Example Request

**Code**: <Highlight level="success" inline>201 Created</Highlight>

```json
POST /events/timeout
{
  "placardId": 123,
  "sport": "futsal",
  "action": "start",
  "team": "home"
}
```

## Example Response

```json
{
  "message": "Timeout event added successfully",
  "timer": {
    "status": "running",
    "team": "home",
    "remaining_time": 60
  },
  "event": {
    "eventId": 1,
    "placardId": 123,
    "team": "home",
    "teamTimeoutsUsed": 1,
    "timeSpan": 0,
    "period": 1
  }
}
```

---

## Error Responses

### Maximum Timeouts Reached

**Code**: <Highlight level="danger" inline>400 Bad Request</Highlight>

```json
{
  "error": "Maximum timeouts reached for home team in period 1 (1 of 1 allowed per period)"
}
```