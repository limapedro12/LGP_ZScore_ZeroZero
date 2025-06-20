---
sidebar_position: 4
---
import Highlight from "../../../styleMd/highlight"

# Get Card Events

## Details

This endpoint retrieves all card events for a placard (game).

**URL:** `/events/card`  
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
GET /events/card?placardId=123&sport=futsal&action=get
```

## Example Response

```json
{
  "cards": [
    {
      "eventId": 1,
      "placardId": 123,
      "playerId": 45,
      "cardType": "yellow",
      "team": "home",
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
  "cards": []
}
```