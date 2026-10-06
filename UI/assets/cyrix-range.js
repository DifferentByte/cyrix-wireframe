/* Cyrix date-range filter — a preset menu (default: last 1 month) plus two date inputs.
   Load BEFORE the page script (it has no dependency on cyrix-shell.js).

     var range = CXR.create(document.getElementById("range"), function () { rerender(); });
     rows.filter(function (r) { return range.contains(r.created_date); });   // dd-mm-yyyy[ hh:mm], dd/mm/yyyy, yyyy-mm-dd, Date
     range.covers("2026-09-28", "2026-10-05")                                // does the range include the whole window?
*/
(function () {
  var TODAY = new Date(); TODAY.setHours(0, 0, 0, 0);
  var PRESETS = [["7d", "Last 7 days"], ["1m", "Last 1 month"], ["3m", "Last 3 months"], ["mtd", "This month"], ["all", "All time"], ["custom", "Custom range"]];

  function parse(v) {
    if (v instanceof Date) return v;
    var s = String(v == null ? "" : v).trim(), m;
    if ((m = s.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/))) return new Date(+m[3], +m[2] - 1, +m[1]);
    if ((m = s.match(/^(\d{4})-(\d{2})-(\d{2})/))) return new Date(+m[1], +m[2] - 1, +m[3]);
    return null;
  }
  function iso(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function preset(key) {
    var f = new Date(TODAY);
    if (key === "7d") f.setDate(f.getDate() - 7);
    else if (key === "3m") f.setMonth(f.getMonth() - 3);
    else if (key === "mtd") f.setDate(1);
    else if (key === "all") f = new Date(2000, 0, 1);
    else f.setMonth(f.getMonth() - 1);
    return { from: f, to: new Date(TODAY) };
  }

  function create(host, onChange, initial) {
    var key = initial || "1m", r = preset(key);
    host.classList.add("drange");
    host.innerHTML = "<select>" + PRESETS.map(function (p) { return '<option value="' + p[0] + '"' + (p[0] === key ? " selected" : "") + ">" + p[1] + "</option>"; }).join("") + "</select>" +
      '<input type="date" class="d-from" aria-label="From date"><span class="mi">arrow_right_alt</span><input type="date" class="d-to" aria-label="To date">';
    var sel = host.querySelector("select"), fi = host.querySelector(".d-from"), ti = host.querySelector(".d-to");
    function paint() { fi.value = iso(r.from); ti.value = iso(r.to); }
    paint();

    var api = {
      get from() { return r.from; }, get to() { return r.to; },
      contains: function (v) {
        var d = parse(v); if (!d) return true;               // undated records are never hidden
        d = new Date(d.getFullYear(), d.getMonth(), d.getDate()); // compare by day, ignore time
        return d >= r.from && d <= r.to;
      },
      covers: function (a, b) { var x = parse(a), y = parse(b); return !x || !y || (r.from <= x && r.to >= y); },
      label: function () { return r.from.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) + " → " + r.to.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); }
    };
    sel.addEventListener("change", function () {
      if (sel.value === "custom") return;
      r = preset(sel.value); paint(); onChange && onChange(api);
    });
    function custom() {
      var f = parse(fi.value), t = parse(ti.value);
      if (!f || !t) return;
      if (f > t) { var x = f; f = t; t = x; }
      r = { from: f, to: t }; sel.value = "custom"; onChange && onChange(api);
    }
    fi.addEventListener("change", custom); ti.addEventListener("change", custom);
    return api;
  }

  window.CXR = { create: create, parse: parse, iso: iso, today: TODAY };
})();
