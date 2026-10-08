/* Loaded AFTER ../assets/cyrix-shell.js — adds the demo "View as role" switcher to the top bar. */
(function () {
  var spacer = document.querySelector(".topbar .spacer");
  if (!spacer) return;
  var cur = location.pathname.split("/").pop() === "role-view.html" ? (SA.param("role") || SA.ROLES[0].id) : "";
  var sel = document.createElement("select");
  sel.className = "sa-viewas";
  sel.title = "Demo: preview what a role's employees see";
  sel.innerHTML = '<option value="">View as: Super Admin</option>' + SA.ROLES.map(function (r) {
    return '<option value="' + r.id + '"' + (cur === r.id ? " selected" : "") + ">View as: " + r.name + "</option>";
  }).join("");
  sel.addEventListener("change", function () {
    location.href = sel.value ? "role-view.html?role=" + sel.value : "index.html";
  });
  spacer.parentNode.insertBefore(sel, spacer.nextSibling);
})();

/* Notification bell: high-value POs waiting for an admin. Opens a panel; the count follows what gets approved. */
(function () {
  var bell = document.querySelector('.topbar [title="Notifications"]');
  if (!bell || !window.SA || !SA.poWaiting || /role-view.html/.test(location.pathname)) return;
  bell.removeAttribute("data-toast");
  var dot = bell.querySelector(".dot"); if (dot) dot.remove();
  var badge = document.createElement("span"); badge.className = "sa-bellcount"; bell.appendChild(badge);
  var panel = document.createElement("div"); panel.className = "sa-notif"; panel.style.display = "none"; document.body.appendChild(panel);
  var money = function (n) { return "₹" + Math.round(n).toLocaleString("en-IN"); };

  function paint() {
    var w = SA.poWaiting();
    badge.textContent = w.length > 99 ? "99+" : w.length; badge.style.display = w.length && SA.POLICY.notify.app ? "" : "none";
    panel.innerHTML = '<div class="nh"><span>Notifications</span><span class="badge ' + (w.length ? "warn" : "good") + '">' + (w.length ? w.length + " need approval" : "all clear") + "</span></div>" +
      '<div class="nl">' + (w.slice(0, 6).map(function (r) {
        var h = SA.emp(r.owner);
        return '<a class="ni" href="high-value-po.html"><div class="ic"><span class="mi">verified</span></div><div><b>High-value PO needs your approval</b><span class="s">' + r.id + " · " + r.vendor + " · " + money(r.value) +
          '</span><span class="m">Raised by ' + h.name + " · " + (r.age ? r.age + " d ago" : "today") + "</span></div></a>";
      }).join("") || '<div class="ne">You\'re all caught up.</div>') + "</div>" +
      '<a class="nf" href="high-value-po.html">' + (w.length > 6 ? "View all " + w.length + " high-value POs →" : "Open high-value POs →") + "</a>";
  }
  window.SA_bell = paint; paint();
  bell.addEventListener("click", function (e) { e.stopPropagation(); paint(); panel.style.display = panel.style.display === "none" ? "" : "none"; });
  document.addEventListener("click", function (e) { if (!panel.contains(e.target)) panel.style.display = "none"; });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") panel.style.display = "none"; });
})();

