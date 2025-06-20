---
sidebar_position: 4
---
import Highlight from "../../../styleMd/highlight"

# Adjust Timeout Events

## Details

This endpoint adjusts the number of timeout events for a team in a placard (game). You can add or remove timeouts.

**URL:** `/events/timeout`  
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
<Highlight level="caution" inline>Must be "adjust"</Highlight>

The action to perform. For this endpoint, use `"adjust"`.

### team
<Highlight level="info">Body Parameter</Highlight>
<Highlight level="danger">Required</Highlight>
<Highlight level="note">String</Highlight>
<Highlight level="caution" inline>Must be "home" or "away"</Highlight>

The team whose timeouts are being adjusted.

### amount
<Highlight level="info">Body Parameter</Highlight>
<Highlight level="danger">Required</Highlight>
<Highlight level="note">Integer</Highlight>

The number of timeouts to add (positive) or remove (negative).

---

## Example Request

**Code**: <Highlight level="success" inline>200 OK</Highlight>

```json
POST /events/timeout
{
  "placardId": 123,
  "sport": "futsal",
  "action": "adjust",
  "team": "home",
  "amount": 1
}
```

## Example Response

```json
{
  "message": "Timeouts added successfully => 1",
  "team": "home",
  "homeTimeoutsUsed": 1,
  "awayTimeoutsUsed": 0
}
```

---

## Error Responses

### Exceeds Maximum

**Code**: <Highlight level="danger" inline>400 Bad Request</Highlight>

```json
{
  "error": "Additional timeouts exceed maximum limit for home team from 1 allowed",
  "team": "home"
}
```

### Remove More Than Exists

**Code**: <Highlight level="danger" inline>400 Bad Request</Highlight>

```json
{
  "error": "Cannot remove 2 timeouts. Only 1 timeouts exist for home team",
  "team": "home"
}
```