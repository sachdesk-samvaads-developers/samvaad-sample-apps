# Click-to-call dialer (CTI app)

This folder is a **CTI app** for Samvaad: a dialer docked at the bottom left of
every page of the agent workspace. When an agent clicks a contact's phone number,
the app places the call through [Exotel](https://exotel.com)'s click-to-call API.
Exotel rings the agent's phone first, then connects the customer. The app then
follows the call and logs its status, duration and recording link in Samvaad.

## What it shows

- **`cti_global` and the `cti` block** in `manifest.json`: the app becomes the
  workspace's phone system.
- **`cti.dial`**: the app gets a single-use `dial_ref` and the call's `call_id`,
  never the phone number. The `click2call` request sends `dial_ref`, and the
  server fills in `{{contact.phone}}` (`permissions.helpdesk: ["contact.phone"]`).
  Every use is written to the workspace's audit log.
- **A form body**: Exotel takes `application/x-www-form-urlencoded`. The body is
  written as an object and Samvaad form-encodes it, so a leading `+` survives.
- **Secrets stay on the server**: the API key and token are installation
  parameters, used only inside the request templates.
- **Call logging**: `client.interface.cti.logCall()` with the `call_id` from
  `cti.dial` records Exotel's call `Sid`, each status change, the duration and
  the recording link. The call shows in the Inbox, on the contact and in reports.
- **The dock pill**: `client.interface.cti.setStatus()` keeps the minimised dock
  showing *Ringing*, *On a call* or *Call ended*.

## Try it

You need an Exotel account with an ExoPhone, and a Samvaad workspace with
custom apps.

```bash
samvaad-app validate
samvaad-app pack
```

1. In Samvaad, go to **Admin → Custom apps → Install app** and upload the `.zip`.
2. Fill in the settings:
   - **API host**: `api.exotel.com` (Singapore cluster) or `api.in.exotel.com`
     (Mumbai cluster), whichever your Exotel dashboard shows.
   - **Account SID**, **API key** and **API token**: from Exotel's *API settings*.
   - **ExoPhone**: the number customers see.
   - **Agent phone**: the phone Exotel rings first.
3. On the app, turn on **Use as phone system**.
4. Open a contact with a phone number and click it. Click **Call** in the dock
   and answer your phone.

## Make it yours

- **Another provider**: change the `click2call` and `callDetails` requests in
  `manifest.json` (URL, headers and body), and how `assets/app.js` reads the
  provider's reply and statuses.
- **A phone per agent**: this sample rings one number from the settings. To ring
  each agent's own phone, add a field to the dock and pass it as
  `{{args.agent_phone}}`, or look it up in your own service.
- **A browser softphone**: pages the helpdesk serves (`"mode": "bundle"`) can't
  use the microphone. For WebRTC calls in the browser, use `"mode": "hosted"`
  with your own https page that loads the SDK. See *CTI apps (phone dock)* in
  the [SDK guide](https://developers.samvaads.com/docs/custom-apps).
- **Inbound calls and screen pop**: `client.interface.cti.screenPop({ phone })`
  finds the caller's contact. Your server can also log calls with
  `POST /api/v1/external/calls`.

## Files that get packed

`manifest.json` and `assets/`. This README is not uploaded.
