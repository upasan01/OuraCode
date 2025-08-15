# GoonShareAI
## Backend
*Make a redis instance at upstrash then proceed*
```bash
cd server
```
```bash
npm i
```
full fill `.env` according to `.env.example`
```bash
npm run dev
```

This is how a typical ws client side payload logic looks like:
```bash
ws.send(JSON.stringify({
  type: "join_room",
  roomId: "123",
  username: "John"
}));
```
