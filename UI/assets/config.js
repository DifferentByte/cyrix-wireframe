/* Cyrix Purchase AOS — shell configuration (brand, nav, user). Loaded before cyrix-shell.js. */
window.CX_CONFIG = {
  brand:  { mark: "C", name: "Cyrix Purchase", sub: "AOS · AI procurement", href: "index.html", logo: "assets/cyrix-logo.png" },
  search: "Search PR, PO, barcode or vendor…",
  user:   { initials: "PK", name: "Priya K.", role: "Purchase Exec · South zone" },
  notify: "3 overdue POs · 2 CMC renewals due in 30 days · 1 vendor below 60%",
  promo:  null,
  nav: [
    { group: "Overview", items: [
      { href: "dashboard.html", label: "PI Unified data", icon: "monitoring" },
      { href: "approval.html", label: "Approval", icon: "task_alt" },
      { href: "purchase.html", label: "Purchase Request", icon: "shopping_cart" },
      { href: "quotations.html", label: "Quotation", icon: "request_quote" },
      { href: "purchase-orders.html", label: "Purchase order", icon: "receipt_long" },
      { href: "messages.html", label: "Messages", icon: "forum" }
    ]},
    { group: "Manual entry", items: [
      { href: "manual-pr.html", label: "Manual PR", icon: "edit_note" },
      { href: "item-creation.html", label: "Item Creation", icon: "add_box" }
    ]}
  ],
  // purchase-specific KPI icons, checked before the shell defaults
  kpiIcons: [
    [/advances to raise|utr/i, "payments"],
    [/grn|open$/i, "local_shipping"],
    [/pm report/i, "verified_user"]
  ]
};
