/* Shared engine for the Super Admin "monitor & act" screens (Approval, Purchase Request,
   Quotation, Purchase order). Each page passes a config to SAM.render(); everything is in-memory. */
window.SAM = {
  render: function (cfg) {
    var $ = function (id) { return document.getElementById(id); };
    var getRows = function () { return cfg.only ? SA.docs(cfg.kind).filter(cfg.only) : SA.docs(cfg.kind); }, rows = getRows(), money = function (n) { return CX.inr(n); };
    var tone = function (s) { return cfg.tone[s] || ""; };

    $("app").innerHTML =
      '<div class="page-head"><div><div class="crumb">Super Admin · Monitor & act</div><h1>' + cfg.title + '</h1><p class="sub">' + cfg.sub + "</p></div>" +
      '<div class="actions">' + (cfg.dates ? '<div id="range"></div>' : '') + '<span class="badge info"><span class="mi" style="font-size:14px">admin_panel_settings</span>Super Admin · can act on any item</span></div></div>' +
      '<div class="grid g4" id="kpis"></div>' + (cfg.before ? cfg.before() : '') +
      '<div class="card mt"><div class="card-h"><h2>' + cfg.title + '</h2><div class="row" style="margin-left:auto">' +
        '<input id="q" placeholder="Search ID, PI or item…" style="width:200px"><select id="fTeam"><option value="">All teams</option></select>' +
        '<select id="fEmp"><option value="">All employees</option></select><select id="fStatus"><option value="">All status</option></select>' +
        '<select id="fZone"><option value="">All zones</option></select></div></div>' +
      '<div class="table-wrap"><table class="t"><thead><tr id="thead"></tr></thead><tbody id="rows"></tbody></table></div>' +
      '<div class="card-b small muted" id="count"></div></div>' +
      '<div class="modal-bg" id="samModal"><div class="modal" style="width:min(560px,100%)"><div class="card-h"><h2 id="mTitle"></h2><button class="btn sm tag" data-close type="button">✕</button></div>' +
      '<div class="card-b" id="mBody"></div><div class="card-f"><button class="btn" data-close type="button">Cancel</button><button class="btn primary" id="mGo" type="button">Confirm</button></div></div></div>';

    $("fTeam").innerHTML += SA.TEAMS.map(function (t) { return '<option value="' + t.id + '">' + t.name + "</option>"; }).join("");
    $("fEmp").innerHTML += SA.EMPLOYEES.filter(function (e) { return e.status === "active"; }).map(function (e) { return '<option value="' + e.id + '">' + e.name + "</option>"; }).join("");
    $("fStatus").innerHTML += cfg.statuses.map(function (s) { return "<option>" + s + "</option>"; }).join("");
    $("fZone").innerHTML += SA.ZONES.map(function (z) { return "<option>" + z + "</option>"; }).join("");
    $("thead").innerHTML = cfg.cols.map(function (c) { return "<th" + (c.num ? ' class="num"' : "") + ">" + c.label + "</th>"; }).join("") + "<th>Held by</th><th>Status</th><th></th>";

    // Date filter (default: last 1 month) — tiles, table and counts all follow it.
    var range = cfg.dates ? CXR.create($("range"), function () { draw(); }) : null;
    var dated = function () { return range ? rows.filter(function (r) { return range.contains(r.date); }) : rows; };

    function kpis() {
      $("kpis").innerHTML = cfg.kpis(dated()).map(function (k) {
        return '<div class="card kpi"><div class="l">' + k[0] + '</div><span class="mi kpi-ic">' + k[3] + '</span><div class="v">' + k[1] + '</div><div class="d">' + k[2] + "</div></div>";
      }).join("");
    }

    function draw() {
      rows = getRows();
      var q = $("q").value.toLowerCase(), ft = $("fTeam").value, fe = $("fEmp").value, fs = $("fStatus").value, fz = $("fZone").value;
      var list = dated().filter(function (r) {
        var e = SA.emp(r.owner);
        return (!q || (r.id + r.pi + r.item).toLowerCase().indexOf(q) >= 0) && (!ft || e.team === ft) && (!fe || r.owner === fe) && (!fs || r.status === fs) && (!fz || r.zone === fz);
      }).sort(function (a, b) { return (cfg.rank(b) - cfg.rank(a)) || (b.age - a.age); });
      $("rows").innerHTML = list.map(function (r) {
        var e = SA.emp(r.owner), acts = cfg.actions(r);
        return "<tr>" + cfg.cols.map(function (c) { return "<td" + (c.num ? ' class="num"' : "") + ">" + c.fmt(r, money) + "</td>"; }).join("") +
          '<td><a href="employee-workload.html?id=' + e.id + '">' + e.name + '</a><div class="small faint">' + SA.teamName(e.team) + "</div></td>" +
          '<td><span class="badge ' + tone(r.status) + '">' + r.status + "</span></td>" +
          '<td class="nowrap">' + (acts.map(function (a) { return '<button class="btn sm ' + (a.cls || "") + '" data-act="' + a.id + '" data-id="' + r.id + '" type="button">' + a.label + "</button>"; }).join(" ") || '<span class="faint small">—</span>') + "</td></tr>";
      }).join("") || '<tr><td colspan="' + (cfg.cols.length + 3) + '" class="muted" style="padding:24px 20px">Nothing matches.</td></tr>';
      $("count").textContent = list.length + " matching" + (range ? " · " + range.label() : "") + " · " + rows.length + " total";
      kpis();
      if (window.SA_bell) window.SA_bell();   // keep the top-bar notification count in step with what was just done
      if (cfg.after) cfg.after(rows);
    }
    ["q", "fTeam", "fEmp", "fStatus", "fZone"].forEach(function (id) { $(id).addEventListener("input", draw); });

    var cur = null;
    function openModal(title, html, go) { $("mTitle").textContent = title; $("mBody").innerHTML = html; cur = go; $("samModal").classList.add("show"); }
    $("mGo").addEventListener("click", function () { if (cur) { cur(); cur = null; } $("samModal").classList.remove("show"); draw(); });

    $("rows").addEventListener("click", function (ev) {
      var b = ev.target.closest("[data-act]"); if (!b) return;
      var r = rows.filter(function (x) { return x.id === b.getAttribute("data-id"); })[0], act = b.getAttribute("data-act"), a = cfg.actions(r).filter(function (x) { return x.id === act; })[0];
      if (act === "reassign") {
        var mates = SA.EMPLOYEES.filter(function (e) { return e.status === "active" && e.id !== r.owner; });
        openModal("Reassign " + r.id, '<p class="small muted" style="margin-top:0">' + r.item + " · PI " + r.pi + '</p><div class="field"><label>Move to</label><select id="mTo">' +
          mates.map(function (e) { return '<option value="' + e.id + '">' + e.name + " — " + SA.teamName(e.team) + "</option>"; }).join("") + "</select></div>",
          function () { var to = $("mTo").value; SA.log("action", r.id, "Reassigned from " + SA.emp(r.owner).name + " to " + SA.emp(to).name); r.owner = to; CX.toast(r.id + " reassigned to " + SA.emp(to).name + " (demo)"); });
      } else if (a.modal) {
        var m = a.modal(r); openModal(m.title, m.html, function () { var msg = m.confirm(r); SA.log("action", r.id, msg); CX.toast(msg + " (demo)"); });
      } else {
        var msg = a.run(r); SA.log("action", r.id, msg); CX.toast(msg + " (demo — resets on reload)"); draw();
      }
    });
    if (cfg.bind) cfg.bind(draw);
    draw();
  }
};

