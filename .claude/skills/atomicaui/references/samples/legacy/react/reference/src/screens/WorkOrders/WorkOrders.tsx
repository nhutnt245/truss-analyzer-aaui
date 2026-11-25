import { useState, type FormEvent } from 'react';
import { AlertDialog, Button, Chip, Field, Table, Type, View, type ChipAui } from '@/vendor/atomic-aui';
import { Pane, PaneBody, Panes } from '@/recipes/layout';
import { ACTION_AUI, BAR_AUI, CELL_CENTER_AUI, CELL_START_AUI, FIELD_AUI, HEADER_CELL_AUI, HEADER_START_AUI, NAV_LINK_AUI, SELECT_TRIGGER_AUI, TABLE_PROPS, TEXT_AUI } from '@/recipes/shared/aui';
import { deleteOrder, findOrders, listStates } from '../../data/legacy/api.js';

// One named look per value, picked from a table. Never a condition inside a look (AUI-04).
// The table says what its key is: here the data's id, a number. `ChipAui` is a type from `@/vendor/atomic-aui`.
const STATE_CHIP_AUI: Record<number, ChipAui> = {
  1: { scale: 'sm', color: 'info', paint: 'solid' },
  2: { scale: 'sm', color: 'warning', paint: 'solid' },
  3: { scale: 'sm', color: 'success', paint: 'solid' },
};
const DESTRUCTIVE_AUI = { color: 'error', paint: 'tonal' } as const;

export function WorkOrders() {
  const states = listStates();
  const [text, setText] = useState('');
  const [stateId, setStateId] = useState(0);
  const [query, setQuery] = useState({ text: '', stateId: 0 });
  const [picked, setPicked] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [, setVersion] = useState(0);
  const rows = findOrders(query);

  const search = (event: FormEvent) => {
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

  const items = [{ value: 0, label: 'All states' }, ...states.map((state) => ({ value: state.id, label: state.label }))];

  return (
    <>
      <Panes label="Work orders">
        <Pane id="work-orders" title="Work orders" size="main">
          <PaneBody scroll="content">
            <View role="navigation" aria-label="Breadcrumb" aui={{ ...BAR_AUI, color: 'surface-alt' }}>
              <Button role="link" aui={NAV_LINK_AUI} nativeButton={false} render={<a href="#/" />}>Home</Button>
              <Type role="p3" aui={TEXT_AUI}>/ Work orders</Type>
            </View>
            <View role="group" aria-label="Work order actions" aui={{ ...BAR_AUI, color: 'surface-alt' }}>
              <Button aui={ACTION_AUI} onClick={() => window.alert('New work order')}>New work order</Button>
              <Button aui={DESTRUCTIVE_AUI} disabled={!picked} onClick={() => setConfirming(true)}>Delete</Button>
            </View>
            <View as="form" onSubmit={search} role="search" aria-label="Find work orders" aui={{ ...BAR_AUI, color: 'surface-alt' }}>
              <Field name="q" aui={FIELD_AUI}>
                <Field.Label>Search</Field.Label>
                <Field.Control>
                  <Field.Input value={text} onChange={(event) => setText(event.target.value)} placeholder="Number, title or asset" />
                </Field.Control>
              </Field>
              <Field name="state" aui={FIELD_AUI}>
                <Field.Label>State</Field.Label>
                <Field.Select items={items} value={stateId} onValueChange={(next) => next !== null && setStateId(Number(next))}>
                  <Field.SelectTrigger aui={SELECT_TRIGGER_AUI}><Field.SelectChevron /></Field.SelectTrigger>
                  <Field.SelectPortal><Field.SelectPositioner sideOffset={4}><Field.SelectPopup matchTriggerWidth><Field.SelectList>
                    {items.map((item) => <Field.SelectItem key={item.value} value={item.value}>{item.label}</Field.SelectItem>)}
                  </Field.SelectList></Field.SelectPopup></Field.SelectPositioner></Field.SelectPortal>
                </Field.Select>
              </Field>
              <Button type="submit" aui={ACTION_AUI}>Search</Button>
            </View>
            <Table aria-label="Work orders" selectionMode="single" indicatorColumn={false} minInlineSize={720} {...TABLE_PROPS}>
              <Table.Head>
                <Table.Row data-aui-header-row selectable={false} expandable={false}>
                  <Table.HeaderCell aui={HEADER_START_AUI}>Number</Table.HeaderCell>
                  <Table.HeaderCell aui={HEADER_CELL_AUI}>Title</Table.HeaderCell>
                  <Table.HeaderCell aui={HEADER_CELL_AUI}>Asset</Table.HeaderCell>
                  <Table.HeaderCell aui={HEADER_CELL_AUI}>State</Table.HeaderCell>
                  <Table.HeaderCell aui={HEADER_CELL_AUI}>Due date</Table.HeaderCell>
                  <Table.HeaderCell aui={HEADER_CELL_AUI}>Asignee</Table.HeaderCell>
                </Table.Row>
              </Table.Head>
              <Table.Body>
                {rows.map((row) => (
                  <Table.Row key={row.number} selected={picked === row.number} onSelectedChange={() => setPicked(row.number)}>
                    <Table.Cell aui={CELL_START_AUI}>{row.number}</Table.Cell>
                    <Table.Cell aui={CELL_CENTER_AUI}>{row.title}</Table.Cell>
                    <Table.Cell aui={CELL_CENTER_AUI}>{row.asset}</Table.Cell>
                    <Table.Cell aui={CELL_CENTER_AUI}>
                      <Chip aui={STATE_CHIP_AUI[row.stateId]}><Chip.Label>{states.find((state) => state.id === row.stateId)!.label}</Chip.Label></Chip>
                    </Table.Cell>
                    <Table.Cell aui={CELL_CENTER_AUI}>{row.due}</Table.Cell>
                    <Table.Cell aui={CELL_CENTER_AUI}>{row.assignee}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
            <View aui={BAR_AUI}>
              <Type role="p3" color="muted" aui={TEXT_AUI}>Showing {rows.length} work orders</Type>
            </View>
          </PaneBody>
        </Pane>
      </Panes>
      <AlertDialog open={confirming} onOpenChange={setConfirming} clickOutsideToClose={false}>
        <AlertDialog.Portal>
          <AlertDialog.Backdrop />
          <AlertDialog.Viewport>
            <AlertDialog.Popup>
              <AlertDialog.Title>Delete work order</AlertDialog.Title>
              <AlertDialog.Description>Delete work order {picked}? This cannot be undone.</AlertDialog.Description>
              <AlertDialog.Actions>
                <AlertDialog.Button autoFocus>Cancel</AlertDialog.Button>
                <AlertDialog.Button aui={ACTION_AUI} onClick={remove}>Delete</AlertDialog.Button>
              </AlertDialog.Actions>
            </AlertDialog.Popup>
          </AlertDialog.Viewport>
        </AlertDialog.Portal>
      </AlertDialog>
    </>
  );
}
