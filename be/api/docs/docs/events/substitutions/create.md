---
sidebar_position: 1
---
import Highlight from "../../../styleMd/highlight"

# Create Substitution Event

## Details

This endpoint creates a new substitution event for a placard (game). It records a player substitution for a specific team.

**URL:** `/events/substitution`  
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

The team making the substitution.

### playerIn
<Highlight level="info">Body Parameter</Highlight>
<Highlight level="danger">Required</Highlight>
<Highlight level="note">Integer</Highlight>

The ID of the player coming in.

### playerOut
<Highlight level="info">Body Parameter</Highlight>
<Highlight level="danger">Required</Highlight>
<Highlight level="note">Integer</Highlight>

The ID of the player going out.

---

## Example Request

**Code**: <Highlight level="success" inline>201 Created</Highlight>

```json
POST /events/substitution
{
  "placardId": 123,
  "sport": "futsal",
  "action": "create",
  "team": "home",
  "playerIn": 10,
  "playerOut": 7
}
```

## Example Response

```json
{
  "message": "Substitution created successfully",
  "substitution": {
    "eventId": 1,
    "team": "home",
    "playerInId": 10,
    "playerOutId": 7,
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
  "error": "Missing playerIn or playerOut"
}
```

### Invalid Team

**Code**: <Highlight level="danger" inline>400 Bad Request</Highlight>

```json
{
  "error": "Missing valid team"
}
```

### Maximum Substitutions Reached

**Code**: <Highlight level="danger" inline>400 Bad Request</Highlight>

```json
{
  "error": "Maximum number of substitutions reached"
}
```