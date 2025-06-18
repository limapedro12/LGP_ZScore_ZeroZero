---
sidebar_position: 4
---
import Highlight from "../../../styleMd/highlight"

# Get Substitution Events

## Details

This endpoint retrieves all substitution events for a placard (game).

**URL:** `/events/substitution`  
**Method:** `GET`  

## Parameters

### placardId
<Highlight level="info">Query Parameter</Highlight>
<Highlight level="danger">Required</Highlight>
<Highlight level="note">Integer</Highlight>

The unique identifier of the placard (game).

### sport
<Highlight level="info">Query Parameter</Highlight>
<Highlight level="danger">Required</Highlight>
<Highlight level="note">String</Highlight>

The sport type. Must be one of: `futsal`, `basketball`, `volleyball`.

### action
<Highlight level="info">Query Parameter</Highlight>
<Highlight level="danger">Required</Highlight>
<Highlight level="note">String</Highlight>
<Highlight level="caution" inline>Must be "get"</Highlight>

The action to perform. For this endpoint, use `"get"`.

---

## Example Request

**Code**: <Highlight level="success" inline>200 OK</Highlight>

```json
GET /events/substitution?placardId=123&sport=futsal&action=get
```

## Example Response

```json
{
  "message": "Substitution status retrieved successfully",
  "substitutions": [
    {
      "eventId": 1,
      "team": "home",
      "playerInId": 10,
      "playerOutId": 7,
      "timestamp": 0
    }
  ]
}
```

---

## Error Responses

### No Events

**Code**: <Highlight level="success" inline>200 OK</Highlight>

```json
{
  "substitutions": []
}
```