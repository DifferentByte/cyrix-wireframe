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
