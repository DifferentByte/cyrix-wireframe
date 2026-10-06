/* Cyrix UI shell — builds the dark sidebar + top bar around <main class="content">
   and wires the interactive components (tabs, segmented, dialogs, snackbar,
   ripple, theme toggle, KPI icons, part-image placeholders).

   Configure per project BEFORE loading this file:

   <script>
   window.CX_CONFIG = {
     brand:  { mark: "C", name: "Cyrix Purchase", sub: "AOS · AI procurement", href: "index.html" },
     search: "Search PR, PO, barcode or vendor…",
     user:   { initials: "PK", name: "Priya K.", role: "Purchase Exec · South zone" },
     notify: "3 overdue POs · 2 renewals due",           // snackbar text for the bell (omit to hide the dot)
     promo:  { icon: "auto_awesome", title: "Ask Cyrix AI", text: "…", cta: "Open assistant", href: "#" }, // or null
     nav: [
       { group: "Overview", items: [
         { href: "index.html", label: "Home", icon: "home" },
         { href: "orders.html", label: "Orders", icon: "receipt_long", count: 4 }
       ]}
     ],
     kpiIcons: [[/overdue|delay/i, "error"], [/value|paid/i, "payments"]] // optional overrides
   };
   </script>
   <script src="assets/cyrix-shell.js"></script>

   Pages without <main class="content"> (e.g. standalone diagrams) get only the helpers. */
