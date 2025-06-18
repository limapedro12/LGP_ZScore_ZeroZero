---
sidebar_position: 3
---
import Highlight from "../../../styleMd/highlight"

# Update Substitution Event

## Details

This endpoint updates a substitution event for a placard (game) by its event ID. Only the playerIn, playerOut, or timestamp can be updated.

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
<Highlight level="caution" inline>Must be "update"</Highlight>

The action to perform. For this endpoint, use `"update"`.

### eventId
<Highlight level="info">Body Parameter</Highlight>
<Highlight level="danger">Required</Highlight>
<Highlight level="note">Integer</Highlight>

The ID of the substitution event to update.

### playerIn
<Highlight level="info">Body Parameter</Highlight>
<Highlight level="danger">Required</Highlight>
<Highlight level="note">Integer</Highlight>

The new player coming in.

### playerOut
<Highlight level="info">Body Parameter</Highlight>
<Highlight level="danger">Required</Highlight>
<Highlight level="note">Integer</Highlight>

The new player going out.

### newTimestamp
<Highlight level="info">Body Parameter</Highlight>
<Highlight level="success">Optional</Highlight>
<Highlight level="note">Integer</Highlight>

The new timestamp.

---

## Example Request

**Code**: <Highlight level="success" inline>200 OK</Highlight>

```json
POST /events/substitution
{
  "placardId": 123,
  "sport": "futsal",
  "action": "update",
  "eventId": 1,
  "playerIn": 11,
  "playerOut": 8,
  "newTimestamp": 120
}
```

## Example Response

```json
{
  "message": "Substitution updated successfully",
  "substitution": {
    "eventId": 1,
    "team": "home",
    "playerInId": 11,
    "playerOutId": 8,
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
  "error": "Missing eventId"
}
```

### No Data to Update

**Code**: <Highlight level="danger" inline>400 Bad Request</Highlight>

```json
{
  "error": "No changes detected"
}
```

### Substitution Not Found

**Code**: <Highlight level="danger" inline>404 Not Found</Highlight>

```json
{
  "error": "Substitution with ID 1 not found"
}
```