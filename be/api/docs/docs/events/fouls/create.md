---
sidebar_position: 1
---
import Highlight from "../../../styleMd/highlight"

# Create Foul Event

## Details

This endpoint creates a new foul event for a placard (game). It records a foul for a player and team in a specific period.

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
<Highlight level="caution" inline>Must be "create"</Highlight>

The action to perform. For this endpoint, use `"create"`.

### team
<Highlight level="info">Body Parameter</Highlight>
<Highlight level="danger">Required</Highlight>
<Highlight level="note">String</Highlight>
<Highlight level="caution" inline>Must be "home" or "away"</Highlight>

The team to which the foul is assigned.

### playerId
<Highlight level="info">Body Parameter</Highlight>
<Highlight level="danger">Required</Highlight>
<Highlight level="note">Integer</Highlight>

The ID of the player who committed the foul.

---

## Example Request

**Code**: <Highlight level="success" inline>201 Created</Highlight>

```json
POST /events/foul
{
  "placardId": 123,
  "sport": "futsal",
  "action": "create",
  "team": "home",
  "playerId": 45
}
```

## Example Response

```json
{
  "status": "success",
  "message": "Foul created.",
  "foul": {
    "eventId": "1",
    "placardId": "123",
    "sport": "futsal",
    "playerId": "45",
    "team": "home",
    "timestamp": 0,
    "period": 1,
    "accumulatedFoulsThisPeriod": 1,
    "penalty": false
  }
}
```

---

## Error Responses

### Missing Parameters

**Code**: <Highlight level="danger" inline>400 Bad Request</Highlight>

```json
{
  "status": "error",
  "message": "Missing or empty required fields for create: playerId, team"
}
```