(function () {
  var C = window.CX_CONFIG || {};
  var brand = C.brand || { mark: "C", name: "Cyrix", sub: "", href: "index.html" };
  var here = location.pathname.split("/").pop() || "index.html";

  try {
    var saved = localStorage.getItem("cx-theme");
    if (saved) document.documentElement.setAttribute("data-theme", saved);
  } catch (e) {}

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  function buildShell() {
    var content = document.querySelector("main.content");
    if (!content) return;

    var html = brand.logo
      ? '<a class="brand brand-logo" href="' + esc(brand.href || "index.html") + '" title="' + esc(brand.name) + '"><img src="' + esc(brand.logo) + '" alt="Cyrix Health Care Pvt Ltd"></a>'
      : '<a class="brand" href="' + esc(brand.href || "index.html") + '"><div class="brand-mark">' + esc(brand.mark) +
        '</div><div><b>' + esc(brand.name) + "</b>" + (brand.sub ? "<span>" + esc(brand.sub) + "</span>" : "") + "</div></a>";
    (C.nav || []).forEach(function (g) {
      html += '<div class="nav-group">' + (g.group ? "<div>" + esc(g.group) + "</div>" : "");
      (g.items || []).forEach(function (it) {
        html += '<a class="nav-link' + (it.href === here ? " active" : "") + '" href="' + esc(it.href) + '"' +
          (it.title ? ' title="' + esc(it.title) + '"' : "") + ">" +
          (it.icon ? '<span class="mi">' + esc(it.icon) + "</span>" : "") + esc(it.label) +
          (it.count ? '<span class="cnt">' + esc(it.count) + "</span>" : "") + "</a>";
      });
      html += "</div>";
    });
    if (C.promo) {
      var p = C.promo;
      html += '<div class="side-spacer"></div><div class="side-promo"><div class="ic"><span class="mi">' + esc(p.icon || "auto_awesome") +
        "</span></div><b>" + esc(p.title) + "</b><p>" + esc(p.text) + '</p><a href="' + esc(p.href || "#") + '"' +
        (p.toast ? ' data-toast="' + esc(p.toast) + '"' : "") + ">" + esc(p.cta || "Open") + "</a></div>";
    }
    var side = document.createElement("aside");
    side.className = "side";
    side.innerHTML = html;

    var u = C.user || {};
    var main = document.createElement("div");
    main.className = "main";
    main.innerHTML =
      '<header class="topbar">' +
        '<button class="icon-btn menu-btn" aria-label="Menu" data-menu><span class="mi">menu</span></button>' +
        '<div class="search"><span class="mi">search</span><input placeholder="' + esc(C.search || "Search…") + '"><kbd>⌘K</kbd></div>' +
        '<div class="spacer"></div>' +
        '<button class="icon-btn" title="Toggle theme" data-theme-toggle><span class="mi">dark_mode</span></button>' +
        '<button class="icon-btn" title="Notifications"' + (C.notify ? ' data-toast="' + esc(C.notify) + '"' : "") +
          '><span class="mi">notifications</span>' + (C.notify ? '<span class="dot"></span>' : "") + "</button>" +
        (u.name ? '<div class="user"><div class="avatar">' + esc(u.initials || u.name.charAt(0)) + "</div><span>" + esc(u.name) +
          (u.role ? "<br><small>" + esc(u.role) + "</small>" : "") + "</span></div>" : "") +
      "</header>";

    var app = document.createElement("div");
    app.className = "app";
    content.parentNode.insertBefore(app, content);
    app.appendChild(side);
    app.appendChild(main);
    main.appendChild(content);
  }

  function wire() {
    document.addEventListener("click", function (e) {
      var t = e.target;

      var rb = t.closest(".btn, .icon-btn, .nav-link, .tabs button");
      if (rb && !rb.disabled) {
        var r = rb.getBoundingClientRect(), d = Math.max(r.width, r.height), sp = document.createElement("span");
        sp.className = "ripple";
        sp.style.cssText = "width:" + d + "px;height:" + d + "px;left:" + (e.clientX - r.left - d / 2) + "px;top:" + (e.clientY - r.top - d / 2) + "px";
        rb.appendChild(sp);
        setTimeout(function () { sp.remove(); }, 600);
      }

      if (t.closest("[data-menu]")) { document.body.classList.toggle("nav-open"); return; }
      if (document.body.classList.contains("nav-open") && !t.closest(".side")) document.body.classList.remove("nav-open");

      if (t.closest("[data-theme-toggle]")) {
        var root = document.documentElement;
        var cur = root.getAttribute("data-theme") || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
        var next = cur === "dark" ? "light" : "dark";
        root.setAttribute("data-theme", next);
        try { localStorage.setItem("cx-theme", next); } catch (err) {}
      }

      // tabs: <div class="tabs" data-tabs="x"><button data-tab="a">  ·  panels: <div class="tab-panel" data-panel="x:a">
      var tb = t.closest(".tabs [data-tab]");
      if (tb) {
        var set = tb.parentNode.getAttribute("data-tabs");
        tb.parentNode.querySelectorAll("[data-tab]").forEach(function (b) { b.classList.toggle("on", b === tb); });
        document.querySelectorAll('[data-panel^="' + set + ':"]').forEach(function (p) {
          p.classList.toggle("on", p.getAttribute("data-panel") === set + ":" + tb.getAttribute("data-tab"));
        });
      }

      // segmented: <div class="seg"><button data-val="a">  → fires "segchange" (detail = value)
      var sb = t.closest(".seg button");
      if (sb) {
        var seg = sb.parentNode;
        seg.querySelectorAll("button").forEach(function (b) { b.classList.toggle("on", b === sb); });
        seg.dispatchEvent(new CustomEvent("segchange", { detail: sb.getAttribute("data-val"), bubbles: true }));
      }

      var tt = t.closest("[data-toast]");
      if (tt) CX.toast(tt.getAttribute("data-toast"));

      // dialogs: <button data-open="dlg">  ·  <div class="modal-bg" id="dlg"><div class="modal">… <button data-close>
      var mo = t.closest("[data-open]");
      if (mo) { var m = document.getElementById(mo.getAttribute("data-open")); if (m) m.classList.add("show"); }
      if (t.closest("[data-close]") || t.classList.contains("modal-bg")) {
        var bg = t.closest(".modal-bg"); if (bg) bg.classList.remove("show");
      }
    });
  }

  // KPI cards get an icon picked from their label text
  var KPI_ICONS = (C.kpiIcons || []).concat([
    [/overdue|delay|below|mismatch|shortfall|rejected|error|fail/i, "error"],
    [/pending|await|queue/i, "hourglass_top"],
    [/value|paid|outstanding|advance|amount|revenue|profit|cost|₹|\$/i, "payments"],
    [/vendor|supplier/i, "storefront"],
    [/deliver|transit|dispatch|shipment|grn/i, "local_shipping"],
    [/warranty|claim|contract|cmc/i, "verified_user"],
    [/accuracy|score|performance|rate|%/i, "insights"],
    [/order|po\b/i, "receipt_long"],
    [/customer|user|visitor/i, "group"],
    [/request|prs?\b|item|ticket/i, "description"]
  ]);
  function kpiIcons() {
    document.querySelectorAll(".kpi").forEach(function (k) {
      if (k.querySelector(".kpi-ic") || k.hasAttribute("data-no-icon")) return;
      var ic = k.getAttribute("data-icon");
      if (!ic) {
        var l = ((k.querySelector(".l") || {}).textContent || "").trim();
        ic = "monitoring";
        for (var i = 0; i < KPI_ICONS.length; i++) if (KPI_ICONS[i][0].test(l)) { ic = KPI_ICONS[i][1]; break; }
      }
      k.insertAdjacentHTML("afterbegin", '<span class="mi kpi-ic">' + esc(ic) + "</span>");
    });
  }

  // line-art placeholders: <div class="img" data-part="sensor|battery|board|valve|cable|pump|filter|lamp|doc"><span class="cap">Label</span></div>
  var PARTS = {
    sensor: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="8" y="22" width="22" height="20" rx="6"/><path d="M30 32h10c6 0 8 4 8 8v12"/><circle cx="19" cy="32" r="4"/></svg>',
    battery: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="10" y="18" width="40" height="28" rx="4"/><path d="M50 26h4v12h-4M20 32h8M24 28v8M34 32h8"/></svg>',
    board: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="8" y="12" width="48" height="40" rx="3"/><rect x="20" y="22" width="14" height="14"/><path d="M40 22h8M40 28h8M40 34h8M14 44h36M8 20h-4M8 30h-4M8 40h-4"/></svg>',
    valve: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M6 36h16l10-8 10 8h16M22 30v12M42 30v12"/><path d="M32 28V14M24 14h16"/></svg>',
    cable: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M10 16c14 0 10 32 26 32s14-26 20-26"/><rect x="4" y="12" width="8" height="8" rx="2"/><rect x="52" y="18" width="8" height="8" rx="2"/></svg>',
    pump: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="12" y="10" width="40" height="44" rx="5"/><rect x="18" y="16" width="28" height="14" rx="2"/><circle cx="24" cy="42" r="4"/><circle cx="40" cy="42" r="4"/></svg>',
    filter: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="32" cy="32" r="20"/><circle cx="32" cy="32" r="8"/><path d="M32 12v12M32 40v12M12 32h12M40 32h12"/></svg>',
    lamp: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M22 40c-6-4-8-10-8-14a18 18 0 0 1 36 0c0 4-2 10-8 14v6H22z"/><path d="M24 52h16"/></svg>',
    doc: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M16 6h22l10 10v42H16z"/><path d="M38 6v10h10M22 28h20M22 36h20M22 44h12"/></svg>'
  };
  function paintImages(root) {
    (root || document).querySelectorAll(".img[data-part]").forEach(function (el) {
      if (el.querySelector("svg")) return;
      el.insertAdjacentHTML("afterbegin", PARTS[el.getAttribute("data-part")] || PARTS.board);
    });
  }

  window.CX = {
    toast: function (msg) {
      var el = document.getElementById("cx-toast");
      if (!el) { el = document.createElement("div"); el.className = "toast"; el.id = "cx-toast"; document.body.appendChild(el); }
      el.textContent = msg;
      el.classList.add("show");
      clearTimeout(el._t);
      el._t = setTimeout(function () { el.classList.remove("show"); }, 2600);
    },
    inr: function (n) { return "₹" + Math.round(n).toLocaleString("en-IN"); },
    paintImages: paintImages,
    kpiIcons: kpiIcons
  };

  /* ---- Dropdown: upgrades every <select> into a styled, searchable menu ----
     The native <select> stays (hidden) as the source of truth, so page scripts that read
     .value, rebuild .innerHTML or listen for input/change keep working unchanged. */
  var ddOpen = null;
  function ddFire(sel) {
    sel.dispatchEvent(new Event("input", { bubbles: true }));
    sel.dispatchEvent(new Event("change", { bubbles: true }));
  }
  function ddRefresh(sel) {
    var d = sel._dd, v = d.t.querySelector(".dd-v"), picked = [].filter.call(sel.options, function (o) { return o.selected; });
    d.wrap.classList.toggle("disabled", sel.disabled);
    if (sel.multiple) {
      v.innerHTML = picked.length ? picked.map(function (o) {
        return '<span class="dd-chip">' + esc(o.textContent) + '<span class="mi" data-rm="' + [].indexOf.call(sel.options, o) + '">close</span></span>';
      }).join("") : '<span class="ph">' + esc(sel.getAttribute("placeholder") || "Select…") + "</span>";
      d.wrap.classList.toggle("has-val", picked.length > 0);
      return;
    }
    var o = sel.options[sel.selectedIndex];
    v.innerHTML = o ? (o.getAttribute("data-icon") ? '<span class="mi">' + esc(o.getAttribute("data-icon")) + "</span>" : "") + "<span>" + esc(o.textContent) + "</span>" : '<span class="ph">Select…</span>';
    d.wrap.classList.toggle("has-val", !!o && o.value !== "");
  }
  function ddClose(focus) {
    if (!ddOpen) return;
    var o = ddOpen; ddOpen = null;
    o.menu.remove(); o.sel._dd.wrap.classList.remove("open");
    o.sel._dd.t.removeEventListener("keydown", o.key);
    document.removeEventListener("mousedown", o.onDown, true); window.removeEventListener("scroll", o.onScroll, true); window.removeEventListener("resize", o.onClose);
    if (focus) o.sel._dd.t.focus();
  }
  function ddShow(sel) {
    if (sel.disabled) return;
    ddClose();
    var d = sel._dd, menu = document.createElement("div"), opts = [].slice.call(sel.options);
    menu.className = "dd-menu"; menu.setAttribute("role", "listbox");
    var withSearch = sel.hasAttribute("data-search") || opts.length >= 8;
    var html = withSearch ? '<div class="dd-search"><span class="mi">search</span><input placeholder="Search…" autocomplete="off"></div>' : "";
    html += '<div class="dd-list">';
    [].forEach.call(sel.children, function (ch) {
      var list = [ch];
      if (ch.tagName === "OPTGROUP") { html += '<div class="dd-h">' + esc(ch.label) + "</div>"; list = [].slice.call(ch.children); }
      list.forEach(function (o) {
        var ic = o.getAttribute("data-icon"), ds = o.getAttribute("data-desc");
        html += '<div class="dd-i' + (o.selected ? " sel" : "") + (o.disabled ? " dis" : "") + '" role="option" data-i="' + opts.indexOf(o) + '">' +
          (ic ? '<span class="mi">' + esc(ic) + "</span>" : "") + '<span class="dd-tx">' + esc(o.textContent) + (ds ? "<small>" + esc(ds) + "</small>" : "") + '</span><span class="mi dd-ck">check</span></div>';
      });
    });
    html += '</div><div class="dd-empty" style="display:none">No matches</div>';
    menu.innerHTML = html;
    document.body.appendChild(menu);
    d.wrap.classList.add("open");

    var r = d.t.getBoundingClientRect(), list = menu.querySelector(".dd-list"), input = menu.querySelector("input"), empty = menu.querySelector(".dd-empty");
    menu.style.minWidth = Math.max(r.width, 180) + "px"; menu.style.left = Math.max(8, Math.min(r.left, innerWidth - menu.offsetWidth - 8)) + "px";
    var below = innerHeight - r.bottom - 12, above = r.top - 12, h = Math.min(menu.scrollHeight, 340);
    var down = below >= h || below >= above, room = Math.max(120, Math.min(340, down ? below : above));
    list.style.maxHeight = room - (withSearch ? 52 : 12) + "px";
    if (down) menu.style.top = r.bottom + 6 + "px"; else menu.style.bottom = innerHeight - r.top + 6 + "px";

    var items = function () { return [].filter.call(menu.querySelectorAll(".dd-i"), function (i) { return i.style.display !== "none" && !i.classList.contains("dis"); }); };
    function setAct(el) { menu.querySelectorAll(".act").forEach(function (a) { a.classList.remove("act"); }); if (el) { el.classList.add("act"); if (el.offsetTop < list.scrollTop) list.scrollTop = el.offsetTop; else if (el.offsetTop + el.offsetHeight > list.scrollTop + list.clientHeight) list.scrollTop = el.offsetTop + el.offsetHeight - list.clientHeight; } }
    function pick(el) {
      var o = sel.options[+el.getAttribute("data-i")];
      if (sel.multiple) { o.selected = !o.selected; el.classList.toggle("sel", o.selected); ddRefresh(sel); ddFire(sel); return; }
      o.selected = true; ddRefresh(sel); ddFire(sel); ddClose(true);
    }
    setAct(menu.querySelector(".dd-i.sel") || items()[0]);
    if (input) input.focus({ preventScroll: true });

    var typed = "", typedT;
    function key(e) {
      var its = items(), cur = menu.querySelector(".dd-i.act"), i = its.indexOf(cur);
      if (e.key === "ArrowDown") { e.preventDefault(); setAct(its[Math.min(i + 1, its.length - 1)]); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setAct(its[Math.max(i - 1, 0)]); }
      else if (e.key === "Enter") { e.preventDefault(); if (cur) pick(cur); }
      else if (e.key === "Escape") { e.preventDefault(); ddClose(true); }
      else if (e.key === "Tab") ddClose();
      else if (!input && e.key.length === 1) {
        typed += e.key.toLowerCase(); clearTimeout(typedT); typedT = setTimeout(function () { typed = ""; }, 600);
        var hit = its.filter(function (x) { return x.textContent.trim().toLowerCase().indexOf(typed) === 0; })[0]; if (hit) setAct(hit);
      }
    }
    d.t.addEventListener("keydown", key);
    if (input) {
      input.addEventListener("keydown", key);
      input.addEventListener("input", function () {
        var q = input.value.toLowerCase(), any = false;
        menu.querySelectorAll(".dd-i").forEach(function (it) { var m = it.textContent.toLowerCase().indexOf(q) >= 0; it.style.display = m ? "" : "none"; if (m) any = true; });
        menu.querySelectorAll(".dd-h").forEach(function (h) { var n = h.nextElementSibling, vis = false; while (n && !n.classList.contains("dd-h")) { if (n.style.display !== "none") vis = true; n = n.nextElementSibling; } h.style.display = vis ? "" : "none"; });
        empty.style.display = any ? "none" : ""; setAct(items()[0]);
      });
    }
    menu.addEventListener("mousemove", function (e) { var it = e.target.closest(".dd-i"); if (it && !it.classList.contains("dis") && !it.classList.contains("act")) setAct(it); });
    menu.addEventListener("click", function (e) { var it = e.target.closest(".dd-i"); if (it && !it.classList.contains("dis")) pick(it); });

    var onDown = function (e) { if (!menu.contains(e.target) && !d.wrap.contains(e.target)) ddClose(); };
    var t0 = Date.now(), onScroll = function (e) { if (Date.now() - t0 > 250 && !menu.contains(e.target)) ddClose(); };
    var w0 = innerWidth, onClose = function () { if (innerWidth !== w0) ddClose(); };
    document.addEventListener("mousedown", onDown, true); window.addEventListener("scroll", onScroll, true); window.addEventListener("resize", onClose);
    ddOpen = { sel: sel, menu: menu, key: key, onDown: onDown, onScroll: onScroll, onClose: onClose };
  }
  function ddEnhance(sel) {
    if (sel._dd || sel.hasAttribute("data-native") || sel.closest(".dd")) return;
    var wrap = document.createElement("div"), t = document.createElement("div");
    wrap.className = "dd" + (sel.hasAttribute("data-clearable") ? " clearable" : "");
    if (sel.closest(".page-head .actions, .card-h")) wrap.classList.add("dd-pill");
    if (sel.closest(".topbar")) wrap.classList.add("dd-dark");
    if (sel.style.width === "auto") wrap.classList.add("dd-auto"); else if (sel.style.width) wrap.style.width = sel.style.width;
    t.className = "dd-t"; t.tabIndex = 0; t.setAttribute("role", "combobox"); t.setAttribute("aria-haspopup", "listbox");
    t.innerHTML = '<div class="dd-v"></div><span class="mi dd-x" title="Clear">close</span><span class="mi dd-arrow">expand_more</span>';
    sel.parentNode.insertBefore(wrap, sel); wrap.appendChild(t); wrap.appendChild(sel);
    sel.classList.add("dd-native"); sel.tabIndex = -1; sel._dd = { wrap: wrap, t: t };
    // programmatic `select.value = x` must repaint the label
    var desc = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value");
    Object.defineProperty(sel, "value", { configurable: true, get: function () { return desc.get.call(sel); }, set: function (v) { desc.set.call(sel, v); ddRefresh(sel); } });
    new MutationObserver(function () { ddRefresh(sel); }).observe(sel, { childList: true, subtree: true, attributes: true, attributeFilter: ["disabled", "selected", "label"] });
    t.addEventListener("click", function (e) {
      var rm = e.target.closest("[data-rm]");
      if (rm) { sel.options[+rm.getAttribute("data-rm")].selected = false; ddRefresh(sel); ddFire(sel); return; }
      if (e.target.closest(".dd-x")) {
        if (sel.multiple) [].forEach.call(sel.options, function (o) { o.selected = false; }); else sel.selectedIndex = 0;
        ddRefresh(sel); ddFire(sel); return;
      }
      if (ddOpen && ddOpen.sel === sel) ddClose(true); else ddShow(sel);
    });
    t.addEventListener("keydown", function (e) {
      if (ddOpen) return;
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); ddShow(sel); }
    });
    ddRefresh(sel);
  }
  function ddAll(root) { (root || document).querySelectorAll("select").forEach(ddEnhance); }

  /* ---- Pagination: every data table (and any [data-paginate] list) is paged automatically ----
     Pages keep rendering all their rows as before; extra rows are hidden with .pg-h and a footer
     shows "rows per page", the visible range and page buttons. Opt out with data-nopage on the table.
     The footer only appears once there are more rows than the smallest page size (10). */
  var PG_SIZES = [10, 25, 50, 100], pgPref = 25;
  try { pgPref = +localStorage.getItem("cx-pagesize") || 25; } catch (e) {}
  function pgInit(host) {
    if (host._pg || host.closest("[data-nopage]")) return;
    var table = host.tagName === "TBODY" ? host.closest("table") : null;
    if (table && table.hasAttribute("data-nopage")) return;
    var anchor = table ? (table.closest(".table-wrap") || table) : host;
    if (!anchor.parentNode) return;
    var st = host._pg = { size: pgPref, page: 1, total: -1, queued: false, bar: document.createElement("div") };
    st.bar.className = "pager"; st.bar.style.display = "none";
    st.bar.innerHTML = '<div class="pg-l"><span class="muted">Rows per page</span><select class="pg-size">' +
      PG_SIZES.map(function (n) { return '<option value="' + n + '"' + (n === st.size ? " selected" : "") + ">" + n + "</option>"; }).join("") +
      '</select><span class="pg-info muted"></span></div><div class="pg-btns"></div>';
    if (anchor.classList.contains("table-wrap")) anchor.classList.add("paged");
    anchor.parentNode.insertBefore(st.bar, anchor.nextSibling);
    new MutationObserver(function () { pgQueue(host); }).observe(host, { childList: true });
    st.bar.addEventListener("change", function (e) {
      if (!e.target.classList.contains("pg-size")) return;
      st.size = +e.target.value; st.page = 1; pgPref = st.size;
      try { localStorage.setItem("cx-pagesize", st.size); } catch (x) {}
      pgApply(host);
    });
    st.bar.addEventListener("click", function (e) {
      var b = e.target.closest("[data-p]"); if (!b || b.disabled) return;
      var pages = Math.max(1, Math.ceil(st.total / st.size)), v = b.getAttribute("data-p");
      st.page = v === "first" ? 1 : v === "prev" ? st.page - 1 : v === "next" ? st.page + 1 : v === "last" ? pages : +v;
      pgApply(host);
    });
    pgApply(host);
  }
  function pgQueue(host) {
    var st = host._pg; if (st.queued) return;
    st.queued = true; setTimeout(function () { st.queued = false; pgApply(host); }, 0);
  }
  function pgApply(host) {
    var st = host._pg, rows = [].filter.call(host.children, function (r) { return r.nodeType === 1 && r.style.display !== "none"; });
    if (st.total !== -1 && rows.length !== st.total) st.page = 1;       // a different result set → back to page 1
    st.total = rows.length;
    var pages = Math.max(1, Math.ceil(st.total / st.size)); if (st.page > pages) st.page = pages; if (st.page < 1) st.page = 1;
    var from = (st.page - 1) * st.size, to = from + st.size;
    rows.forEach(function (r, i) { r.classList.toggle("pg-h", i < from || i >= to); });
    var show = st.total > PG_SIZES[0];
    st.bar.style.display = show ? "" : "none";
    if (!show) return;
    st.bar.querySelector(".pg-info").textContent = (from + 1) + "–" + Math.min(to, st.total) + " of " + st.total;
    var sel = st.bar.querySelector(".pg-size"); if (sel.value !== String(st.size)) sel.value = String(st.size);
    var nums = [], p = st.page, add = function (n) { if (nums.indexOf(n) < 0 && n >= 1 && n <= pages) nums.push(n); };
    add(1); add(2); for (var k = p - 1; k <= p + 1; k++) add(k); add(pages - 1); add(pages);
    nums.sort(function (a, b) { return a - b; });
    var html = '<button data-p="first" type="button" title="First"' + (p === 1 ? " disabled" : "") + '><span class="mi">first_page</span></button>' +
      '<button data-p="prev" type="button" title="Previous"' + (p === 1 ? " disabled" : "") + '><span class="mi">chevron_left</span></button>', last = 0;
    nums.forEach(function (n) { if (n - last > 1) html += '<span class="gap">…</span>'; html += '<button data-p="' + n + '" type="button"' + (n === p ? ' class="on"' : "") + ">" + n + "</button>"; last = n; });
    html += '<button data-p="next" type="button" title="Next"' + (p === pages ? " disabled" : "") + '><span class="mi">chevron_right</span></button>' +
      '<button data-p="last" type="button" title="Last"' + (p === pages ? " disabled" : "") + '><span class="mi">last_page</span></button>';
    st.bar.querySelector(".pg-btns").innerHTML = html;
  }
  function pgScan(root) {
    if (root.nodeType !== 1 && root !== document) return;
    var q = ".table-wrap table > tbody, table.t > tbody, [data-paginate]";
    if (root !== document && root.matches && root.matches(q)) pgInit(root);
    root.querySelectorAll(q).forEach(pgInit);
  }

  buildShell();
  pgScan(document);
  ddAll();
  new MutationObserver(function (ms) {
    ms.forEach(function (m) { m.addedNodes.forEach(function (n) { if (n.nodeType === 1) { if (n.tagName === "SELECT") ddEnhance(n); else ddAll(n); pgScan(n); } }); });
  }).observe(document.body, { childList: true, subtree: true });
  kpiIcons();
  wire();
  paintImages();
})();
