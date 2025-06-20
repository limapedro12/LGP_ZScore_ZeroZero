---
sidebar_position: 2
---
import Highlight from "../../../styleMd/highlight"

# Delete Card Event

## Details

This endpoint deletes a card event for a placard (game) by its event ID.

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
<Highlight level="caution" inline>Must be "delete"</Highlight>

The action to perform. For this endpoint, use `"delete"`.

### eventId
<Highlight level="info">Body Parameter</Highlight>
<Highlight level="danger">Required</Highlight>
<Highlight level="note">Integer</Highlight>

The ID of the card event to delete.

---

## Example Request

**Code**: <Highlight level="success" inline>200 OK</Highlight>

```json
POST /events/card
{
  "placardId": 123,
  "sport": "futsal",
  "action": "delete",
  "eventId": 1
}
```

## Example Response

```json
{
  "message": "Card event removed successfully",
  "eventId": 1
}
```

---

## Error Responses

### Missing eventId

**Code**: <Highlight level="danger" inline>400 Bad Request</Highlight>

```json
{
  "error": "Missing eventId for remove action"
}
```

### Card Event Not Found

**Code**: <Highlight level="danger" inline>404 Not Found</Highlight>

```json
{
  "error": "Card event not found"
}
```
