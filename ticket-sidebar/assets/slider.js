(async function () {
  const client = await window.SamvaadClient.init();
  // Whatever the sidebar passed to openSlider({ payload }).
  const slider = await client.get('slider');
  const payload = (slider && slider.payload) || {};
  const record = payload.ticket || payload.conversation || {};
  const fields = document.getElementById('fields');
  for (const [label, value] of [
    ['Subject', record.subject || record.title],
    ['Status', record.status],
    ['Id', record._id || record.id],
  ]) {
    const dt = document.createElement('dt');
    dt.textContent = label;
    const dd = document.createElement('dd');
    dd.textContent = value == null || value === '' ? '—' : String(value);
    fields.append(dt, dd);
  }

  document.getElementById('save').addEventListener('click', () => {
    const note = document.getElementById('note').value.trim();
    // Resolves the sidebar's openSlider() promise with { closed: true, result }.
    client.interface.closeSlider({ note });
  });
  document.getElementById('cancel').addEventListener('click', () => {
    client.interface.closeSlider(null);
  });
})();
