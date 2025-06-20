---
sidebar_position: 3
---
import Highlight from "../../../styleMd/highlight"

# Update Card Event

## Details

This endpoint updates a card event for a placard (game) by its event ID. Only the player, team, card type, or timestamp can be updated.

**URL:** `/events/card`  
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

The ID of the card event to update.

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

### cardType
<Highlight level="info">Body Parameter</Highlight>
<Highlight level="success">Optional</Highlight>
<Highlight level="note">String</Highlight>

The new card type.

### timestamp
<Highlight level="info">Body Parameter</Highlight>
<Highlight level="success">Optional</Highlight>
<Highlight level="note">Integer</Highlight>

The new timestamp.

---

## Example Request

**Code**: <Highlight level="success" inline>200 OK</Highlight>

```json
POST /events/card
{
  "placardId": 123,
  "sport": "futsal",
  "action": "update",
  "eventId": 1,
  "playerId": 46,
  "team": "away",
  "cardType": "red",
  "timestamp": 120
}
```

## Example Response

```json
{
  "message": "Card event updated successfully",
  "event": {
    "eventId": 1,
    "placardId": 123,
    "playerId": 46,
    "cardType": "red",
    "team": "away",
    "timestamp": 120
  }
}
```

---

## Error Responses

### Missing eventId

**Code**: <Highlight level="danger" inline>400 Bad Request</Highlight>

```json
{
  "error": "Missing eventId for update action"
}
```

### Invalid Card Type

**Code**: <Highlight level="danger" inline>400 Bad Request</Highlight>

```json
{
  "error": "Invalid card type"
}
```

### Invalid Team

**Code**: <Highlight level="danger" inline>400 Bad Request</Highlight>

```json
{
  "error": "Team parameter must be 'home' or 'away'"
}
```

### No Data to Update

**Code**: <Highlight level="danger" inline>400 Bad Request</Highlight>

```json
{
  "error": "No data to update or new values are the same as current values"
}
```