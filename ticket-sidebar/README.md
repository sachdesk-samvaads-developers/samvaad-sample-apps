# Ticket context (sidebar template)

This folder is a **frontend custom app** for Samvaad. After you edit it, an administrator uploads a packed `.samvaad-app.json` file — they do not need this folder.

## What it does

`assets/index.html` loads in the **Apps** panel on ticket details and inbox conversations. `assets/app.js` calls `SamvaadClient.init()`, reads the slim ticket or conversation snapshot, and resizes the iframe.

## Commands

```bash
samvaad-app validate
samvaad-app serve --port 10001
```

In the agent workspace console:

```javascript
localStorage.setItem('samvaad_app_dev_url', 'http://127.0.0.1:10001/')
```

Reload, expand **Apps**. Pack when ready:

```bash
samvaad-app pack
```

## Live test

Keep `samvaad-app serve` running. Open a ticket and add `?dev=true` to the URL.

## Files that get packed

Only `assets/` (and `server/` if you add it). This README is not uploaded.

## Next steps

- Change `manifest.json` `name`, `slug`, and `version`.
- Edit `assets/app.css` for layout; keep the UI compact (height is clamped ~80–640px).
- Add `permissions.allowedHosts` if you will call `client.request`.
- Do not put API keys in `assets/`. Use installation parameters (`iparams`) and a serverless handler for secrets.
- For an authenticated iframe-triggered request, add an iparam such as `{ "name": "api_key", "type": "password", "label": "API key" }` and reference it only from a manifest `requests` template called with `client.request.invoke`.

The full reference is the Samvaad App SDK README that shipped with `samvaad-app-sdk`.
