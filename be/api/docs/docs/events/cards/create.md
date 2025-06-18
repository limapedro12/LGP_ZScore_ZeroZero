---
sidebar_position: 1
---
import Highlight from "../../../styleMd/highlight"

# Create Card Event

## Details

This endpoint creates a new card event for a placard (game). It assigns a card to a player for a specific team.

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
<Highlight level="caution" inline>Must be "create"</Highlight>

The action to perform. For this endpoint, use `"create"`.

### team
<Highlight level="info">Body Parameter</Highlight>
<Highlight level="danger">Required</Highlight>
<Highlight level="note">String</Highlight>
<Highlight level="caution" inline>Must be "home" or "away"</Highlight>

The team to which the card is assigned.

### playerId
<Highlight level="info">Body Parameter</Highlight>
<Highlight level="danger">Required</Highlight>
<Highlight level="note">Integer</Highlight>

The ID of the player who receives the card.

### cardType
<Highlight level="info">Body Parameter</Highlight>
<Highlight level="danger">Required</Highlight>
<Highlight level="note">String</Highlight>

The type of card. Must be valid for the sport (e.g., `yellow`, `red`, `white`, etc.).

---

## Example Request

**Code**: <Highlight level="success" inline>201 Created</Highlight>

```json
POST /events/card
{
  "placardId": 123,
  "sport": "futsal",
  "action": "create",
  "team": "home",
  "playerId": 45,
  "cardType": "yellow"
}
```

## Example Response

```json
{
  "message": "Card event added successfully",
  "event": {
    "eventId": 1,
    "placardId": 123,
    "playerId": 45,
    "cardType": "yellow",
    "team": "home",
    "timestamp": 0
  }
}
```

---

## Error Responses

### Missing Parameters

**Code**: <Highlight level="danger" inline>400 Bad Request</Highlight>

```json
{
  "error": "Missing playerId or cardType for add action"
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