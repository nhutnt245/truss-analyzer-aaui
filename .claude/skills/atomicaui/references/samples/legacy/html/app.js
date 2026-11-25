// The page's own logic, written the old way: plain DOM calls and a class switched by code.
var loans = [
  { id: 1, item: 'Projector P-200', borrower: 'Ana Silva', due: '2026-11-20', status: 'Open' },
  { id: 2, item: 'Laptop L-14', borrower: 'Ben Okafor', due: '2026-11-02', status: 'Overdue' },
  { id: 3, item: 'Camera C-3', borrower: 'Chen Wei', due: '2026-11-25', status: 'Open' },
  { id: 4, item: 'Tripod T-9', borrower: 'Ana Silva', due: '2026-10-28', status: 'Returned' },
  { id: 5, item: 'Microphone M-5', borrower: 'Dana Roy', due: '2026-11-04', status: 'Overdue' }
];
var BADGE = { Open: 'label label-info', Overdue: 'label label-warning', Returned: 'label label-success' };
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
    row.className = loan.id === picked ? 'selected' : '';
    row.innerHTML = '<td>' + loan.item + '</td><td>' + loan.borrower + '</td><td>' + loan.due + '</td><td><span class="' + BADGE[loan.status] + '">' + loan.status + '</span></td>';
    row.onclick = function () {
      picked = loan.id;
      draw();
    };
    body.appendChild(row);
  });
  document.getElementById('return-item').disabled = picked === null;
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
document.getElementById('return-item').onclick = function () {
  document.getElementById('return-dialog').style.display = 'block';
};
document.getElementById('return-cancel').onclick = function () {
  document.getElementById('return-dialog').style.display = 'none';
};
document.getElementById('return-confirm').onclick = function () {
  loans.forEach(function (loan) {
    if (loan.id === picked) loan.status = 'Returned';
  });
  document.getElementById('return-dialog').style.display = 'none';
  draw();
};

draw();
TinyChart.create(document.getElementById('chart'), {
  title: 'Loans opened',
  labels: ['Wk 44', 'Wk 45', 'Wk 46', 'Wk 47'],
  values: [3, 5, 2, 4]
});
