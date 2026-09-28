(async function () {
  const client = await window.SamvaadClient.init();
  const title = document.getElementById('title');
  const fields = document.getElementById('fields');

  function row(label, value) {
    const dt = document.createElement('dt');
    dt.textContent = label;
    const dd = document.createElement('dd');
    dd.textContent = value == null || value === '' ? '—' : String(value);
    fields.appendChild(dt);
    fields.appendChild(dd);
  }

  async function render() {
    fields.innerHTML = '';
    const ticket = await client.get('ticket');
    const conversation = await client.get('conversation');
    const user = await client.get('currentUser');
    if (ticket && ticket._id) {
      title.textContent = 'Ticket';
      row('Subject', ticket.subject || ticket.title);
      row('Status', ticket.status);
      row('Priority', ticket.priority);
      row('Id', ticket._id);
    } else if (conversation && (conversation._id || conversation.id)) {
      title.textContent = 'Conversation';
      row('Title', conversation.title || conversation.subject);
      row('Status', conversation.status);
      row('Id', conversation._id || conversation.id);
    } else {
      title.textContent = 'No context';
    }
    row('Agent', user && (user.name || user.email));
    client.invoke('resize', { height: document.body.scrollHeight + 8 });
  }

  // A slider is another page of this bundle (assets/slider.html) that you design.
  document.getElementById('open-slider').addEventListener('click', async () => {
    const ticket = await client.get('ticket');
    const conversation = await client.get('conversation');
    const closed = await client.interface.openSlider({
      page: 'slider.html',
      title: 'Details',
      size: 'medium', // small | medium | large | xl
      payload: { ticket, conversation },
    });
    if (closed.result && closed.result.note) {
      client.interface.notify({ type: 'success', message: `Saved: ${closed.result.note}` });
    }
  });

  client.on('ticket.updated', render);
  client.on('conversation.updated', render);
  await render();
})();