/* High-value PO approval (a PO above SA.POLICY.poThreshold must be approved by an admin before it is issued). */
SAM.poSummary = function (r) {
  var h = SA.emp(r.owner);
  return '<dl class="kv"><dt>PO</dt><dd class="mono">' + r.id + "</dd><dt>Vendor</dt><dd>" + r.vendor + "</dd><dt>Item</dt><dd>" + r.item + " × " + r.qty + "</dd>" +
    "<dt>Value</dt><dd><b>" + CX.inr(r.value) + '</b> <span class="badge warn">above ' + CX.inr(SA.POLICY.poThreshold) + " limit</span></dd><dt>Raised by</dt><dd>" + h.name + " · " + SA.teamName(h.team) + "</dd>" +
    "<dt>Waiting</dt><dd>" + (r.age ? r.age + " days" : "since today") + "</dd></dl>";
};
SAM.hvActions = function () {
  return [
    { id: "admin-approve", label: "Approve (admin)", cls: "good", modal: function (r) {
      return { title: "Approve high-value PO · " + r.id, html: SAM.poSummary(r) + '<div class="field mt"><label>Note for the buyer (optional)</label><textarea id="hvNote" rows="2" placeholder="e.g. Approved — negotiate delivery within 7 days"></textarea></div>',
        confirm: function (r) { r.status = "Issued"; r.approvedBy = "Nikhil (Super Admin)"; return "Approved high-value PO " + r.id + " (" + CX.inr(r.value) + ") — issued to " + r.vendor; } };
    } },
    { id: "admin-reject", label: "Reject", cls: "danger", modal: function (r) {
      return { title: "Reject high-value PO · " + r.id, html: SAM.poSummary(r) + '<div class="field mt"><label>Reason</label><textarea id="hvNote" rows="2" placeholder="Tell the buyer why, so they can revise the PO"></textarea></div>',
        confirm: function (r) { r.status = "Rejected"; return "Rejected high-value PO " + r.id + " (" + CX.inr(r.value) + ")"; } };
    } }
  ];
};
