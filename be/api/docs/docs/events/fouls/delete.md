---
sidebar_position: 2
---
import Highlight from "../../../styleMd/highlight"

# Delete Foul Event

## Details

This endpoint deletes a foul event for a placard (game) by its event ID.

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
<Highlight level="caution" inline>Must be "delete"</Highlight>

The action to perform. For this endpoint, use `"delete"`.

### eventId
<Highlight level="info">Body Parameter</Highlight>
<Highlight level="danger">Required</Highlight>
<Highlight level="note">Integer</Highlight>

The ID of the foul event to delete.

---

## Example Request

**Code**: <Highlight level="success" inline>200 OK</Highlight>

```json
POST /events/foul
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
  "status": "success",
  "message": "Foul deleted.",
  "eventId": "1",
  "newAccumulatedCountForTeam": 0
}
```

---

## Error Responses

### Missing eventId

**Code**: <Highlight level="danger" inline>400 Bad Request</Highlight>

```json
{
  "status": "error",
  "message": "Missing required parameter: eventId for action 'delete'"
}
```

### Foul Event Not Found

**Code**: <Highlight level="danger" inline>404 Not Found</Highlight>

```json
{
  "status": "error",
  "message": "Delete failed: foul event not found or already deleted (nothing removed)."
}
```