---
sidebar_position: 1
---
import Highlight from "../../../styleMd/highlight"

# Create Score Event

## Details

This endpoint creates a new score event for a placard (game). It updates the score for the specified team and player.

**URL:** `/events/score`  
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

The team to which the score is added.

### playerId
<Highlight level="info">Body Parameter</Highlight>
<Highlight level="danger">Required</Highlight>
<Highlight level="note">Integer</Highlight>

The ID of the player who scored.

### pointValue
<Highlight level="info">Body Parameter</Highlight>
<Highlight level="success">Optional</Highlight>
<Highlight level="note">Integer</Highlight>
<Highlight level="caution">Required for basketball (1, 2, or 3)</Highlight>

The value of the point. For basketball, must be 1, 2, or 3. For other sports, this is optional.

---

## Example Request

**Code**: <Highlight level="success" inline>201 Created</Highlight>

```json
POST /events/score
{
  "placardId": 123,
  "sport": "basketball",
  "action": "create",
  "team": "home",
  "playerId": 45,
  "pointValue": 3
}
```

## Example Response

```json
{
  "message": "Point event added successfully",
  "event": {
    "eventId": 1,
    "placardId": 123,
    "team": "home",
    "playerId": 45,
    "period": 1,
    "pointValue": 3,
    "periodTotalPoints": 3,
    "teamPoints": 3,
    "timeSpan": 0
  }
}
```

---

## Error Responses

### Missing Parameters

**Code**: <Highlight level="danger" inline>400 Bad Request</Highlight>

```json
{
  "error": "Missing playerId for create action"
}
```

### Invalid Team

**Code**: <Highlight level="danger" inline>400 Bad Request</Highlight>

```json
{
  "error": "Team parameter must be 'home' or 'away'"
}
```

### Invalid Point Value (Basketball)

**Code**: <Highlight level="danger" inline>400 Bad Request</Highlight>

```json
{
  "error": "For basketball, pointValue must be one of: 1, 2, 3"
}
```