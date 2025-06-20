---
sidebar_position: 6
---
import Highlight from "../../../styleMd/highlight"

# Get Timeout Events

## Details

This endpoint retrieves all timeout events for a placard (game).

**URL:** `/events/timeout`  
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
GET /events/timeout?placardId=123&sport=futsal&action=get
```

## Example Response

```json
{
  "events": [
    {
      "eventId": 1,
      "placardId": 123,
      "team": "home",
      "teamTimeoutsUsed": 1,
      "timeSpan": 0,
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
  "events": []
}
```