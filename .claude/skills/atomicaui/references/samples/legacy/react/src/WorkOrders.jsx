import { useState } from 'react';
import { deleteOrder, findOrders, listStates } from './api.js';

const BADGE = { 1: 'badge badge-info', 2: 'badge badge-warning', 3: 'badge badge-success' };

export function WorkOrders() {
  const states = listStates();
  const [text, setText] = useState('');
  const [stateId, setStateId] = useState(0);
  const [query, setQuery] = useState({ text: '', stateId: 0 });
  const [picked, setPicked] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [, setVersion] = useState(0);
  const rows = findOrders(query);

  const search = (event) => {
    event.preventDefault();
    setQuery({ text, stateId });
    setPicked(null);
  };
  const remove = () => {
    deleteOrder(picked);
    setPicked(null);
    setConfirming(false);
    setVersion((version) => version + 1);
  };

  return (
    <div className="container">
      <ul className="breadcrumb">
        <li><a href="#/">Home</a></li>
        <li className="active">Work orders</li>
      </ul>
      <div className="page-header clearfix">
        <h1 style={{ float: 'left', fontSize: 22 }}>Work orders</h1>
        <div className="btn-toolbar pull-right">
          <button className="btn btn-primary" onClick={() => window.alert('New work order')}>New work order</button>
          <button className="btn btn-danger" disabled={!picked} onClick={() => setConfirming(true)}>Delete</button>
        </div>
      </div>

      <form className="form-inline well" onSubmit={search}>
        <div className="form-group">
          <label htmlFor="q">Search</label>
          <input id="q" className="form-control" value={text} onChange={(event) => setText(event.target.value)} placeholder="Number, title or asset" />
        </div>
        <div className="form-group">
          <label htmlFor="state">State</label>
          <select id="state" className="form-control" value={stateId} onChange={(event) => setStateId(Number(event.target.value))}>
            <option value={0}>All states</option>
            {states.map((state) => <option key={state.id} value={state.id}>{state.label}</option>)}
          </select>
        </div>
        <button type="submit" className="btn btn-default">Search</button>
      </form>

      <table className="table table-striped">
        <thead>
          <tr>
            <th>Number</th>
            <th>Title</th>
            <th>Asset</th>
            <th>State</th>
            <th>Due date</th>
            <th>Asignee</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.number} className={picked === row.number ? 'row-active' : ''} onClick={() => setPicked(row.number)}>
              <td>{row.number}</td>
              <td>{row.title}</td>
              <td>{row.asset}</td>
              <td><span className={BADGE[row.stateId]}>{states.find((state) => state.id === row.stateId).label}</span></td>
              <td>{row.due}</td>
              <td>{row.assignee}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="help-block">Showing {rows.length} work orders</p>

      {confirming ? (
        <div className="modal-backdrop">
          <div className="modal-box" role="dialog" aria-label="Delete work order">
            <h4>Delete work order</h4>
            <p>Delete work order {picked}? This cannot be undone.</p>
            <div className="modal-footer">
              <button className="btn btn-default" onClick={() => setConfirming(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={remove}>Delete</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
