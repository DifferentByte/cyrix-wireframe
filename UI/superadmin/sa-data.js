/* Cyrix Super Admin wireframe — mock data, shell config, helpers.
   Load BEFORE ../assets/cyrix-shell.js. Nothing here is saved anywhere. */
(function () {
  var ACTS = [
    { id: "view", label: "View" }, { id: "create", label: "Create" }, { id: "edit", label: "Edit" },
    { id: "approve", label: "Approve" }, { id: "delete", label: "Delete" }, { id: "export", label: "Export" }
  ];
  // acts = which actions make sense for that module (others render as "—")
  var MODS = [
    { id: "dashboard", label: "PI Unified data", icon: "monitoring", acts: ["view", "export"] },
    { id: "approval", label: "Approval", icon: "task_alt", acts: ["view", "approve", "export"] },
    { id: "purchase", label: "Purchase Request", icon: "shopping_cart", acts: ["view", "create", "edit", "delete", "export"] },
    { id: "quotations", label: "Quotation", icon: "request_quote", acts: ["view", "create", "edit", "approve", "delete", "export"] },
    { id: "purchase-orders", label: "Purchase order", icon: "receipt_long", acts: ["view", "create", "edit", "approve", "delete", "export"] },
    { id: "messages", label: "Messages", icon: "forum", acts: ["view"] }
  ];
  var ZONES = ["Uttar Pradesh", "Kerala", "Andhra Pradesh", "Rajasthan"];

  var ROLES = [
    { id: "purchase-manager", name: "Purchase Manager", icon: "manage_accounts", desc: "Runs sourcing end to end: raises requests, compares quotations, issues purchase orders.",
      zones: "all", perms: { purchase: ["view", "create", "edit", "delete", "export"], quotations: ["view", "create", "edit", "approve", "export"], "purchase-orders": ["view", "create", "edit", "export"], messages: ["view"] } },
    { id: "purchase-exec", name: "Purchase Executive", icon: "shopping_cart", desc: "Prepares purchase requests and collects quotations for one zone.",
      zones: ["Kerala"], perms: { dashboard: ["view"], purchase: ["view", "create", "edit"], quotations: ["view", "create"], messages: ["view"] } },
    { id: "approver", name: "Approver", icon: "task_alt", desc: "Approves items and purchase orders above the executive limit.",
      zones: "all", perms: { dashboard: ["view", "export"], approval: ["view", "approve", "export"], "purchase-orders": ["view", "approve"], messages: ["view"] } },
    { id: "accounts", name: "Accounts", icon: "account_balance", desc: "Read-only view of purchase orders for payment and reconciliation.",
      zones: "all", perms: { dashboard: ["view", "export"], "purchase-orders": ["view", "export"], messages: ["view"] } },
    { id: "store-grn", name: "Store / GRN", icon: "inventory_2", desc: "Receives goods and checks them against open purchase orders.",
      zones: ["Uttar Pradesh", "Rajasthan"], perms: { "purchase-orders": ["view"], messages: ["view"] } },
    { id: "field-engineer", name: "Field Engineer", icon: "engineering", desc: "Acknowledges deliveries in the field and follows vendor messages sent by the bot.",
      zones: ["Kerala", "Andhra Pradesh"], perms: { purchase: ["view"], messages: ["view"] } }
  ];

  var EMPLOYEES = [
    { id: "e1", name: "Rahul Menon", email: "rahul.menon@cyrix.in", phone: "+91 98470 11223", role: "purchase-manager", team: "purchase", zones: "all", status: "active", last: "Today, 09:12" },
    { id: "e2", name: "Priya K.", email: "priya.k@cyrix.in", phone: "+91 98950 44120", role: "purchase-exec", team: "purchase", zones: ["Kerala"], status: "active", last: "Today, 08:40", grant: ["approval"], fixed: [10, 8] },
    { id: "e3", name: "Anil Sharma", email: "anil.sharma@cyrix.in", phone: "+91 98110 90071", role: "approver", team: "approvals", zones: "all", status: "active", last: "Yesterday, 18:05" },
    { id: "e4", name: "Neha Verma", email: "neha.verma@cyrix.in", phone: "+91 99710 33890", role: "accounts", team: "accounts", zones: "all", status: "active", last: "Yesterday, 16:21" },
    { id: "e5", name: "Suresh Rao", email: "suresh.rao@cyrix.in", phone: "+91 98480 55612", role: "purchase-exec", team: "purchase", zones: ["Andhra Pradesh"], status: "active", last: "Mon, 11:30", revoke: ["messages"] },
    { id: "e6", name: "Vikram Singh", email: "vikram.singh@cyrix.in", phone: "+91 98290 77104", role: "store-grn", team: "store", zones: ["Rajasthan"], status: "active", last: "Mon, 10:02" },
    { id: "e7", name: "Deepa Nair", email: "deepa.nair@cyrix.in", phone: "+91 94470 28831", role: "field-engineer", team: "field", zones: ["Kerala"], status: "active", last: "Sun, 19:48" },
    { id: "e8", name: "Imran Khan", email: "imran.khan@cyrix.in", phone: "+91 98390 61540", role: "store-grn", team: "store", zones: ["Uttar Pradesh"], status: "invited", last: "Never" },
    { id: "e9", name: "Meera Iyer", email: "meera.iyer@cyrix.in", phone: "+91 98400 12987", role: "purchase-manager", team: "approvals", zones: ["Kerala", "Andhra Pradesh"], status: "inactive", last: "12 Sep" },
    { id: "e10", name: "Arjun Pillai", email: "arjun.pillai@cyrix.in", phone: "+91 98470 20011", role: "purchase-exec", team: "purchase", zones: ["Kerala"], status: "active", last: "Today, 09:01" },
    { id: "e11", name: "Kavya Reddy", email: "kavya.reddy@cyrix.in", phone: "+91 98480 20012", role: "purchase-exec", team: "purchase", zones: ["Andhra Pradesh"], status: "active", last: "Today, 08:22" },
    { id: "e12", name: "Mohit Jain", email: "mohit.jain@cyrix.in", phone: "+91 98290 20013", role: "purchase-exec", team: "purchase", zones: ["Rajasthan"], status: "active", last: "Yesterday, 19:40" },
    { id: "e13", name: "Sneha Thomas", email: "sneha.thomas@cyrix.in", phone: "+91 98950 20014", role: "purchase-exec", team: "purchase", zones: ["Kerala"], status: "active", last: "Yesterday, 17:15" },
    { id: "e14", name: "Rakesh Yadav", email: "rakesh.yadav@cyrix.in", phone: "+91 98390 20015", role: "purchase-exec", team: "purchase", zones: ["Uttar Pradesh"], status: "active", last: "Yesterday, 11:09" },
    { id: "e15", name: "Fatima Sheikh", email: "fatima.sheikh@cyrix.in", phone: "+91 98390 20016", role: "purchase-exec", team: "purchase", zones: ["Uttar Pradesh"], status: "active", last: "Mon, 16:48" },
    { id: "e16", name: "Joseph Mathew", email: "joseph.mathew@cyrix.in", phone: "+91 94470 20017", role: "purchase-exec", team: "purchase", zones: ["Kerala"], status: "active", last: "Mon, 09:30" },
    { id: "e17", name: "Pooja Das", email: "pooja.das@cyrix.in", phone: "+91 99710 20018", role: "accounts", team: "accounts", zones: "all", status: "active", last: "Today, 09:44" },
    { id: "e18", name: "Karthik S.", email: "karthik.s@cyrix.in", phone: "+91 99710 20019", role: "accounts", team: "accounts", zones: "all", status: "active", last: "Yesterday, 15:02" },
    { id: "e19", name: "Lakshmi N.", email: "lakshmi.n@cyrix.in", phone: "+91 99710 20020", role: "accounts", team: "accounts", zones: "all", status: "active", last: "Mon, 12:40" },
    { id: "e20", name: "Ravi Teja", email: "ravi.teja@cyrix.in", phone: "+91 98480 20021", role: "store-grn", team: "store", zones: ["Uttar Pradesh"], status: "active", last: "Yesterday, 10:11" },
    { id: "e21", name: "Harpreet Kaur", email: "harpreet.kaur@cyrix.in", phone: "+91 98290 20022", role: "store-grn", team: "store", zones: ["Rajasthan"], status: "active", last: "Mon, 14:25" },
    { id: "e22", name: "Manoj K.", email: "manoj.k@cyrix.in", phone: "+91 94470 20023", role: "field-engineer", team: "field", zones: ["Kerala"], status: "active", last: "Today, 07:58" },
    { id: "e23", name: "Aisha Begum", email: "aisha.begum@cyrix.in", phone: "+91 98480 20024", role: "field-engineer", team: "field", zones: ["Andhra Pradesh"], status: "active", last: "Yesterday, 13:36" },
    { id: "e24", name: "Tarun Gupta", email: "tarun.gupta@cyrix.in", phone: "+91 98290 20025", role: "field-engineer", team: "field", zones: ["Andhra Pradesh"], status: "active", last: "Sun, 18:20" },
    { id: "e25", name: "Sunita Rao", email: "sunita.rao@cyrix.in", phone: "+91 98110 20026", role: "approver", team: "approvals", zones: "all", status: "active", last: "Today, 09:20" }
  ];

  var TEAMS = [
    { id: "purchase", name: "Purchase", icon: "shopping_cart", lead: "e1", desc: "Raises purchase requests and sources vendors." },
    { id: "approvals", name: "Approvals", icon: "task_alt", lead: "e3", desc: "Clears items and purchase orders above executive limit." },
    { id: "accounts", name: "Accounts", icon: "account_balance", lead: "e4", desc: "Advance payments, invoices and reconciliation." },
    { id: "store", name: "Store / GRN", icon: "inventory_2", lead: "e6", desc: "Goods receipt and stock allocation." },
    { id: "field", name: "Field Service", icon: "engineering", lead: "e7", desc: "On-site acknowledgement and warranty visits." }
  ];

  // ---- PI workload (mock, deterministic) -------------------------------------
  var ITEMS = ["Patient monitor SpO2 sensor", "Ventilator flow sensor", "ECG lead wire set", "Defibrillator pad", "Infusion pump cassette", "UPS battery 12V 7Ah",
    "Ultrasound probe cable", "X-ray tube cooling fan", "Syringe pump keypad", "Nebuliser compressor", "Autoclave door gasket", "Oxygen concentrator filter"];
  var STAGES = ["Awaiting approval", "Awaiting quotation", "Vendor follow-up", "Awaiting PO sign-off"];
  var CODES = { "Uttar Pradesh": "11", Kerala: "13", "Andhra Pradesh": "15", Rajasthan: "17" };
  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  var cache = {}, plan = null, TODAY = new Date();
  TODAY.setHours(0, 0, 0, 0);
  // Pool totals the employees' PI Unified data page shows (assets/mock-data.js summary). Employee workloads
  // are split so they add up to exactly these numbers.
  var SUMMARY = (window.CX_MOCK && window.CX_MOCK.summary && window.CX_MOCK.summary.counts) || { total: 840, by_status: { Approved: 524 } };
  function daysAgo(n) { var d = new Date(TODAY); d.setDate(d.getDate() - n); return d; }

  function makePlan() {
    var act = EMPLOYEES.filter(function (e) { return e.status === "active"; }), fixed = act.filter(function (e) { return e.fixed; }), free = act.filter(function (e) { return !e.fixed; });
    var totalA = SUMMARY.total - fixed.reduce(function (a, e) { return a + e.fixed[0]; }, 0), totalP = (SUMMARY.by_status.Approved || 0) - fixed.reduce(function (a, e) { return a + e.fixed[1]; }, 0);
    var pl = {}, w = free.map(function (e) { var r = rng(EMPLOYEES.indexOf(e) * 7919 + 13); return 0.6 + r(); }), ws = w.reduce(function (a, b) { return a + b; }, 0);
    var raw = w.map(function (x) { return totalA * x / ws; }), asg = raw.map(Math.floor), rem = totalA - asg.reduce(function (a, b) { return a + b; }, 0);
    raw.map(function (x, i) { return [x - Math.floor(x), i]; }).sort(function (a, b) { return b[0] - a[0]; }).slice(0, rem).forEach(function (p) { asg[p[1]]++; });
    var ratio = free.map(function (e) { var r = rng(EMPLOYEES.indexOf(e) * 104729 + 7); return 0.45 + r() * 0.35; });
    var apRaw = asg.map(function (a, i) { return a * ratio[i]; }), sc = totalP / apRaw.reduce(function (a, b) { return a + b; }, 0);
    var ap = apRaw.map(function (x, i) { return Math.max(0, Math.min(asg[i] - 1, Math.round(x * sc))); }), diff = totalP - ap.reduce(function (a, b) { return a + b; }, 0), i = 0, guard = 0;
    while (diff !== 0 && guard++ < 5000) { var j = i++ % free.length; if (diff > 0 && ap[j] < asg[j] - 1) { ap[j]++; diff--; } else if (diff < 0 && ap[j] > 0) { ap[j]--; diff++; } }
    free.forEach(function (e, k) { pl[e.id] = [asg[k], ap[k]]; });
    fixed.forEach(function (e) { pl[e.id] = e.fixed; });
    return pl;
  }

  function work(empId) {
    if (cache[empId]) return cache[empId];
    if (!plan) plan = makePlan();
    var e = by(EMPLOYEES, empId), idx = EMPLOYEES.indexOf(e), r = rng(idx * 7919 + 13), out;
    if (e.status !== "active") out = { assigned: 0, approved: 0, pending: 0, overdue: 0, tat: 0, pis: [], done: [] };
    else {
      var assigned = plan[empId][0], approved = plan[empId][1];
      var zs = e.zones === "all" ? ZONES : e.zones, pis = [], done = [], overdue = 0;
      for (var i = 0; i < assigned; i++) {
        var z = zs[Math.floor(r() * zs.length)], isDone = i < approved, age = isDone ? 1 + Math.floor(r() * 45) : Math.floor(r() * 7) + (i % 3 === 0 ? 1 : 0);
        var pi = { id: CODES[z] + String(100000 + Math.floor(r() * 899999)) + "-9" + String(10000 + idx * 1000 + i), item: ITEMS[Math.floor(r() * ITEMS.length)],
          zone: z, age: age, date: daysAgo(age), owner: empId, state: isDone ? "Approved" : STAGES[Math.floor(r() * STAGES.length)], qty: 1 + Math.floor(r() * 12) };
        if (isDone) done.push(pi); else { pi.overdue = age > 3; if (pi.overdue) overdue++; pis.push(pi); }
      }
      out = { assigned: assigned, approved: approved, pending: assigned - approved, overdue: overdue, tat: 4 + Math.floor(r() * 26), pis: pis, done: done };
    }
    return (cache[empId] = out);
  }
  function teamMembers(tid) { return EMPLOYEES.filter(function (e) { return e.team === tid; }); }
  function teamStats(tid) {
    var s = { assigned: 0, approved: 0, pending: 0, overdue: 0, tatSum: 0, tatN: 0, members: 0 };
    teamMembers(tid).forEach(function (e) {
      var w = work(e.id); s.members++; s.assigned += w.assigned; s.approved += w.approved; s.pending += w.pending; s.overdue += w.overdue;
      if (w.approved) { s.tatSum += w.tat * w.approved; s.tatN += w.approved; }
    });
    s.tat = s.tatN ? Math.round(s.tatSum / s.tatN) : 0; s.rate = s.assigned ? Math.round(s.approved / s.assigned * 100) : 0;
    return s;
  }
  function allPIs() { var l = []; EMPLOYEES.forEach(function (e) { var w = work(e.id); l = l.concat(w.pis, w.done); }); return l; }
  // in-memory only: moves one pending PI between employees until the page reloads
  function reassign(piId, toEmp) {
    var from = EMPLOYEES.filter(function (e) { return work(e.id).pis.some(function (p) { return p.id === piId; }); })[0];
    if (!from || from.id === toEmp) return;
    var a = work(from.id), b = work(toEmp), p = a.pis.filter(function (x) { return x.id === piId; })[0];
    a.pis = a.pis.filter(function (x) { return x !== p; });
    a.pending--; a.assigned--; b.pending++; b.assigned++;
    if (p.overdue) { a.overdue--; b.overdue++; }
    p.owner = toEmp; b.pis.push(p);
  }

  // ---- Admin accounts: created by the Super Admin, each with a limited set of admin powers ----
  // Access items are on/off. Monitor items are "none" | "view" | "act" (act = can approve, reject, reassign, cancel…).
  var ADMIN_CAPS = {
    access: [
      { id: "emp", label: "Manage employees", desc: "Add, edit, deactivate and re-team employees", icon: "groups" },
      { id: "roles", label: "Manage roles & permissions", desc: "Create roles and change what they can do", icon: "badge" },
      { id: "teams", label: "Manage teams", desc: "Create teams, move members, view PI workload", icon: "diversity_3" },
      { id: "audit", label: "View audit log", desc: "See who changed what", icon: "history" },
      { id: "items", label: "Create items", desc: "Add new items to the item master (SAP) when no item code exists yet", icon: "add_box" },
      { id: "po", label: "Approve high-value POs", desc: "POs above the approval limit wait for this admin, who is notified when one arrives", icon: "verified" }
    ],
    monitor: [
      { id: "m-pi", label: "PI Unified data", icon: "monitoring", acts: false },
      { id: "m-approval", label: "Approval", icon: "task_alt", acts: true },
      { id: "m-pr", label: "Purchase Request", icon: "shopping_cart", acts: true },
      { id: "m-quotation", label: "Quotation", icon: "request_quote", acts: true },
      { id: "m-po", label: "Purchase order", icon: "receipt_long", acts: true },
      { id: "m-messages", label: "Messages (bot control)", icon: "forum", acts: true }
    ]
  };
  var ADMIN_PRESETS = [
    { id: "full", name: "Full Admin", desc: "Everything except creating other admins.", access: ["emp", "roles", "teams", "audit", "items", "po"], monitor: { "m-pi": "act", "m-approval": "act", "m-pr": "act", "m-quotation": "act", "m-po": "act", "m-messages": "act" } },
    { id: "access", name: "Access Admin", desc: "Manages people, roles and teams. Can't act on purchases.", access: ["emp", "roles", "teams", "audit"], monitor: { "m-pi": "view" } },
    { id: "ops", name: "Operations Admin", desc: "Runs approvals, requests, quotations and POs. Can't change access.", access: ["teams", "audit", "items", "po"], monitor: { "m-pi": "view", "m-approval": "act", "m-pr": "act", "m-quotation": "act", "m-po": "act", "m-messages": "view" } },
    { id: "auditor", name: "Auditor", desc: "Read-only across the board.", access: ["audit"], monitor: { "m-pi": "view", "m-approval": "view", "m-pr": "view", "m-quotation": "view", "m-po": "view", "m-messages": "view" } }
  ];
  var ADMINS = [
    { id: "a0", name: "Nikhil", email: "nikhil@differentbyte.in", phone: "+91 98100 00001", preset: "super", teams: "all", status: "active", mfa: true, last: "Now", by: "—", locked: true },
    { id: "a1", name: "Sunita Kapoor", email: "sunita.kapoor@cyrix.in", phone: "+91 98110 40021", preset: "access", teams: "all", status: "active", mfa: true, last: "Today, 10:02", by: "Nikhil" },
    { id: "a2", name: "Rohit Bansal", email: "rohit.bansal@cyrix.in", phone: "+91 98290 40022", preset: "ops", teams: ["purchase", "approvals"], status: "active", mfa: true, last: "Yesterday, 17:48", by: "Nikhil" },
    { id: "a3", name: "Anjali Menon", email: "anjali.menon@cyrix.in", phone: "+91 94470 40023", preset: "auditor", teams: "all", status: "active", mfa: true, last: "Mon, 12:15", by: "Nikhil" },
    { id: "a4", name: "Dev Patel", email: "dev.patel@cyrix.in", phone: "+91 98250 40024", preset: "full", teams: ["accounts", "store"], status: "invited", mfa: false, last: "Never", by: "Nikhil" }
  ];

  // ---- Item master: items created in SAP through the Item Creation form ----
  var ITEM_GROUPS = ["Spares", "Consumables", "Capital equipment", "Accessories", "Services"], ITEM_UOMS = ["Nos", "Set", "Box", "Pair", "Meter", "Job"], ITEM_STATES = ["AP", "Kerala", "Rajasthan", "UP"];
  var ITEM_NAMES = ["O2 sensor cell", "Flow sensor", "Humidifier chamber", "ECG trunk cable", "SpO2 probe, adult", "NIBP cuff, adult", "Defibrillator paddle", "Infusion pump keypad", "Syringe pump battery", "Autoclave door gasket",
    "X-ray tube fan", "Ultrasound probe cable", "Nebuliser compressor", "Suction regulator", "Oxygen flowmeter", "Ventilator exhalation valve", "UPS battery 12V 7Ah", "Pulse oximeter finger clip"];
  var ITEM_MAKES = ["Mindray SV300", "Philips MX450", "GE B20", "Nihon Kohden", "BPL 6408", "Schiller Argus", "Allengers MARS 60", "Skanray CV 200"];
  var ITEM_MASTER = (function () {
    var out = [], people = ["Rahul Menon", "Priya K.", "Arjun Pillai", "Kavya Reddy", "Rakesh Yadav", "Rohit Bansal", "Dev Patel", "Nikhil (Super Admin)"], kinds = ["employee", "employee", "employee", "employee", "employee", "admin", "admin", "super"];
    for (var i = 0; i < 64; i++) {
      var r = rng(i * 6151 + 29), who = Math.floor(r() * people.length), d = new Date(TODAY0()); d.setDate(d.getDate() - Math.floor(r() * 60));
      out.push({ code: "I-" + (116400 - i * 3), desc: ITEM_NAMES[Math.floor(r() * ITEM_NAMES.length)] + ", " + ITEM_MAKES[Math.floor(r() * ITEM_MAKES.length)] + " compatible",
        group: ITEM_GROUPS[Math.floor(r() * 4)], uom: ITEM_UOMS[Math.floor(r() * 3)], hsn: String(90180000 + Math.floor(r() * 9999)), state: ITEM_STATES[Math.floor(r() * 4)],
        by: people[who], kind: kinds[who], date: d, status: i < 3 ? "Syncing" : i === 9 ? "Failed" : "Created in SAP", ref: r() < 0.6 ? "PI-" + (100000 + Math.floor(r() * 899999)) : "" });
    }
    return out;
  })();
  function TODAY0() { var d = new Date(); d.setHours(0, 0, 0, 0); return d; }

  var AUDIT = [
    { when: "Today, 10:15", who: "Nikhil (Super Admin)", type: "admin", target: "Sunita Kapoor", change: "Admin account updated: added “Manage teams”" },
    { when: "Yesterday, 15:30", who: "Nikhil (Super Admin)", type: "admin", target: "Dev Patel", change: "Admin account created (Full Admin · Accounts, Store / GRN)" },
    { when: "Today, 09:30", who: "Nikhil (Super Admin)", type: "role", target: "Purchase Manager", change: "Added “Export” on Purchase order" },
    { when: "Today, 08:55", who: "Nikhil (Super Admin)", type: "employee", target: "Priya K.", change: "Granted extra module: Approval" },
    { when: "Yesterday, 17:10", who: "Nikhil (Super Admin)", type: "employee", target: "Imran Khan", change: "Invited as Store / GRN · Uttar Pradesh" },
    { when: "Yesterday, 12:44", who: "Nikhil (Super Admin)", type: "role", target: "Accounts", change: "Removed “Delete” on Purchase order" },
    { when: "Mon, 15:02", who: "Nikhil (Super Admin)", type: "employee", target: "Suresh Rao", change: "Revoked module: Messages" },
    { when: "Mon, 11:20", who: "Nikhil (Super Admin)", type: "role", target: "Field Engineer", change: "Role created (Purchase: View · Messages: View)" },
    { when: "12 Sep", who: "Nikhil (Super Admin)", type: "employee", target: "Meera Iyer", change: "Deactivated account" },
    { when: "10 Sep", who: "Nikhil (Super Admin)", type: "role", target: "Approver", change: "Zone scope changed: Kerala → All zones" }
  ];

  function by(list, id) { for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i]; return null; }
  function initials(n) { return n.replace(/\(.*\)/, "").split(/\s+/).filter(Boolean).slice(0, 2).map(function (w) { return w.charAt(0).toUpperCase(); }).join(""); }
  function zoneText(z) { return z === "all" ? "All zones" : z.join(", "); }
  function sortMods(ids) { return MODS.filter(function (m) { return ids.indexOf(m.id) >= 0; }); }

  // modules an employee ends up with: role modules + granted − revoked
  function empModules(e) {
    var r = by(ROLES, e.role), out = r ? Object.keys(r.perms) : [];
    (e.grant || []).forEach(function (m) { if (out.indexOf(m) < 0) out.push(m); });
    return out.filter(function (m) { return (e.revoke || []).indexOf(m) < 0; });
  }

  // dark mini-sidebar showing which modules a person would see
  function previewHtml(ids) {
    var mods = sortMods(ids);
    if (!mods.length) return '<div class="sa-prev"><div class="sa-prev-empty">No modules — this person sees an empty sidebar.</div></div>';
    return '<div class="sa-prev"><div class="nav-group"><div>Overview</div>' + mods.map(function (m, i) {
      return '<span class="nav-link' + (i === 0 ? " active" : "") + '"><span class="mi">' + m.icon + "</span>" + m.label + "</span>";
    }).join("") + "</div></div>";
  }

  function chips(ids) {
    var mods = sortMods(ids);
    return mods.length ? mods.map(function (m) { return '<span class="badge"><span class="mi" style="font-size:14px">' + m.icon + "</span>" + m.label + "</span>"; }).join(" ") : '<span class="faint">No modules</span>';
  }

  var here = location.pathname.split("/").pop();
  function param(k) { return new URLSearchParams(location.search).get(k); }
  // ---- Module documents (approvals / purchase requests / quotations / POs), derived from the PI pool ----
  var VENDORS = ["Medisys Spares Pvt Ltd", "Southern Biomedicals", "Prime Healthtech", "Delta Surgical Traders", "Orion Medical Components", "Kerala Med Supplies"];
  function hash(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }
  var docCache = {};
  // Approval rule: a PO above the threshold can't be issued on an employee's sign-off — an admin must approve it.
  var POLICY = { poThreshold: 100000, notify: { app: true, email: true, whatsapp: false }, remindHours: 24 };
  function docs(kind) {
    if (docCache[kind]) return docCache[kind];
    var out = [];
    allPIs().forEach(function (p) {
      var r = rng(hash(p.id + kind)), unit = 500 + Math.floor(r() * 40) * 250, tail = p.id.slice(-5);
      var row = { pi: p.id, item: p.item, zone: p.zone, qty: p.qty, age: p.age, date: p.date, owner: p.owner, value: unit * p.qty, overdue: !!p.overdue };
      var s = p.state;
      if (kind === "approvals") {
        row.id = "AP-" + tail; row.status = s === "Awaiting approval" ? "Pending" : "Approved"; out.push(row);
      } else if (kind === "pr" && s !== "Awaiting approval") {
        row.id = "PR-" + tail; row.status = { "Awaiting quotation": "Sourcing", "Vendor follow-up": "Quotes in", "Awaiting PO sign-off": "PO pending", Approved: "Closed" }[s]; out.push(row);
      } else if (kind === "quotations" && s !== "Awaiting approval") {
        row.id = "QT-" + tail;
        var n = s === "Awaiting quotation" ? 0 : 2 + Math.floor(r() * 3), qs = [];
        for (var i = 0; i < n; i++) qs.push({ vendor: VENDORS[(hash(p.id) + i) % VENDORS.length], price: Math.round(unit * (0.88 + r() * 0.28) / 10) * 10, days: 3 + Math.floor(r() * 9) });
        row.quotes = qs; row.vendor = null;
        if (s === "Awaiting PO sign-off" || s === "Approved") { row.vendor = qs.slice().sort(function (a, b) { return a.price - b.price; })[0].vendor; }
        row.status = !n ? "Awaiting quotes" : s === "Approved" ? "Approved" : row.vendor ? "Vendor selected" : "Comparing"; out.push(row);
      } else if (kind === "po" && (s === "Awaiting PO sign-off" || s === "Approved")) {
        row.id = "PO-45" + String(10000 + (hash(p.id) % 89999)); row.vendor = VENDORS[hash(p.id) % VENDORS.length];
        row.value = Math.round(row.value * 1.5 / 250) * 250;
        row.status = s === "Awaiting PO sign-off" ? "Awaiting sign-off" : ["Issued", "In transit", "Delivered"][Math.floor(r() * 3)];
        row.high = row.value > POLICY.poThreshold;
        if (row.high) {
          if (row.status === "Awaiting sign-off") row.status = "Awaiting admin approval";
          else row.approvedBy = ["Rohit Bansal", "Dev Patel", "Nikhil (Super Admin)"][hash(p.id) % 3];
        }
        out.push(row);
      }
    });
    return (docCache[kind] = out);
  }
  // Changing the threshold re-sorts POs that are still waiting for sign-off
  function applyThreshold(n) {
    POLICY.poThreshold = n;
    docs("po").forEach(function (r) {
      r.high = r.value > n;
      if (r.status === "Awaiting admin approval" && !r.high) r.status = "Awaiting sign-off";
      else if (r.status === "Awaiting sign-off" && r.high) r.status = "Awaiting admin approval";
    });
  }
  function poWaiting() { return docs("po").filter(function (r) { return r.status === "Awaiting admin approval"; }).sort(function (a, b) { return b.age - a.age; }); }
  function log(type, target, change) { AUDIT.unshift({ when: "Just now", who: "Nikhil (Super Admin)", type: type, target: target, change: change }); }

  function teamName(id) { var t = by(TEAMS, id); return t ? t.name : "Unassigned"; }
  window.SA = { ACTS: ACTS, MODS: MODS, ZONES: ZONES, ROLES: ROLES, EMPLOYEES: EMPLOYEES, AUDIT: AUDIT, TEAMS: TEAMS, STAGES: STAGES, ADMINS: ADMINS, ADMIN_PRESETS: ADMIN_PRESETS, ADMIN_CAPS: ADMIN_CAPS, ITEM_MASTER: ITEM_MASTER, ITEM_GROUPS: ITEM_GROUPS, ITEM_UOMS: ITEM_UOMS, ITEM_STATES: ITEM_STATES, docs: docs, log: log, POLICY: POLICY, applyThreshold: applyThreshold, poWaiting: poWaiting, VENDORS: VENDORS,
    team: function (id) { return by(TEAMS, id); }, teamName: teamName, teamMembers: teamMembers, teamStats: teamStats, work: work, allPIs: allPIs, reassign: reassign,
    role: function (id) { return by(ROLES, id); }, emp: function (id) { return by(EMPLOYEES, id); }, mod: function (id) { return by(MODS, id); },
    initials: initials, zoneText: zoneText, empModules: empModules, sortMods: sortMods, previewHtml: previewHtml, chips: chips, param: param };

  var brand = { mark: "C", name: "Cyrix Super Admin", sub: "Access control", href: "index.html", logo: "../assets/cyrix-logo.png" };
  var vr = here === "role-view.html" ? (by(ROLES, param("role")) || ROLES[0]) : null;
  var cfg = { brand: brand, search: "Search employees, roles or modules…", promo: null, kpiIcons: [] };
  if (vr) {
    // "View as role" demo: sidebar shows only that role's modules (links are inert)
    cfg.search = "Search…";
    cfg.user = { initials: initials(vr.name), name: vr.name, role: "Previewing · " + zoneText(vr.zones) };
    cfg.nav = [
      { group: "Overview", items: sortMods(Object.keys(vr.perms)).map(function (m) { return { href: "role-view.html?role=" + vr.id + "&m=" + m.id, label: m.label, icon: m.icon }; }) },
      { group: "Demo", items: [{ href: "index.html", label: "Exit role preview", icon: "logout" }] }
    ];
  } else {
    cfg.user = { initials: "NK", name: "Nikhil", role: "Super Admin" };
    cfg.nav = [
      { group: "Overview", items: [{ href: "index.html", label: "Super Admin Home", icon: "dashboard" }] },
      { group: "Access control", items: [
        { href: "employees.html", label: "Employees", icon: "groups", count: EMPLOYEES.length },
        { href: "admins.html", label: "Admin accounts", icon: "admin_panel_settings", count: ADMINS.length },
        { href: "roles.html", label: "Roles", icon: "badge", count: ROLES.length },
        { href: "access-matrix.html", label: "Access overview", icon: "grid_view" },
        { href: "audit-log.html", label: "Audit log", icon: "history" }
      ] },
      { group: "Teams & workload", items: [
        { href: "teams.html", label: "Teams", icon: "diversity_3", count: TEAMS.length },
        { href: "pi-workload.html", label: "PI workload", icon: "assignment_ind" }
      ] },
      { group: "Catalog", items: [
        { href: "items.html", label: "Items", icon: "add_box" }
      ] },
      { group: "Monitor & act", items: [
        { href: "monitor-pi.html", label: "PI Unified data", icon: "monitoring" },
        { href: "monitor-approvals.html", label: "Approval", icon: "task_alt" },
        { href: "monitor-pr.html", label: "Purchase Request", icon: "shopping_cart" },
        { href: "monitor-quotations.html", label: "Quotation", icon: "request_quote" },
        { href: "monitor-po.html", label: "Purchase order", icon: "receipt_long" },
        { href: "high-value-po.html", label: "High-value POs", icon: "verified", count: poWaiting().length || undefined },
        { href: "monitor-messages.html", label: "Messages", icon: "forum" }
      ] }
    ];
  }
  window.CX_CONFIG = cfg;
})();
