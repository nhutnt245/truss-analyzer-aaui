// The page's own script. Kept from the old page: the picking, the returning of a loan, the chart call.
// What changed: the class lists the picking writes are the recipes' (whole lists, chosen by state, AUI-04); the dialog is opened and closed by
// aui-behaviour.js (data-aui-dialog-open, and the footer buttons close it), so the old show/hide handlers are gone.
var ROW = { plain: "aui-table-row aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-solid-surface aui-elevation-0", picked: "aui-table-row aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-solid-surface aui-elevation-0 aui-border-color-secondary aui-border-inline-start-width-4" };
var CHIP = { returned: "aui-chip aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-success aui-elevation-0 aui-gap-4" };
var BUTTON = { disabled: "aui-stateful aui-focus-color-info aui-focus-width-2 aui-button aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-disabled aui-elevation-0", enabled: "aui-stateful aui-focus-color-info aui-focus-width-2 aui-button aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-surface-alt aui-elevation-0" };
var picked = null;
var rows = document.querySelectorAll('#loans tbody tr');

function pick(row) {
  rows.forEach(function (other) {
    var on = other === row;
    other.className = on ? ROW.picked : ROW.plain;
    other.toggleAttribute('data-selected', on);
    other.setAttribute('aria-selected', String(on));
  });
  picked = row.getAttribute('data-id');
  var returnItem = document.getElementById('return-item');
  returnItem.className = BUTTON.enabled;
  returnItem.disabled = false;
  returnItem.removeAttribute('data-disabled');
}

// The layout loads this script on every page, and the Privacy page has no loans table, no dialog and no chart. The old script stopped there
// at its first missing element; this one leaves such a page alone, because check-standard fails a page whose console shows an error.
var returnConfirm = document.getElementById('return-confirm');
if (returnConfirm) returnConfirm.onclick = function () {
  var chip = document.querySelector('#loans tbody tr[data-selected] .aui-chip');
  chip.className = CHIP.returned;
  chip.querySelector('span').textContent = 'Returned';
};

rows.forEach(function (row) {
  row.onclick = function () {
    pick(row);
  };
});
if (rows.length > 0) pick(rows[0]);

var newLoan = document.getElementById('new-loan');
if (newLoan) newLoan.onclick = function () {
  document.getElementById('q').focus();
};

// The widget keeps its own markup. Its own settings take the theme's colours; what they cannot reach is aui-align.css.
var chart = document.getElementById('chart');
if (chart) TinyChart.create(chart, {
  title: 'Loans opened',
  labels: ['Wk 44', 'Wk 45', 'Wk 46', 'Wk 47'],
  values: [3, 5, 2, 4],
  colors: { bar: 'var(--theme-primary)', text: 'var(--theme-on-surface)', background: 'var(--theme-surface)' }
});
