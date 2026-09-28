/**
 * Hosted serverless entry. Export handlers named in manifest.events.
 * `args.data` is the domain-event payload.
 */
exports.onTicketCreate = async function onTicketCreate(args) {
  console.log('onTicketCreate', args.data && args.data.ticket_id);
  return { ok: true, ticket_id: args.data && args.data.ticket_id };
};

exports.onTicketUpdate = async function onTicketUpdate(args) {
  console.log('onTicketUpdate', args.data && args.data.ticket_id);
  return { ok: true };
};

exports.onMessageReceived = async function onMessageReceived(args) {
  console.log('onMessageReceived', args.data && args.data.conversation_id);
  return { ok: true };
};
