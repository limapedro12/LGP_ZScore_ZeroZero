---
sidebar_position: 7
---
import Highlight from "../../../styleMd/highlight"

# Get Timeout Game Status

## Details

This endpoint retrieves the current timeout status for the game, including the number of timeouts used per team and per period.

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
<Highlight level="caution" inline>Must be "gameStatus"</Highlight>

The action to perform. For this endpoint, use `"gameStatus"`.

---

## Example Request

**Code**: <Highlight level="success" inline>200 OK</Highlight>

```json
GET /events/timeout?placardId=123&sport=futsal&action=gameStatus
```

## Example Response

```json
{
  "homeTimeoutsUsed": 1,
  "awayTimeoutsUsed": 0,
  "totalTimeoutsPerTeam": 1,
  "currentPeriod": 1,
  "perPeriodTracking": true
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