/* Global search (top bar): one box that searches everything the Super Admin manages and jumps to it. */
(function () {
  var input = document.querySelector(".topbar .search input");
  if (!input || !window.SA || /role-view\.html/.test(location.pathname)) return;
  input.placeholder = "Search anything — people, roles, teams, PIs, POs, items, vendors…";
  var kbd = document.querySelector(".topbar .search kbd"); if (kbd) kbd.textContent = /Mac/.test(navigator.platform) ? "⌘K" : "Ctrl K";

  // ?q=… on a destination page pre-fills its own search box, so a result lands on exactly that record
  var qp = SA.param("q"), qi = document.getElementById("q"); if (qp && qi) qi.value = qp;

  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var enc = encodeURIComponent, money = function (n) { return "₹" + Math.round(n).toLocaleString("en-IN"); };
  var GROUPS = ["Go to", "Employee", "Admin account", "Role", "Team", "PI", "Approval", "Purchase request", "Quotation", "Purchase order", "Item", "Vendor", "Audit log"];
  var ICONS = { "Go to": "arrow_forward", Employee: "person", "Admin account": "admin_panel_settings", Role: "badge", Team: "diversity_3", PI: "assignment", Approval: "task_alt", "Purchase request": "shopping_cart", Quotation: "request_quote", "Purchase order": "receipt_long", Item: "add_box", Vendor: "storefront", "Audit log": "history" };
  var index = null;

  function build() {
    var ix = [], add = function (type, label, sub, href, extra) { ix.push({ type: type, label: label, sub: sub, href: href, hay: (label + " " + sub + " " + (extra || "")).toLowerCase() }); };
    [["Super Admin Home", "index.html"], ["Employees", "employees.html"], ["Add employee", "employee-edit.html"], ["Admin accounts", "admins.html"], ["Create admin", "admin-edit.html"], ["Roles", "roles.html"], ["Access overview", "access-matrix.html"],
      ["Audit log", "audit-log.html"], ["Teams", "teams.html"], ["PI workload", "pi-workload.html"], ["Items", "items.html"], ["Create item", "item-create.html"], ["PI Unified data", "monitor-pi.html"], ["Approval", "monitor-approvals.html"],
      ["Purchase Request", "monitor-pr.html"], ["Quotation", "monitor-quotations.html"], ["Purchase order", "monitor-po.html"], ["High-value POs", "high-value-po.html"], ["Messages", "monitor-messages.html"]]
      .forEach(function (p) { add("Go to", p[0], "Open page", p[1]); });
    SA.EMPLOYEES.forEach(function (e) { add("Employee", e.name, e.email + " · " + SA.teamName(e.team) + " · " + SA.role(e.role).name, "employee-workload.html?id=" + e.id, e.phone + " " + e.status); });
    SA.ADMINS.forEach(function (a) { add("Admin account", a.name, a.email + " · " + (a.preset === "super" ? "Super Admin" : (SA.ADMIN_PRESETS.filter(function (p) { return p.id === a.preset; })[0] || { name: "Custom" }).name), a.locked ? "admins.html" : "admin-edit.html?id=" + a.id, a.phone); });
    SA.ROLES.forEach(function (r) { add("Role", r.name, r.desc, "role-edit.html?role=" + r.id); });
    SA.TEAMS.forEach(function (t) { add("Team", t.name, t.desc, "team-detail.html?team=" + t.id); });
    SA.ITEM_MASTER.forEach(function (i) { add("Item", i.code + " · " + i.desc, i.group + " · " + i.state + " · " + i.status, "items.html?q=" + enc(i.code), i.ref + " " + i.hsn); });
    SA.VENDORS.forEach(function (v) { add("Vendor", v, "See its bot conversations", "monitor-messages.html?q=" + enc(v)); });
    SA.AUDIT.forEach(function (a) { add("Audit log", a.target + " — " + a.change, a.when + " · " + a.who, "audit-log.html?q=" + enc(a.target)); });
    // records: one entry per PI, plus its approval / purchase request / quotation / PO
    var seen = {};
    [["approvals", "Approval", "monitor-approvals.html"], ["pr", "Purchase request", "monitor-pr.html"], ["quotations", "Quotation", "monitor-quotations.html"], ["po", "Purchase order", "monitor-po.html"]].forEach(function (k) {
      SA.docs(k[0]).forEach(function (r) {
        add(k[1], r.id + " · " + r.item, "PI " + r.pi + " · " + r.status + (k[0] === "po" ? " · " + money(r.value) : ""), k[2] + "?q=" + enc(r.id), r.pi + " " + (r.vendor || ""));
        if (!seen[r.pi]) { seen[r.pi] = 1; add("PI", r.pi, r.item + " · " + r.zone + " · held by " + SA.emp(r.owner).name, "monitor-approvals.html?q=" + enc(r.pi), ""); }
      });
    });
    return ix;
  }

  var panel = document.createElement("div"); panel.className = "sa-search"; panel.style.display = "none"; document.body.appendChild(panel);
  var shown = [], active = 0;

  function place() { var r = input.getBoundingClientRect(); panel.style.left = r.left + "px"; panel.style.top = r.bottom + 8 + "px"; panel.style.width = Math.min(620, innerWidth - r.left - 12) + "px"; }
  function run() {
    var q = input.value.trim().toLowerCase();
    if (!q) { panel.style.display = "none"; return; }
    if (!index) index = build();
    var terms = q.split(/\s+/), buckets = {}, total = 0;
    index.forEach(function (it) {
      if (!terms.every(function (t) { return it.hay.indexOf(t) >= 0; })) return;
      var starts = it.label.toLowerCase().indexOf(terms[0]) === 0;
      (buckets[it.type] = buckets[it.type] || []).push({ it: it, rank: starts ? 0 : 1 });
    });
    shown = []; var html = "";
    GROUPS.forEach(function (g) {
      var b = buckets[g]; if (!b) return;
      b.sort(function (x, y) { return x.rank - y.rank; });
      html += '<div class="sg-h">' + g + ' <span class="faint">' + b.length + "</span></div>";
      b.slice(0, 4).forEach(function (x) {
        html += '<a class="sg-i" data-n="' + shown.length + '" href="' + x.it.href + '"><span class="mi">' + ICONS[g] + '</span><span class="sg-t"><b>' + esc(x.it.label) + "</b><small>" + esc(x.it.sub) + "</small></span></a>";
        shown.push(x.it);
      });
      if (b.length > 4) html += '<div class="sg-more">+ ' + (b.length - 4) + " more " + g.toLowerCase() + " results — refine your search</div>";
      total += b.length;
    });
    panel.innerHTML = (html || '<div class="sg-empty">No results for “' + esc(input.value.trim()) + "”</div>") + '<div class="sg-f"><span><kbd>↑</kbd><kbd>↓</kbd> move</span><span><kbd>Enter</kbd> open</span><span><kbd>Esc</kbd> close</span><span style="margin-left:auto">' + total + " results</span></div>";
    active = 0; mark(); place(); panel.style.display = "";
  }
  function mark() {
    panel.querySelectorAll(".sg-i").forEach(function (a) { a.classList.toggle("act", +a.getAttribute("data-n") === active); });
    var a = panel.querySelector(".sg-i.act");
    if (a) { if (a.offsetTop < panel.scrollTop) panel.scrollTop = a.offsetTop - 40; else if (a.offsetTop + a.offsetHeight > panel.scrollTop + panel.clientHeight - 40) panel.scrollTop = a.offsetTop + a.offsetHeight - panel.clientHeight + 50; }
  }

  input.addEventListener("input", run);
  input.addEventListener("focus", function () { if (input.value.trim()) run(); });
  input.addEventListener("keydown", function (e) {
    if (panel.style.display === "none") return;
    if (e.key === "ArrowDown") { e.preventDefault(); active = Math.min(active + 1, shown.length - 1); mark(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); active = Math.max(active - 1, 0); mark(); }
    else if (e.key === "Enter" && shown[active]) { e.preventDefault(); location.href = shown[active].href; }
    else if (e.key === "Escape") { panel.style.display = "none"; input.blur(); }
  });
  panel.addEventListener("mousemove", function (e) { var a = e.target.closest(".sg-i"); if (a && +a.getAttribute("data-n") !== active) { active = +a.getAttribute("data-n"); mark(); } });
  document.addEventListener("mousedown", function (e) { if (!panel.contains(e.target) && e.target !== input) panel.style.display = "none"; });
  window.addEventListener("resize", function () { if (panel.style.display !== "none") place(); });
  document.addEventListener("keydown", function (e) {
    var tag = (document.activeElement || {}).tagName;
    if (((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") || (e.key === "/" && tag !== "INPUT" && tag !== "TEXTAREA" && tag !== "SELECT")) { e.preventDefault(); input.focus(); input.select(); }
  });
})();
