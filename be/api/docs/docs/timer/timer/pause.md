---
sidebar_position: 2
---
import Highlight from "../../../styleMd/highlight"

# Pause Timer

## Details

This endpoint pauses the currently running game timer for a placard (game).

**URL:** `/timer/timer`  
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
<Highlight level="caution" inline>Must be "pause"</Highlight>

The action to perform. For this endpoint, use `"pause"`.

---

## Example Request

**Code**: <Highlight level="success" inline>200 OK</Highlight>

```json
POST /timer/timer
{
  "placardId": 123,
  "sport": "futsal",
  "action": "pause"
}
```

## Example Response

```json
{
  "message": "Timer paused"
}
```

---

## Error Responses

### Invalid Method

**Code**: <Highlight level="danger" inline>405 Method Not Allowed</Highlight>

```json
{
  "error": "Invalid request method. Only POST is allowed for pause action."
}
```