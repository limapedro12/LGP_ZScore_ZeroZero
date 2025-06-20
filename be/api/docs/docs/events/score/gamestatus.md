---
sidebar_position: 5
---
import Highlight from "../../../styleMd/highlight"

# Get Game Status

## Details

This endpoint retrieves the current status of the game, including the score per period and the current server (if applicable).

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
<Highlight level="caution" inline>Must be "gameStatus"</Highlight>

The action to perform. For this endpoint, use `"gameStatus"`.

---

## Example Request

**Code**: <Highlight level="success" inline>200 OK</Highlight>

```json
GET /events/score?placardId=123&sport=basketball&action=gameStatus
```

## Example Response

```json
{
  "totalPeriods": 4,
  "currentPeriod": 1,
  "currentScore": {
    "homeScore": 3,
    "awayScore": 0
  },
  "periods": [
    {
      "period": 1,
      "homePoints": 3,
      "awayPoints": 0,
      "totalPoints": 3,
      "winner": null
    }
  ],
  "currentServer": "home"
}
```

---

## Error Responses

### Missing Parameters

**Code**: <Highlight level="danger" inline>400 Bad Request</Highlight>

```json
{
  "error": "Missing placardId"
}
```