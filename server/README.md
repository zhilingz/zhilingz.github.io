# Homepage Agent Server

## Run

```bash
cp .env.example .env
npm install
npm start
```

Set `OPENAI_API_KEY` in `.env`.

## API

`POST /api/chat`

```json
{
  "messages": [
    { "role": "user", "content": "介绍一下张志凌" }
  ]
}
```
