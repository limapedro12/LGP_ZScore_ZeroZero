---
sidebar_position: 1
---
import Highlight from "../../../styleMd/highlight"

# Start Shot Clock

## Details

This endpoint starts the shot clock for a team in a placard (game). If the shot clock is already running for the team, it returns the current status.

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
<Highlight level="caution" inline>Must be "start"</Highlight>

The action to perform. For this endpoint, use `"start"`.

### team
<Highlight level="info">Body Parameter</Highlight>
<Highlight level="danger">Required</Highlight>
<Highlight level="note">String</Highlight>
<Highlight level="caution" inline>Must be "home" or "away"</Highlight>

The team for which the shot clock is started.

---

## Example Request

**Code**: <Highlight level="success" inline>200 OK</Highlight>

```json
POST /timer/shotclock
{
  "placardId": 123,
  "sport": "basketball",
  "action": "start",
  "team": "home"
}
```

## Example Response

```json
{
  "message": "Shot clock started for home team",
  "status": "running",
  "team": "home",
  "remaining_time": 24
}
```

---

## Error Responses

### Missing Team

**Code**: <Highlight level="danger" inline>400 Bad Request</Highlight>

```json
{
  "error": "Team parameter is required for start action"
}
```

### Invalid Team

**Code**: <Highlight level="danger" inline>400 Bad Request</Highlight>

```json
{
  "error": "Team parameter must be 'home' or 'away'"
}
```