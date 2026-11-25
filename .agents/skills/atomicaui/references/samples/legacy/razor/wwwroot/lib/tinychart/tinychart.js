/*
 * TinyChart 1.2: a stand-in for a third-party chart widget (not AtomicAUI, not ours). Read-only in a conversion.
 * It draws a bar chart with its own markup and its own stylesheet (tinychart.css). Its look is set through the options below, or not at all.
 *   TinyChart.create(element, { title, labels, values, colors: { bar, text, background } })
 */
(function (global) {
  var DEFAULTS = { bar: '#3b82c4', text: '#222222', background: '#ffffff' };
  global.TinyChart = {
    create: function (element, options) {
      var colors = Object.assign({}, DEFAULTS, options.colors || {});
      var top = Math.max.apply(null, options.values);
      element.classList.add('tc-root');
      element.style.background = colors.background;
      element.style.color = colors.text;
      var html = '<div class="tc-title">' + options.title + '</div><div class="tc-grid">';
      options.values.forEach(function (value, index) {
        html += '<div class="tc-col"><div class="tc-bar" style="height:' + Math.round((value / top) * 100) + '%;background:' + colors.bar + '" title="' + value + '"></div><div class="tc-label">' + options.labels[index] + '</div></div>';
      });
      element.innerHTML = html + '</div>';
    }
  };
})(window);
