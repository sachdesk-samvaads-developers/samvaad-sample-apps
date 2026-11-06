(async function () {
  const client = await window.SamvaadClient.init();
  const $ = (id) => document.getElementById(id);
  const ENDED = ['completed', 'busy', 'no-answer', 'failed', 'canceled'];
  let pending = null;
  let live = null; // { call_id, sid, timer, ended, polls }

  function show(section) {
    for (const id of ['idle', 'pending', 'calling']) $(id).hidden = id !== section;
  }

  function setState(state, label) {
    $('state').textContent = label;
    client.interface.cti.setStatus(state, label);
  }

  function showError(message) {
    $('error').textContent = message;
    $('error').hidden = !message;
  }

  function exotelError(res) {
    const body = res && res.body;
    const msg = body && body.RestException && body.RestException.Message;
    return msg || 'Exotel answered ' + (res && res.status);
  }

  // Exotel says queued / ringing / in-progress / completed / busy / no-answer / failed / canceled.
  function samvaadStatus(exotel) {
    const s = String(exotel || '').toLowerCase();
    if (s === 'queued') return 'initiated';
    return ['ringing', 'in-progress'].concat(ENDED).includes(s) ? s : 'in-progress';
  }

  function log(fields) {
    return client.interface.cti.logCall(Object.assign({ call_id: live.call_id }, fields)).catch((err) => {
      showError('Could not log the call: ' + ((err && err.message) || err));
    });
  }

  async function poll() {
    if (!live) return;
    live.polls += 1;
    try {
      const res = await client.request.invoke('callDetails', { sid: live.sid });
      const call = res.body && res.body.Call;
      if (res.status !== 200 || !call) throw new Error(exotelError(res));
      const status = samvaadStatus(call.Status);
      $('detail').textContent = 'Exotel: ' + call.Status + (call.Duration ? ' · ' + call.Duration + ' s' : '');
      if (!ENDED.includes(status)) {
        setState(status === 'in-progress' ? 'on_call' : 'ringing', status === 'in-progress' ? 'On a call' : 'Ringing');
        if (status !== live.lastStatus) await log({ status });
        live.lastStatus = status;
      } else {
        // The recording link can arrive a little after the call ends: wait for it a few more times.
        const recording = call.RecordingUrl || '';
        if (!live.ended) {
          live.ended = true;
          await log({ status, duration_sec: Number(call.Duration) || 0, ended_at: new Date().toISOString() });
          setState('idle', 'Call ended');
        }
        if (recording || live.polls > live.endedAt + 12) {
          if (recording) await log({ recording_url: recording });
          $('detail').textContent += recording ? ' · recording saved' : ' · no recording';
          stop();
          return;
        }
        if (live.endedAt === Infinity) live.endedAt = live.polls;
      }
    } catch (err) {
      showError((err && err.message) || 'Could not read the call from Exotel.');
    }
    live.timer = setTimeout(poll, 5000);
  }

  function stop() {
    if (live && live.timer) clearTimeout(live.timer);
    live = null;
  }

  // An agent clicked a phone number. You get a single-use dial_ref and the call's id, not the number.
  client.on('cti.dial', (dial) => {
    if (live) {
      showError('Finish the current call first.');
      return;
    }
    pending = dial;
    showError('');
    $('who').textContent = dial.name || 'this contact';
    show('pending');
    setState('idle', 'Ready');
    client.interface.cti.show();
  });

  $('call').addEventListener('click', async () => {
    if (!pending) return;
    const dial = pending;
    pending = null;
    $('call').disabled = true;
    try {
      // The server swaps dial_ref for the contact's number ({{contact.phone}}).
      const res = await client.request.invoke('click2call', { dial_ref: dial.dial_ref, call_id: dial.call_id || '' });
      const call = res.body && res.body.Call;
      if (res.status !== 200 || !call || !call.Sid) throw new Error(exotelError(res));
      live = { call_id: dial.call_id, sid: call.Sid, timer: null, ended: false, polls: 0, endedAt: Infinity, lastStatus: '' };
      if (live.call_id) await log({ external_id: call.Sid, status: samvaadStatus(call.Status) });
      $('who-live').textContent = dial.name || 'the contact';
      $('detail').textContent = 'Answer your phone to be connected.';
      show('calling');
      setState('ringing', 'Ringing your phone');
      live.timer = setTimeout(poll, 4000);
    } catch (err) {
      showError((err && err.message) || 'The call could not be placed.');
      if (dial.call_id) {
        client.interface.cti.logCall({ call_id: dial.call_id, status: 'failed' }).catch(() => null);
      }
      show('idle');
      setState('idle', 'Idle');
    } finally {
      $('call').disabled = false;
    }
  });

  $('cancel').addEventListener('click', () => {
    if (pending && pending.call_id) {
      client.interface.cti.logCall({ call_id: pending.call_id, status: 'canceled' }).catch(() => null);
    }
    pending = null;
    show('idle');
    setState('idle', 'Idle');
  });

  // Polling keeps going in the background until Exotel reports the end and the recording.
  $('done').addEventListener('click', () => {
    show('idle');
    if (!live) setState('idle', 'Idle');
  });

  setState('idle', 'Idle');
})();
