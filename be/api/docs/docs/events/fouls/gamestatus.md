---
sidebar_position: 5
---
import Highlight from "../../../styleMd/highlight"

# Get Foul Game Status

## Details

This endpoint retrieves the current foul status of the game, including the number of fouls per team in the current period and the penalty threshold.

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
<Highlight level="caution" inline>Must be "gameStatus"</Highlight>

The action to perform. For this endpoint, use `"gameStatus"`.

---

## Example Request

**Code**: <Highlight level="success" inline>200 OK</Highlight>

```json
GET /events/foul?placardId=123&sport=futsal&action=gameStatus
```

## Example Response

```json
{
  "status": "success",
  "message": "Game foul status for period 1 retrieved.",
  "data": {
    "placardId": "123",
    "sport": "futsal",
    "currentGamePeriod": 1,
    "currentPeriodFouls": {
      "home": 2,
      "away": 1
    },
    "foulsPenaltyThreshold": 5
  }
}
```

---

## Error Responses

### Missing Parameters

**Code**: <Highlight level="danger" inline>400 Bad Request</Highlight>

```json
{
  "status": "error",
  "message": "Missing required parameter: placardId"
}
```