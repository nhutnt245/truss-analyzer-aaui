// The app's data calls. Invented sample data. A conversion never edits this file.
const STATES = [
  { id: 1, label: 'Open' },
  { id: 2, label: 'In progress' },
  { id: 3, label: 'Done' },
];

let orders = [
  { number: 'WO-1001', title: 'Replace conveyor belt', asset: 'Line 2 conveyor', stateId: 2, due: '2026-12-01', assignee: 'R. Meyer' },
  { number: 'WO-1002', title: 'Calibrate torque station', asset: 'Station 14', stateId: 1, due: '2026-12-03', assignee: 'L. Okafor' },
  { number: 'WO-1003', title: 'Inspect fire doors', asset: 'Hall B', stateId: 1, due: '2026-12-05', assignee: 'S. Tran' },
  { number: 'WO-1004', title: 'Grease press bearings', asset: 'Press 3', stateId: 3, due: '2026-11-20', assignee: 'R. Meyer' },
  { number: 'WO-1005', title: 'Renew compressor filter', asset: 'Compressor A', stateId: 2, due: '2026-12-09', assignee: 'J. Silva' },
];

export const listStates = () => STATES;

/** stateId is a number, or 0 for every state. */
export function findOrders({ text, stateId }) {
  const wanted = text.trim().toLowerCase();
  return orders.filter((order) => (stateId === 0 || order.stateId === stateId) && (wanted === '' || `${order.number} ${order.title} ${order.asset}`.toLowerCase().includes(wanted)));
}

export function deleteOrder(number) {
  orders = orders.filter((order) => order.number !== number);
}
