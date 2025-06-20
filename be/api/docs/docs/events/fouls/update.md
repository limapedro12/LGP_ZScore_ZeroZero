---
sidebar_position: 3
---
import Highlight from "../../../styleMd/highlight"

# Update Foul Event

## Details

This endpoint updates a foul event for a placard (game) by its event ID. Only the player, team, or period can be updated.

**URL:** `/events/foul`  
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
<Highlight level="caution" inline>Must be "update"</Highlight>

The action to perform. For this endpoint, use `"update"`.

### eventId
<Highlight level="info">Body Parameter</Highlight>
<Highlight level="danger">Required</Highlight>
<Highlight level="note">Integer</Highlight>

The ID of the foul event to update.

### playerId
<Highlight level="info">Body Parameter</Highlight>
<Highlight level="success">Optional</Highlight>
<Highlight level="note">Integer</Highlight>

The new player ID.

### team
<Highlight level="info">Body Parameter</Highlight>
<Highlight level="success">Optional</Highlight>
<Highlight level="note">String</Highlight>
<Highlight level="caution" inline>Must be "home" or "away"</Highlight>

The new team.

### period
<Highlight level="info">Body Parameter</Highlight>
<Highlight level="success">Optional</Highlight>
<Highlight level="note">Integer</Highlight>

The new period.

---

## Example Request

**Code**: <Highlight level="success" inline>200 OK</Highlight>

```json
POST /events/foul
{
  "placardId": 123,
  "sport": "futsal",
  "action": "update",
  "eventId": 1,
  "playerId": 46,
  "team": "away",
  "period": 2
}
```

## Example Response

```json
{
  "status": "success",
  "message": "Foul updated.",
  "foul": {
    "eventId": "1",
    "placardId": "123",
    "sport": "futsal",
    "playerId": "46",
    "team": "away",
    "timestamp": 0,
    "period": 2
  }
}
```

---

## Error Responses

### Missing eventId

**Code**: <Highlight level="danger" inline>400 Bad Request</Highlight>

```json
{
  "status": "error",
  "message": "Missing required parameter: eventId for action 'update'"
}
```

### No Data to Update

**Code**: <Highlight level="danger" inline>200 OK</Highlight>

```json
{
  "status": "success",
  "message": "No changes detected. Foul event not updated.",
  "foul": {
    "eventId": "1",
    "placardId": "123",
    "sport": "futsal",
    "playerId": "45",
    "team": "home",
    "timestamp": 0,
    "period": 1
  }
}
```