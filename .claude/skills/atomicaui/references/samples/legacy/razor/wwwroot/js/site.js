// The page's own script, the old way: a class switched by code and a dialog shown by a style.
var picked = null;
var rows = document.querySelectorAll('#loans tbody tr');

function pick(row) {
  rows.forEach(function (other) {
    other.className = other === row ? 'selected' : '';
  });
  picked = row.getAttribute('data-id');
  document.getElementById('return-item').disabled = false;
}

rows.forEach(function (row) {
  row.onclick = function () {
    pick(row);
  };
});
if (rows.length > 0) pick(rows[0]);

document.getElementById('new-loan').onclick = function () {
  document.getElementById('q').focus();
};
document.getElementById('return-item').onclick = function () {
  document.getElementById('return-dialog').style.display = 'block';
};
document.getElementById('return-confirm').onclick = function () {
  var badge = document.querySelector('#loans tbody tr.selected .badge');
  badge.className = 'badge text-bg-success';
  badge.textContent = 'Returned';
  document.getElementById('return-dialog').style.display = 'none';
};
document.getElementById('return-cancel').onclick = function () {
  document.getElementById('return-dialog').style.display = 'none';
};

TinyChart.create(document.getElementById('chart'), {
  title: 'Loans opened',
  labels: ['Wk 44', 'Wk 45', 'Wk 46', 'Wk 47'],
  values: [3, 5, 2, 4]
});
