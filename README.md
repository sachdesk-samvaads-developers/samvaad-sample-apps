# Samvaad sample apps

Example custom apps built with the [Samvaad App SDK](https://developers.samvaads.com/docs). Clone this repo, pick a sample, and use it as the starting point for your own app.

| Sample | Kind | What it shows |
| --- | --- | --- |
| [`ticket-sidebar`](ticket-sidebar/) | Frontend (iframe) | Reads the current ticket or conversation, reacts to `ticket.updated` / `conversation.updated`, resizes itself, and opens a slider page that returns a result |
| [`serverless-http`](serverless-http/) | Serverless | Hosted handlers for `onTicketCreate`, `onTicketUpdate` and `onMessageReceived`, with notes on switching to your own HTTPS endpoint |

## Get started

Install the SDK CLI:

```bash
npm install -g samvaad-app-sdk
```

Then, inside any sample folder:

```bash
samvaad-app validate
samvaad-app serve --port 10001
```

Each sample's README explains how to preview it live in your Samvaad workspace, and how to pack it into a `.samvaad-app.json` file for an administrator to upload.

## Documentation

- [Custom apps SDK guide](https://developers.samvaads.com/docs/custom-apps) — manifest reference, locations, installation parameters, OAuth connections, `SamvaadClient` API and serverless events
- [External API reference](https://developers.samvaads.com/docs/api) — REST endpoints your app's backend can call

## Good practice

- Never commit API keys or secrets. Collect them as installation parameters (`iparams` of type `password`) and use them only from manifest `requests` templates or serverless handlers.
- List every outside host your app calls in `permissions.allowedHosts`.
- Change `name`, `slug` and `version` in `manifest.json` before you ship your own app.

## License

[MIT](LICENSE)
