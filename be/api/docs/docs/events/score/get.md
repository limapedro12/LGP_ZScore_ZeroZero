---
sidebar_position: 4
---
import Highlight from "../../../styleMd/highlight"

# Get Score Events

## Details

This endpoint retrieves all score events for a placard (game).

**URL:** `/events/score`  
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
GET /events/score?placardId=123&sport=basketball&action=get
```

## Example Response

```json
{
  "points": [
    {
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
  ]
}
```

---

## Error Responses

### No Events

**Code**: <Highlight level="success" inline>200 OK</Highlight>

```json
{
  "points": []
}
```
