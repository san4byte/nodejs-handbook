# NodeJs Todolist API Spec

server: http://localhost:3000

$schema response :

```json
{
  "code": number -> 200 | 400 | ...,
  "status": string -> "OK" | "FAILED",
  "data": [
    {
      "id": number -> 0 | 1 | ...,
      "todo": string -> "your todo"
    }
  ]
}
```

## GET

endpoind: GET /api

Response Body :

```json
{
  "code": 0,
  "status": "string",
  "data": [
    {
      "id": 0,
      "todo": "your todo"
    }
    // other todo
  ]
}
```

## POST

endpoind: POST /api

Request Body :

```json
{
  "todo": "your todo"
}
```

Response Body :

```json
{
  "code": 0,
  "status": "string",
  "data": [
    {
      "id": 0,
      "todo": "your todo"
    }
  ]
}
```

## DELETE

endpoind: DELETE /api

Request Body :

```json
{
  "id": 0
}
```

Response Body :

```json
{
  "code": 0,
  "status": "string",
  "data": [
    {
      "id": 0,
      "todo": "your todo"
    }
  ]
}
```

## PUT

endpoind: PUT /api

Request Body :

```json
{
  "id": 0,
  "todo": "your todo update"
}
```

Response Body :

```json
{
  "code": 0,
  "status": "string",
  "data": [
    {
      "id": 0,
      "todo": "your todo"
    }
  ]
}
```
