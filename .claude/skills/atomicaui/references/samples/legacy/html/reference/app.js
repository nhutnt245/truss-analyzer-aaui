// The page's own logic. Kept from the old page: the data, the search, the picking, the count, the chart call.
// What changed: the markup these handlers write is the class recipes' (whole lists, chosen by state, AUI-04); the dialog's opening and closing
// is aui-behaviour.js's (data-aui-dialog-open, and the footer buttons close it), so the old show/hide handlers are gone (the sample's README lists the difference).
var loans = [
  { id: 1, item: 'Projector P-200', borrower: 'Ana Silva', due: '2026-11-20', status: 'Open' },
  { id: 2, item: 'Laptop L-14', borrower: 'Ben Okafor', due: '2026-11-02', status: 'Overdue' },
  { id: 3, item: 'Camera C-3', borrower: 'Chen Wei', due: '2026-11-25', status: 'Open' },
  { id: 4, item: 'Tripod T-9', borrower: 'Ana Silva', due: '2026-10-28', status: 'Returned' },
  { id: 5, item: 'Microphone M-5', borrower: 'Dana Roy', due: '2026-11-04', status: 'Overdue' }
];
// One whole class list per state, copied from the recipes (kit/standard/recipes/): a state picks a list, it never builds one.
var CHIP = {
  "Open": "aui-chip aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-info aui-elevation-0 aui-gap-4",
  "Overdue": "aui-chip aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-warning aui-elevation-0 aui-gap-4",
  "Returned": "aui-chip aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-success aui-elevation-0 aui-gap-4"
};
var CHIP_LABEL = "aui-frame aui-scale-no-padding-sm aui-bg-transparent aui-chip-label";
var ROW = { plain: "aui-table-row aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-solid-surface aui-elevation-0", picked: "aui-table-row aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-solid-surface aui-elevation-0 aui-border-color-secondary aui-border-inline-start-width-4" };
var CELL = { first: "aui-table-cell aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-text-align-left", other: "aui-table-cell aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-text-align-center" };
var BUTTON = { disabled: "aui-stateful aui-focus-color-info aui-focus-width-2 aui-button aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-disabled aui-elevation-0", enabled: "aui-stateful aui-focus-color-info aui-focus-width-2 aui-button aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-surface-alt aui-elevation-0" };
var picked = 1;

function visibleLoans() {
  var text = document.getElementById('q').value.toLowerCase();
  var status = document.getElementById('status').value;
  return loans.filter(function (loan) {
    return (!text || (loan.item + ' ' + loan.borrower).toLowerCase().indexOf(text) >= 0) && (status === 'All statuses' || loan.status === status);
  });
}

function draw() {
  var rows = visibleLoans();
  var body = document.getElementById('loan-rows');
  body.innerHTML = '';
  rows.forEach(function (loan) {
    var row = document.createElement('tr');
    var on = loan.id === picked;
    row.className = on ? ROW.picked : ROW.plain;
    row.setAttribute('role', 'row');
    row.setAttribute('data-aui-table-row', '');
    row.toggleAttribute('data-selected', on);
    row.setAttribute('aria-selected', String(on));
    var cells = [loan.item, loan.borrower, loan.due];
    row.innerHTML = cells.map(function (text, index) {
      return '<td role="gridcell" data-aui-table-cell class="' + (index === 0 ? CELL.first : CELL.other) + '">' + text + '</td>';
    }).join('') + '<td role="gridcell" data-aui-table-cell class="' + CELL.other + '"><span class="' + CHIP[loan.status] + '"><span class="' + CHIP_LABEL + '" data-aui-typeface="engineering" data-aui-typography="body">' + loan.status + '</span></span></td>';
    row.onclick = function () {
      picked = loan.id;
      draw();
    };
    body.appendChild(row);
  });
  var returnItem = document.getElementById('return-item');
  returnItem.className = picked === null ? BUTTON.disabled : BUTTON.enabled;
  returnItem.disabled = picked === null;
  returnItem.toggleAttribute('data-disabled', picked === null);
  document.getElementById('count').textContent = 'Showing ' + rows.length + ' of ' + loans.length + ' loans';
}

document.getElementById('search-form').onsubmit = function (event) {
  event.preventDefault();
  picked = null;
  draw();
};
document.getElementById('new-loan').onclick = function () {
  document.getElementById('q').focus();
};
document.getElementById('return-confirm').onclick = function () {
  loans.forEach(function (loan) {
    if (loan.id === picked) loan.status = 'Returned';
  });
  draw();
};

draw();
// The widget keeps its own markup. Its own settings take the theme's colours (kit/style/align.md, the first way); what they cannot reach is aui-align.css.
TinyChart.create(document.getElementById('chart'), {
  title: 'Loans opened',
  labels: ['Wk 44', 'Wk 45', 'Wk 46', 'Wk 47'],
  values: [3, 5, 2, 4],
  colors: { bar: 'var(--theme-primary)', text: 'var(--theme-on-surface)', background: 'var(--theme-surface)' }
});
