---
sidebar_position: 4
---
import Highlight from "../../../styleMd/highlight"

# Get Foul Events

## Details

This endpoint retrieves all foul events for a placard (game).

**URL:** `/events/foul`  
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
GET /events/foul?placardId=123&sport=futsal&action=get
```

## Example Response

```json
{
  "status": "success",
  "fouls": [
    {
      "eventId": "1",
      "placardId": "123",
      "sport": "futsal",
      "playerId": "45",
      "team": "home",
      "timestamp": 0,
      "period": 1
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
  "status": "success",
  "fouls": []
}
```