# Ticket webhook (serverless template)

This folder is a **serverless custom app** for Samvaad. Handlers run on the helpdesk **worker** when tickets and messages change. After you edit it, pack a `.samvaad-app.json` for an administrator to upload.

## Default mode: hosted JavaScript

`server/server.js` exports `onTicketCreate`, `onTicketUpdate`, and `onMessageReceived`. The worker runs that file in a sandbox: no `require`, ~3 second timeout, `request()` only to hosts in `manifest.permissions.allowedHosts`.

```bash
samvaad-app validate
samvaad-app test-event . onTicketCreate --payload '{"ticket_id":"t1"}'
samvaad-app pack
```

Open the simulator while serving:

```text
http://127.0.0.1:10001/simulator
```

`request()` is stubbed locally and throws. Test real outbound HTTP after install.

## Switch to HTTP mode

If you want the worker to POST to **your** HTTPS URL instead of running `server.js`:

1. Set `"serverless": { "mode": "http", "endpoint": "https://your.example/samvaad" }`.
2. You may omit `server/server.js` once mode is `http` (or keep it unused).
3. After install, copy the **webhook secret** (shown once) and verify `X-Samvaad-Signature` as described in the SDK README.

The admin can also set or override the endpoint in **Configure** without a re-pack.

## Files that get packed

Only `server/` (and `assets/` if you add a sidebar). This README is not uploaded.

## After install

Confirm the domain-events **worker** is running. Open **Admin → Custom apps → Invocations**. Use **Send test event** to fire the first listed handler.

The full reference is the Samvaad App SDK README that shipped with `samvaad-app-sdk`.
