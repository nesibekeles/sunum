/* düğün.com · Daha Çok Çift Düğün.com'da
   The short deck: one board of topics, one topic on screen at a time.
   Standalone — shares only the data files with the full panel. */
(function () {
"use strict";

var C = window.CONTENT, P = window.PRICING, S = window.SUNUM, REG = window.REGION;
var CFG = window.APP_CONFIG, STORY = window.STORY || {}, MKT = window.MARKET || {};

/* Every picker in the deck runs through these two, so the scope rule lives in
   data/config.js and not in eight separate `.map()` calls. */
function cityList(list) { return CFG.filterCities(list || CFG.cities); }
function catList(list) { return CFG.filterCats(list); }

function $(s, r) { return (r || document).querySelector(s); }
function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
  return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
var NF = new Intl.NumberFormat("tr-TR");
function n(v, d) {
  if (v == null || isNaN(v)) return "—";
  return new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: d || 0, maximumFractionDigits: d == null ? 0 : d }).format(v);
}
function tl(v) { return v == null || isNaN(v) ? "—" : NF.format(Math.round(v)) + " ₺"; }
function pct(v, d) { return v == null || isNaN(v) ? "—" : "%" + n(v * 100, d == null ? 1 : d); }
function repNote(html) {
  return '<div class="rep-note"><b class="tag">Satışçı notu</b>' + html + "</div>";
}
/* Count-ups are time-based with a guaranteed final write: a throttled timer
   must never leave a wrong figure on screen in front of a customer. */
function countUp(scope) {
  $$("[data-count]", scope || document).forEach(function (el) {
    if (el.dataset.done) return;
    el.dataset.done = "1";
    var target = +el.dataset.count, suffix = el.dataset.suffix || "";
    var money = el.dataset.money === "1";
    var DUR = 700, t0 = Date.now();
    var write = function (v) { el.textContent = (money ? tl(v) : n(v)) + suffix; };
    var iv = setInterval(function () {
      var p = Math.min(1, (Date.now() - t0) / DUR);
      write(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p >= 1) clearInterval(iv);
    }, 24);
    setTimeout(function () { clearInterval(iv); write(target); }, DUR + 300);
  });
}
function chips(id, items, current, label) {
  return '<div class="chips" id="' + id + '">' + items.map(function (it) {
    var v = typeof it === "string" ? it : it.v, t = typeof it === "string" ? it : it.t;
    return '<button class="chip" data-v="' + esc(v) + '" aria-pressed="' + (v === current) + '">' +
      esc(label ? label(t) : t) + "</button>";
  }).join("") + "</div>";
}
function bindChips(id, onPick) {
  $$("#" + id + " .chip").forEach(function (b) {
    b.addEventListener("click", function () {
      $$("#" + id + " .chip").forEach(function (o) { o.setAttribute("aria-pressed", o === b); });
      onPick(b.dataset.v);
    });
  });
}
/* Every filter on the deck is a dropdown — one control, one look. Chips stay
   only where they are answers, not filters (the Instagram experiment). */
function sel(id, items, current) {
  return '<select id="' + id + '">' + items.map(function (it) {
    var v = typeof it === "string" ? it : it.v, t = typeof it === "string" ? it : it.t;
    return '<option value="' + esc(v) + '"' + (v === current ? " selected" : "") + ">" + esc(t) + "</option>";
  }).join("") + "</select>";
}
function bindSel(id, onPick) {
  var s = $("#" + id);
  if (s) s.addEventListener("change", function () { onPick(this.value); });
}
/* A money input: ₺ adornment, thousands separated live (350000 -> 350.000).
   Empty until the venue owner types — the training wants the numbers to come
   from them, not from a prefilled default. */
function tlInput(id, placeholder) {
  return '<span class="tl-input"><i>₺</i><input type="text" inputmode="numeric" id="' + id +
    '" placeholder="' + esc(placeholder || "0") + '" autocomplete="off"></span>';
}
function tlVal(id) {
  var el = $("#" + id);
  return el ? +(String(el.value).replace(/[^0-9]/g, "") || 0) : 0;
}
function bindTl(id, onChange) {
  var el = $("#" + id);
  if (!el) return;
  el.addEventListener("input", function () {
    var digits = this.value.replace(/[^0-9]/g, "").slice(0, 12);
    this.value = digits ? NF.format(+digits) : "";
    if (onChange) onChange();
  });
}
function shuffle(arr) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

/* ------------------------------------------------------------------- state */
/* Progress is per session on purpose: a refresh starts the meeting fresh.
   An opened topic goes quiet rather than green, so the untouched ones stay the
   loud thing on the board. */
var seen = {};
function markSeen(id) { seen[id] = 1; }

/* ---------------------------------------------------------- click tracking */
/* One "oturum" = one browser-tab visit of the deck: the id lives in
   sessionStorage, so a refresh keeps it but a new tab or a new day starts a
   new one — which matches how a rep runs one meeting in one tab. */
var SID = (function () {
  try {
    var v = sessionStorage.getItem("dc_sid");
    if (!v) {
      v = Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7);
      sessionStorage.setItem("dc_sid", v);
    }
    return v;
  } catch (e) { return ""; }
})();

function authEndpoint() {
  if (CFG.authUrl) return CFG.authUrl;
  try { return localStorage.getItem("dc_sales_auth_url") || ""; } catch (e) { return ""; }
}

/* Fire-and-forget: a click event must never slow the presentation down or
   surface an error in front of a customer. sendBeacon survives the page being
   closed right after the click; the fetch fallback carries keepalive for the
   same reason. Identity travels as the login token — the server records the
   click for whoever the token proves, not for whatever the page claims. */
function trackTile(id, title) {
  var url = authEndpoint();
  if (!url) return;
  var sess = null;
  try { sess = JSON.parse(localStorage.getItem("dc_sales_session") || "null"); } catch (e) {}
  if (!sess || !sess.token) return;
  var payload = JSON.stringify({
    action: "tile", tile: id, title: title, token: sess.token, sid: SID
  });
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, new Blob([payload], { type: "text/plain;charset=utf-8" }));
    } else {
      fetch(url, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: payload, keepalive: true });
    }
  } catch (e) { /* tracking is best-effort by design */ }
}

/* ---------------------------------------------------------------- the user */
/* Who is presenting. `dept` comes from the sheet when it has a Departman
   column; otherwise the two sales teams count as Satış — that is the rule the
   business gave ("Satış departmanındaki ekipler: MoS, SAS"). */
function currentUser() {
  var u = window.CURRENT_USER || {};
  var team = (u.team || "").trim();
  var dept = (u.dept || "").trim();
  var isSales = dept ? CFG.fold(dept) === "satis" : (team === "MoS" || team === "SAS");
  return { name: u.name || "", team: team, dept: dept, isSales: isSales,
           city: (u.city || "").trim() };
}

/* Restrained line icons — 24x24, single stroke, currentColor. */
var ICONS = {
  rings: '<circle cx="9" cy="15" r="6"/><circle cx="15" cy="9" r="6"/>',
  quote: '<path d="M9 7H5a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h2v2a2 2 0 0 1-2 2"/>' +
         '<path d="M19 7h-4a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h2v2a2 2 0 0 1-2 2"/>',
  trend: '<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
  "return": '<path d="M21 12a9 9 0 1 1-3.5-7.1"/><path d="M21 3v6h-6"/><path d="M12 8v8"/>' +
            '<path d="M9.5 10.5h5"/><path d="M9.5 13.5h5"/>',
  partner: '<circle cx="9" cy="12" r="5"/><circle cx="15" cy="12" r="5"/>',
  camera: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/>' +
          '<circle cx="17.2" cy="6.8" r=".9" fill="currentColor" stroke="none"/>',
  radar: '<circle cx="11" cy="11" r="7"/><path d="M11 4v7l5 3"/><path d="M20 20l-3.6-3.6"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18"/>' +
            '<path d="M8 3v4M16 3v4"/><path d="M8 15h3"/>',
  check: '<path d="M4 12.5l5 5L20 6.5"/>',
  megaphone: '<path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1z"/>' +
             '<path d="M16 9a4 4 0 0 1 0 6"/><path d="M19 6.5a8 8 0 0 1 0 11"/>',
  headset: '<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="2" y="13" width="4" height="7" rx="2"/>' +
           '<rect x="18" y="13" width="4" height="7" rx="2"/><path d="M20 20a4 4 0 0 1-4 2h-2"/>',
  chart: '<path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-7"/><path d="M2 20h20"/>',
  cap: '<path d="M2 8.5L12 4l10 4.5L12 13 2 8.5z"/>' +
       '<path d="M6 10.8V16c0 1.7 2.7 3 6 3s6-1.3 6-3v-5.2"/>',
  home: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>'
};
function icon(k, size) {
  return '<svg class="ico" width="' + (size || 26) + '" height="' + (size || 26) +
    '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" ' +
    'stroke-linecap="round" stroke-linejoin="round">' + (ICONS[k] || "") + "</svg>";
}

/* -------------------------------------------------------------------- board */
function renderBoard() {
  $("#s-title").textContent = S.title;
  $("#bento").innerHTML = S.tiles.map(function (t) {
    return '<button class="tile' + (seen[t.id] ? " done" : "") + '" data-id="' + t.id +
      '" data-w="' + t.w + '" style="grid-area:' + t.area + '">' +
      '<span class="go">' + (seen[t.id] ? icon("check", 15) : "→") + "</span>" +
      '<span class="ic">' + icon(t.icon, t.w >= 4 ? 30 : 24) + "</span>" +
      "<h3>" + esc(t.t) + '</h3><span class="d">' + esc(t.d) + "</span></button>";
  }).join("");
  var done = S.tiles.filter(function (t) { return seen[t.id]; }).length;
  $("#s-progress").textContent = done
    ? done + " / " + S.tiles.length + " başlık konuşuldu"
    : S.tiles.length + " başlık";
  $$("#bento .tile").forEach(function (b) {
    b.addEventListener("click", function () { openTopic(b.dataset.id, b); });
  });
}

/* --------------------------------------------------- open / close transition */
/* The ghost is decoration only: the topic is rendered and shown regardless, so
   a throttled transition can never leave the deck stuck on a blank screen. */
var simObserver = null;
function openTopic(id, fromEl) {
  var tile = S.tiles.filter(function (t) { return t.id === id; })[0];
  if (!tile) return;
  var ghost = $("#s-ghost");
  if (fromEl) {
    var r = fromEl.getBoundingClientRect();
    ghost.hidden = false;
    ghost.style.cssText = "left:" + r.left + "px;top:" + r.top + "px;width:" + r.width +
      "px;height:" + r.height + "px;opacity:1;transition:none";
    void ghost.offsetWidth;
    ghost.style.transition = "";
    ghost.style.left = "0px"; ghost.style.top = "0px";
    ghost.style.width = window.innerWidth + "px";
    ghost.style.height = window.innerHeight + "px";
    ghost.style.opacity = "0";
    ghost.style.borderRadius = "0";
    setTimeout(function () { ghost.hidden = true; ghost.style.cssText = ""; }, 460);
  }
  markSeen(id);
  trackTile(id, tile.t);
  $("#s-board").hidden = true;
  var topic = $("#s-topic");
  topic.hidden = false;
  /* the simulator page gets a one-line, lighter title so the tool itself fits
     the first screen */
  topic.classList.toggle("compact", id === "verim");
  /* the simulator's full-bleed mode belongs to that page only — it must not
     leak into the next topic (it hid the title and pushed the cards to the
     window edges on the ROI page) */
  topic.classList.remove("sim-full");
  $("#s-sim-home").hidden = true;
  $("#s-topic-kick").textContent = tile.d;
  $("#s-topic-title").textContent = tile.t;
  var body = $("#s-topic-body");
  body.innerHTML = "";
  (PAGES[id] || function () { body.innerHTML = "<div class='panel'><p>Hazırlanıyor.</p></div>"; })(body);
  countUp(body);
  window.scrollTo(0, 0);
}
function goHome() {
  stopMap();
  $("#s-sim-home").hidden = true;
  if (simObserver) { try { simObserver.disconnect(); } catch (e) {} simObserver = null; }
  $("#s-topic").hidden = true;
  $("#s-topic").classList.remove("sim-full");
  $("#s-board").hidden = false;
  renderBoard();
  window.scrollTo(0, 0);
}

/* ================================================================== PAGES */
var PAGES = {};

/* ---------------------------------------------------- 1. Her düğün ... başlar */
PAGES.baslar = function (el) {
  var B = S.baslar;
  var h = '<div class="panel hero-tint"><span class="s-kick">' + esc(B.kicker) + "</span>" +
    "<h2>Türkiye'de her düğün Düğün.com ile başlar</h2></div>";

  h += '<div class="panel"><h2>' + esc(B.googleTitle) + "</h2><p>" + esc(B.googleNote) + "</p>" +
    '<div class="gbox">' + googleIcon() +
    '<input type="text" id="g-q" value="düğün mekanları">' +
    '<button class="btn" id="g-go">Ara</button></div></div>';

  h += '<div class="panel"><div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">' +
    "<h2 style='margin:0'>" + esc(B.mapTitle) + '</h2>' +
    '<span class="live-badge week"><i></i>SON 1 HAFTA</span></div>' +
    '<div class="grid g2" style="margin-top:16px">' +
    "<div><label class='fld'>Şehir</label><select id='map-city'><option value=''>Tüm Türkiye</option>" +
    MAP.cityGroups.map(function (g) { return "<option>" + esc(g.label) + "</option>"; }).join("") +
    "</select><div class='kapsam' id='map-city-scope'></div></div>" +
    "<div><label class='fld'>Kategori</label><select id='map-cat'>" +
    "<option value=''>Tüm kategoriler</option>" +
    MAP.catGroups.map(function (g) { return "<option>" + esc(g.label) + "</option>"; }).join("") +
    "</select><div class='kapsam' id='map-cat-scope'></div></div></div>" +
    '<div class="map-ticker" id="map-ticker"></div>' +
    '<div class="map-flex" id="map-flex">' + mapMarkup() +
    '<aside class="map-feed" id="map-feed" hidden>' +
    '<div class="mf-head" id="mf-head"></div><div class="mf-list" id="mf-list"></div></aside></div>' +
    '<div id="map-board"></div>' +
    '<div class="note" id="map-note">' + esc(B.mapInfo) + "</div></div>";

  el.innerHTML = h;
  function search() {
    var q = ($("#g-q").value || "").trim();
    if (q) window.open("https://www.google.com/search?q=" + encodeURIComponent(q), "_blank", "noopener");
  }
  $("#g-go").addEventListener("click", search);
  $("#g-q").addEventListener("keydown", function (e) { if (e.key === "Enter") search(); });
  $("#map-city").addEventListener("change", mapRefresh);
  $("#map-cat").addEventListener("change", mapRefresh);

  /* a sales user starts zoomed into their own city when the login sheet
     carries one (the "Şehir" column; optional, the map works without it) */
  var u = currentUser();
  if (u && (u.team === "SAS" || u.team === "MoS") && u.city) {
    var mine = mapGroupOfCity(u.city);
    if (mine) $("#map-city").value = mine;
  }
  mapRefresh();
  loadMapSheet(mapRefresh);
};

function googleIcon() {
  return '<svg width="22" height="22" viewBox="0 0 48 48" aria-hidden="true">' +
    '<path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.6 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.8 6.1C12.3 13.2 17.6 9.5 24 9.5z"/>' +
    '<path fill="#4285F4" d="M46.1 24.6c0-1.6-.1-3.2-.4-4.6H24v9.1h12.4c-.5 2.9-2.2 5.4-4.6 7l7.6 5.9c4.4-4.1 6.7-10.1 6.7-17.4z"/>' +
    '<path fill="#FBBC05" d="M10.4 28.7c-.5-1.4-.8-2.9-.8-4.7s.3-3.3.8-4.7l-7.8-6.1C.9 16.4 0 20.1 0 24s.9 7.6 2.6 10.8l7.8-6.1z"/>' +
    '<path fill="#34A853" d="M24 48c6.2 0 11.5-2 15.4-5.6l-7.6-5.9c-2.1 1.4-4.8 2.3-7.8 2.3-6.4 0-11.7-3.7-13.6-9.1l-7.8 6.1C6.5 42.6 14.6 48 24 48z"/>' +
    "</svg>";
}

/* --------------------------------------------------------- 2. Instagram */
PAGES.instagram = function (el) {
  var I = S.instagram;

  /* the hand-off metric: raw button clicks ×1.5 (couples who see the handle
     and search Instagram themselves never press the button) */
  var igRaw = (MKT.ig && MKT.ig.d30) || 0;
  var igAdj = Math.round(igRaw * 1.5 / 500) * 500;
  el.innerHTML =
    '<div class="panel hero-tint"><h2>' + esc(I.hero).replace("\n", "<br>") + "</h2></div>" +
    (igAdj ? '<div class="panel tint"><h2>' + esc(I.metricTitle) + "</h2>" +
      '<div class="cal-count" style="margin-top:6px"><span class="v num" data-count="' + igAdj +
      '">0</span><span class="l">' + esc(I.metricL) + "</span></div>" +
      '<p class="ig-aside">' + esc(I.metricAside) + "</p></div>" : "") +
    '<div class="panel ask"><div class="ask-ic">' +
    '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M4 5h16v10H9l-5 4V5z"/><path d="M9 10h.01M12 10h.01M15 10h.01"/></svg></div>' +
    "<div><h3>" + esc(I.askTitle) + "</h3><p style='margin:0'>" + esc(I.askText) + "</p></div></div>";
  countUp(el);
};

/* ------------------------------------------------------------ 3. Ortaklık */
PAGES.ortaklik = function (el) {
  var O = S.ortaklik;
  el.innerHTML = '<div class="grid g2">' + O.pillars.map(function (p) {
      return '<div class="pillar"><div class="ic">' + icon(p.icon, 28) + "</div><h3>" + esc(p.t) +
        "</h3><p>" + esc(p.d) + '</p><div class="pf">' + esc(p.proof) + "</div></div>";
    }).join("") + "</div>";
};

/* ------------------------------------------------------------- 4. Simülatör */
/* The simulator has to read as a page of this deck, not as a box inside it.
   Same-origin (http/https), the frame is sized to its content and the
   simulator's own chrome — header, snap-scroll container, scroll hints, dot
   navigation, footer — is switched off by injected CSS, so there is exactly one
   scrollbar: the deck's. Off file:// the frame is opaque and the simulator
   simply keeps its own look; everything still works. */
/* The simulator keeps every feature it has on its own — the snap-scrolling
   sections, the dot navigation on the right, the sticky filter bar — and loses
   only its header. The frame fills the viewport below the deck's compact
   title, so the deck page itself has nothing to scroll: the one scrollbar on
   screen is the simulator's own. */
/* Exactly one scrollbar, the simulator's own `.snap`. The iframe DOCUMENT must
   never scroll: #page1 was 100vh plus padding (so it overflowed by its own
   padding) and page 2 adds a footer under the snap container — both pushed a
   second scrollbar onto the screen. */
var SIM_CSS =
  "header{display:none!important}:root{--hdr:0px!important}" +
  /* the venue never needs to see which access code is active */
  ".codeline{display:none!important}" +
  /* section titles ("Aylık talep tahmini", "Yatırımın geri dönüşü") step up */
  ".sec-title{font-size:30px!important}" +
  "html,body{background:transparent!important;overflow:hidden!important;height:100%!important}" +
  /* #page0 is the access-code screen the 26.08.2026 build added — it gets the
     same fit-to-frame treatment as the venue screen */
  "#page0,#page1{min-height:0!important;height:100vh!important;box-sizing:border-box!important;" +
  "overflow:auto!important;align-items:safe center!important;padding:14px 16px 18px!important}" +
  "#foot{display:none!important}" +
  /* A short frame (laptop with the bookmarks bar, 620px screens): the venue
     card tightens its paddings and type so it still fits without a scroll. */
  "@media (max-height:560px){" +
  "#page0,#page1{padding:8px 12px 10px!important}" +
  "#page0 .card,#page1 .card{padding:14px 16px 12px!important;max-width:600px!important}" +
  "#page0 h2,#page1 h2{font-size:16px!important}#page0 .sub,#page1 .sub{font-size:12px!important;margin-bottom:2px!important}" +
  "#page0 .lbl,#page1 .lbl{margin:7px 0 4px!important;font-size:11.5px!important}" +
  "#page1 .seg{gap:5px!important}#page1 .seg button{padding:6px 7px!important;font-size:12px!important;min-width:48px!important}" +
  "#page0 select,#page0 input,#page1 select,#page1 input[type=text]{padding:7px 10px!important;font-size:13px!important}" +
  "#page1 .cust-info{padding:6px 8px!important;font-size:11px!important}" +
  "#startBtn{margin-top:10px!important;padding:10px!important;font-size:14px!important}}";

/* Page 2 of the simulator ("simülasyon") is shown full-bleed: the deck's title
   block steps aside, the frame spans the window, so the simulator's own
   section scrollbar sits at the window's right edge and is the only scrollbar
   on screen. Each of the three sections is then scaled to fit the frame
   (CSS zoom), so the scrollbar only ever moves between sections — never
   inside one — and the dot navigation lands exactly on each section. */
PAGES.verim = function (el) {
  el.innerHTML = '<iframe class="simframe native" id="sim-frame" src="' +
    C.links.simulatorLocal + '?v=20260904b" title="Satış Simülatörü"></iframe>';
  var f = $("#sim-frame"), topic = $("#s-topic"), doc = null, page2 = false;

  function frameH() {
    var top = f.getBoundingClientRect().top + window.scrollY;
    return Math.max(360, window.innerHeight - top - (page2 ? 0 : 6));
  }
  function fit() {
    if (!document.body.contains(f)) return;
    f.style.height = frameH() + "px";
    if (page2 && doc) fitSections();
  }
  /* scale every section so its content fits one frame; sections keep the
     frame's real height so the snap points stay one screen apart */
  function fitSections() {
    var H = frameH();
    $$(".snap section", doc).forEach(function (sec) {
      sec.style.zoom = "1"; sec.style.minHeight = "0";
      var pad = parseFloat(getComputedStyle(sec).paddingTop) + parseFloat(getComputedStyle(sec).paddingBottom);
      var content = 0;
      Array.prototype.forEach.call(sec.children, function (ch) {
        if (getComputedStyle(ch).position !== "absolute") content += ch.getBoundingClientRect().height;
      });
      content += pad + 12;
      var z = Math.min(1, H / content);
      sec.style.zoom = z.toFixed(3);
      sec.style.minHeight = Math.round(H / z) + "px";
    });
  }
  function setPage(p2) {
    if (page2 === p2) return;
    page2 = p2;
    topic.classList.toggle("sim-full", p2);
    var home = $("#s-sim-home");
    if (home) home.hidden = !p2;
    fit();
  }
  fit();
  window.addEventListener("resize", fit);
  if (window.visualViewport) window.visualViewport.addEventListener("resize", fit);
  /* belt and braces: some embedders change the viewport without any resize
     event, so the size is also polled while this page is open */
  var lastVp = "";
  var poll = setInterval(function () {
    if (!document.body.contains(f)) { clearInterval(poll); return; }
    var vp = window.innerWidth + "x" + window.innerHeight;
    if (vp !== lastVp) { lastVp = vp; fit(); }
  }, 400);
  f.addEventListener("load", function () {
    fit();
    try {
      doc = f.contentDocument;
      if (!doc) return;
      var st = doc.createElement("style");
      st.textContent = SIM_CSS;
      doc.head.appendChild(st);
      /* the disclaimer band: the method line leads in bold, the "no promise"
         line steps back — injected so BI's monthly rebuild keeps working */
      $$(".warnband", doc).forEach(function (w) {
        var span = w.querySelector("span:last-child");
        if (span) span.innerHTML =
          "<b>Benzer mekanların gerçekleşen verisinden hesaplanır.</b> " +
          '<span style="font-weight:400">Sonuçlar mekanın profiline eklediği ' +
          "<u>fotoğraf kalitesi, kampanya çıkıp çıkmadığı, kendisine ulaşan çiftlere " +
          "ne kadar sürede geri döndüğü</u> gibi çeşitli metriklere göre değişir.</span>" +
          "<small>Tüm rakamlar tahmini ortalamalardır — taahhüt değildir.</small>";
      });
      /* wording: the venue never hears "simülasyon" */
      var sub1 = doc.querySelector("#page1 .sub");
      if (sub1) sub1.textContent = "Görüşeceğin mekanın bilgilerini seç, incelemeye başla.";
      $$("#page1 .gobtn", doc).forEach(function (b) {
        if (b.textContent.indexOf("Simülasyona geç") >= 0) b.textContent = "İncele →";
      });
      /* "Simülasyon: Winner 4X" -> "Paket: Winner 4X  [Değiştir]" — their code
         rewrites the line on every code entry, so keep re-applying */
      var line = doc.getElementById("simNameLine");
      if (line) {
        var fixing = false;
        var fixLine = function () {
          if (fixing) return;
          fixing = true;
          var t = line.textContent.replace(/\s*Değiştir\s*$/, "");
          if (t.indexOf("Simülasyon:") === 0) t = "Paket:" + t.slice("Simülasyon:".length);
          line.innerHTML = esc(t) + ' <button id="yss-change" style="border:0;background:none;' +
            'color:var(--pink,#E21B71);text-decoration:underline;cursor:pointer;font:inherit;' +
            'font-size:12px;font-weight:700;padding:0 0 0 6px">Değiştir</button>';
          var ch = doc.getElementById("yss-change");
          if (ch) ch.onclick = function () { doc.defaultView.showPage(0); };
          fixing = false;
        };
        fixLine();
        new doc.defaultView.MutationObserver(function () {
          if (!fixing && line.textContent.indexOf("Simülasyon:") === 0) fixLine();
        }).observe(line, { childList: true, characterData: true, subtree: true });
      }
      /* the simulator flips page1/page2 by inline display — watch for it */
      var p2 = doc.getElementById("page2");
      new doc.defaultView.MutationObserver(function () {
        setPage(p2.style.display !== "none");
      }).observe(p2, { attributes: true, attributeFilter: ["style"] });
      setPage(p2.style.display !== "none");
      /* dots: scroll to the section's real top (zoom makes the simulator's
         own offsetTop arithmetic land short) */
      var snap = doc.getElementById("snap");
      $$("#dotsNav button", doc).forEach(function (b) {
        b.addEventListener("click", function (ev) {
          ev.stopImmediatePropagation(); ev.preventDefault();
          var sec = doc.getElementById(b.dataset.s);
          if (!sec) return;
          /* assignment, not scrollTo(): the container's own
             scroll-behavior:smooth animates it, and the options form is
             ignored by some engines when snap + smooth are both on */
          snap.scrollTop = snap.scrollTop + sec.getBoundingClientRect().top -
            snap.getBoundingClientRect().top;
        }, true);
      });
    } catch (e) { /* cross-origin frame — the simulator keeps its header */ }
  });
};

/* --------------------------------------------------------------- 5. Rakip */
/* Two cards, one selection. Card 1 walks from the official marriage count to
   the couples on Düğün.com (the static 2025 share, floored at 66%) to the
   couples who picked this category. Card 2 is two three-step funnels —
   Türkiye → il → il+kategori — one for provider-page sessions, one for offers.
   "Son 1 ay" everywhere is the LAST COMPLETED calendar month (a month counts
   as completed on its last day); "Son 1 yıl" is the trailing 365 days. */
var TR_AY = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos",
  "Eylül", "Ekim", "Kasım", "Aralık"];
function completedYM() {
  var t = new Date();
  var tomorrow = new Date(t.getFullYear(), t.getMonth(), t.getDate() + 1);
  var y = t.getFullYear(), m = t.getMonth() + 1;          /* 1-based */
  if (tomorrow.getMonth() === t.getMonth()) {             /* not the last day */
    m -= 1;
    if (m === 0) { y -= 1; m = 12; }
  }
  var ym = y + "-" + (m < 10 ? "0" : "") + m;
  /* never point at a month the data does not have yet */
  var avail = (MKT.months || []).filter(function (k) { return k <= ym; });
  return avail.length ? avail[avail.length - 1] : ym;
}
function ymLabel(ym) {
  var p = ym.split("-");
  return TR_AY[+p[1] - 1] + " " + p[0];
}

var regionState = { city: "İstanbul", cat: "Kır Düğünü", win: "y1", period: "y" };

PAGES.rakip = function (el) {
  var R = S.rakip;
  var cities = ["Türkiye"].concat(cityList(REG.cities));
  el.innerHTML =
    '<div class="panel"><h2>' + esc(R.marketTitle) + "</h2><p>" + esc(R.marketLead) + "</p>" +
    '<div class="grid g3" style="margin-top:16px">' +
    "<div><label class='fld'>Şehir</label><select id='rg-city'>" +
    cities.map(function (c) {
      return "<option" + (c === regionState.city ? " selected" : "") + ">" + esc(c) + "</option>";
    }).join("") + "</select></div>" +
    "<div><label class='fld'>Kategori</label><select id='rg-cat'></select></div>" +
    "<div><label class='fld'>Dönem</label>" +
    sel("rg-period", [{ v: "y", t: MKT.year || "2026" },
                      { v: "m", t: "Son 1 ay" }], regionState.period) + "</div></div>" +
    '<div id="rg-market" style="margin-top:20px"></div></div>' +
    '<div class="panel ask"><div class="ask-ic">' +
    '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M4 5h16v10H9l-5 4V5z"/><path d="M9 10h.01M12 10h.01M15 10h.01"/></svg></div>' +
    "<div><h3>" + esc(S.instagram.askTitle) + "</h3><p style='margin:0'>" + esc(S.instagram.askText) + "</p></div></div>" +
    '<div class="panel"><h2>' + esc(R.title) + "</h2><p>" + esc(R.lead) + "</p>" +
    "<div class='grid g3' style='margin-top:14px'><div><label class='fld'>Dönem</label>" +
    sel("rg-win", [{ v: "w1", t: "Son 1 hafta" }, { v: "w2", t: "Son 15 gün" },
                   { v: "m1", t: "Son 1 ay" }, { v: "y1", t: "Son 1 yıl" }], regionState.win) +
    "</div></div>" +
    '<div id="rg-out" style="margin-top:20px"></div></div>';
  bindRegion();
};

function regionCats(city) {
  if (city === "Türkiye") {
    return catList(REG.categories).filter(function (c) { return MKT.seg && MKT.seg["Türkiye|" + c]; });
  }
  return catList(REG.categories).filter(function (c) { return REG.data[city + "|" + c]; });
}
/* Turkish locative suffix for the punch lines (İzmir'de, İstanbul'da, Türkiye'de) */
function locDa(city) {
  var last = "", i;
  for (i = city.length - 1; i >= 0; i--) {
    if ("aeıioöuüAEIİOÖUÜ".indexOf(city.charAt(i)) >= 0) { last = city.charAt(i).toLocaleLowerCase("tr"); break; }
  }
  return city + ("eiöü".indexOf(last) >= 0 ? "'de" : "'da");
}
function bindRegion() {
  function fillCats() {
    var cats = regionCats(regionState.city);
    if (cats.indexOf(regionState.cat) < 0) regionState.cat = cats[0] || "";
    $("#rg-cat").innerHTML = cats.map(function (c) {
      return "<option" + (c === regionState.cat ? " selected" : "") + ">" + esc(c) + "</option>";
    }).join("");
  }
  fillCats();
  $("#rg-city").addEventListener("change", function () {
    regionState.city = this.value; fillCats(); drawMarket(); drawRegion();
  });
  /* a category change touches only the category box: the marriage and
     Düğün.com figures are per city and must not re-animate as if they moved */
  $("#rg-cat").addEventListener("change", function () {
    regionState.cat = this.value; drawMarket(true); drawRegion(); });
  bindSel("rg-period", function (v) { regionState.period = v; drawMarket(); });
  bindSel("rg-win", function (v) { regionState.win = v; drawRegion(); });
  drawMarket();
  drawRegion();
}

function drawMarket(catOnly) {
  var out = $("#rg-market");
  var city = MKT.city && MKT.city[regionState.city];
  var seg = MKT.seg && MKT.seg[regionState.city + "|" + regionState.cat];
  if (!city) { out.innerHTML = "<p style='color:var(--mute)'>Bu şehir için evlilik verisi yok.</p>"; return; }
  var monthly = regionState.period === "m";
  var cym = completedYM();
  var label = monthly ? ymLabel(cym) : MKT.year;
  var marriages = monthly ? (city.marriagesM[cym] || 0) : city.marriagesY;
  /* one static share per city: couples with a 2025 wedding ÷ official 2025
     marriages, floored at 66% */
  var share = city.share, floored = city.shareRaw < MKT.minShare;
  var onDc = Math.round(marriages * share);
  var catCouples = monthly
    ? ((seg && seg.couplesLeadM[cym]) || 0)
    : ((seg && seg.couplesY) || 0);
  var catBox = '<div class="v num" data-count="' + catCouples + '">0</div>' +
    "<div class='l'>çift " + esc(regionState.cat.toLocaleLowerCase("tr")) + " tercih etti</div>";
  var punch = esc(locDa(regionState.city)) + " " + esc(label) + " döneminde <b>" + n(marriages) +
    "</b> evlilik var; bunların <b>" + n(onDc) + "</b> tanesi mekanını Düğün.com'da buldu. " +
    (catCouples ? "<b>" + n(catCouples) + "</b> çift " +
     esc(regionState.cat.toLocaleLowerCase("tr")) + " tercih etti." : "");
  if (catOnly && $("#rg-catbox")) {
    $("#rg-catbox").innerHTML = catBox;
    $("#rg-punch").innerHTML = punch;
    countUp($("#rg-catbox"));
    return;
  }
  out.innerHTML = '<div class="funnel3">' +
    '<div class="f3"><div class="v num" data-count="' + marriages + '">0</div>' +
    "<div class='l'>Evlilik Oldu</div></div>" +
    '<div class="f3-arrow">→</div>' +
    '<div class="f3 hi"><div class="v num" data-count="' + onDc + '">0</div>' +
    "<div class='l'>Çift mekanını Düğün.com'da buldu</div></div>" +
    '<div class="f3-arrow">→</div>' +
    '<div class="f3" id="rg-catbox">' + catBox + "</div></div>" +
    '<div class="punch" id="rg-punch" style="margin-top:18px">' + punch + "</div>" +
    '<div class="note">' + esc(S.rakip.marriageNote) + "</div>";
  countUp(out);
}

/* card 2: the two funnels */
function winVal(block, win, cym) {
  if (!block) return 0;
  if (win === "m1") return (block.m && block.m[cym]) || 0;
  return block[win] || 0;
}
function drawRegion() {
  var out = $("#rg-out");
  var isTR = regionState.city === "Türkiye";
  var key = regionState.city + "|" + regionState.cat;
  var seg = MKT.seg && MKT.seg[key];
  var cityT = MKT.cityTot && MKT.cityTot[regionState.city];
  if (!seg || !MKT.tr || (!isTR && !cityT)) {
    out.innerHTML = "<p style='color:var(--mute)'>Bu şehir ve kategori için veri yok.</p>"; return;
  }
  var cym = completedYM();
  var winLabel = { w1: "son 1 hafta", w2: "son 15 gün", m1: ymLabel(cym), y1: "son 1 yıl" }[regionState.win];

  function funnel(title, metric) {
    var trV = winVal(MKT.tr[metric], regionState.win, cym);
    var sgV = winVal(seg[metric], regionState.win, cym);
    /* Türkiye view: the middle (city) step has nothing to say — a dash card */
    var mid = isTR
      ? '<div class="f3"><div class="v">—</div><div class="l">il seçilmedi</div></div>'
      : '<div class="f3"><div class="v num" data-count="' +
        winVal(cityT[metric], regionState.win, cym) + '">0</div>' +
        "<div class='l'>" + esc(regionState.city) + "</div></div>";
    return "<h3 style='margin:18px 0 10px'>" + esc(title) + "</h3>" +
      '<div class="funnel3">' +
      '<div class="f3"><div class="v num" data-count="' + trV + '">0</div>' +
      "<div class='l'>Tüm Türkiye</div></div>" +
      '<div class="f3-arrow">→</div>' + mid +
      '<div class="f3-arrow">→</div>' +
      '<div class="f3 hi"><div class="v num" data-count="' + sgV + '">0</div>' +
      "<div class='l'>" + esc(regionState.city) + " · " + esc(regionState.cat) +
      "</div><div class='s'>" + esc(winLabel) + "</div></div></div>";
  }

  out.innerHTML = funnel("Düğün.com trafiği", "sessions") +
    funnel("Çiftler kaç farklı firma ile iletişime geçti", "offers") +
    '<div class="punch" style="margin-top:18px">' + esc(regionState.city) + " · " +
    esc(regionState.cat) + " segmentinde <b>" + esc(winLabel) + "</b> döneminde <b>" +
    n(winVal(seg.sessions, regionState.win, cym)) + "</b> Düğün.com ziyareti oldu, çiftler <b>" +
    n(winVal(seg.offers, regionState.win, cym)) + "</b> firmayla iletişime geçti.</div>";
  countUp(out);
}
function stat(v, l, s, money) {
  return '<div class="stat"><div class="v num" data-count="' + Math.round(v) + '"' +
    (money ? ' data-money="1"' : "") + '>0</div><div class="l">' + esc(l) +
    "</div>" + (s ? '<div class="s">' + esc(s) + "</div>" : "") + "</div>";
}

/* --------------------------------------------------------------- 7. Boş gün */
/* A month on screen instead of a paragraph: Saturdays sold, everything else
   quiet; flip the switch and the weekdays and Sundays that Özel Fiyat reaches
   light up one by one. The pattern is illustrative, the count is the point. */
var FACT_ICONS = ["radar", "calendar", "trend", "headset", "check"];
function calendarDemo(CAL) {
  var days = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
  /* 4 weeks; Saturdays (index 5) booked; Özel Fiyat fills a believable spread
     of weekdays and Sundays */
  var filled = { 5: 1, 12: 1, 19: 1, 26: 1 };
  var extra = [1, 6, 9, 13, 15, 20, 22, 27];
  var cells = "";
  for (var i = 0; i < 28; i++) {
    cells += '<div class="day' + (filled[i] ? " full" : "") + '" data-i="' + i +
      (extra.indexOf(i) >= 0 ? '" data-new="1' : "") + '">' + (i + 1) + "</div>";
  }
  return '<div class="panel"><h2>' + esc(CAL.t) + "</h2><p>" + esc(CAL.d) + "</p>" +
    '<div class="cal-toggle"><button class="chip" data-v="off" aria-pressed="true">' + esc(CAL.off) +
    '</button><button class="chip" data-v="on" aria-pressed="false">' + esc(CAL.on) + "</button></div>" +
    '<div class="cal-wrap"><div class="cal-head">' + days.map(function (d) { return "<span>" + d + "</span>"; }).join("") +
    '</div><div class="cal" id="cal">' + cells + "</div>" +
    '<div class="cal-legend"><span><i style="background:var(--pink)"></i>' + esc(CAL.legendFull) +
    '</span><span><i style="background:#fff;border:1px solid var(--line)"></i>' + esc(CAL.legendEmpty) +
    '</span><span><i style="background:var(--green)"></i>' + esc(CAL.legendNew) + "</span></div>" +
    '<div class="cal-count"><span class="v" id="cal-n">4</span><span class="l" id="cal-l">gün satıldı / 28</span></div>' +
    '<div class="punch" id="cal-punch" style="margin-top:14px">' + CAL.punchOff + "</div></div></div>";
}
function bindCalendar(CAL) {
  var cal = $("#cal"); if (!cal) return;
  var news = $$(".day[data-new]", cal);
  $$(".cal-toggle .chip").forEach(function (b) {
    b.addEventListener("click", function () {
      $$(".cal-toggle .chip").forEach(function (o) { o.setAttribute("aria-pressed", o === b); });
      var on = b.dataset.v === "on";
      news.forEach(function (d, k) {
        setTimeout(function () { d.classList.toggle("new", on); }, on ? 90 * k : 0);
      });
      var total = 4 + (on ? news.length : 0);
      setTimeout(function () {
        $("#cal-n").textContent = total;
        $("#cal-punch").innerHTML = on ? CAL.punchOn : CAL.punchOff;
      }, on ? 90 * news.length : 0);
    });
  });
}

/* Three screens, one snap scrollbar — the same rhythm as the simulator:
   1) the cost of an empty day + pricing power (both calculators start EMPTY,
      the venue owner's own numbers drive them), 2) the Özel Fiyat card with
   its facts and measured benefit, 3) the ad films. */
var FACT_ICONS = ["radar", "calendar", "headset", "check"];

PAGES.bosgun = function (el) {
  var B = S.bosgun, OF = STORY.ozelFiyat || { providers365: 0 };

  var info = B.facts.filter(function (f) { return !f.count; });

  var sec1 =
    '<h2 class="bg-sec">' + esc(B.sec1) + "</h2>" +
    '<p class="snap-lead">' + esc(B.lead) + "</p>" +
    '<div class="panel loss"><h2>' + esc(B.loss.t) + "</h2><p>" + esc(B.loss.d) + "</p>" +
    '<div class="grid g3" style="margin-top:10px;align-items:end">' +
    "<div><label class='fld'>" + esc(B.loss.days) + "</label>" +
    "<input type='number' id='bg-days' placeholder='örn. 20' min='0' step='1'></div>" +
    "<div><label class='fld'>" + esc(B.loss.value) + "</label>" + tlInput("bg-value", "örn. 350.000") + "</div>" +
    '<div class="loss-out"><div class="v num" id="bg-sum">—</div><div class="l">' +
    esc(B.loss.out) + "</div></div></div>" +
    '<div class="punch" id="bg-punch" hidden style="margin-top:12px"></div></div>' +
    '<div class="panel"><h2>' + esc(B.power.t) + "</h2><p>" + esc(B.power.d) + "</p>" +
    '<div class="grid g4" style="margin-top:10px;align-items:end">' +
    "<div><label class='fld'>" + esc(B.power.calc.days) + "</label>" +
    "<input type='number' id='pw-days' placeholder='örn. 40' min='0' step='1'></div>" +
    "<div><label class='fld'>" + esc(B.power.calc.value) + "</label>" + tlInput("pw-value", "örn. 350.000") + "</div>" +
    "<div><label class='fld'>" + esc(B.power.calc.pct) + "</label>" +
    sel("pw-pct", [{ v: "5", t: "%5" }, { v: "10", t: "%10" }, { v: "15", t: "%15" }], "10") + "</div>" +
    '<div class="loss-out"><div class="v num" id="pw-sum">—</div><div class="l">' +
    esc(B.power.calc.out) + "</div></div></div>" +
    '<div class="punch" style="margin-top:12px">' + esc(B.power.punch) + "</div></div>";

  var sec2 =
    '<h2 class="bg-sec">' + esc(B.sec2) + "</h2>" +
    '<div class="panel tint"><p style="margin:0">' + esc(B.joker.d) + "</p></div>" +
    '<div class="grid g4 facts">' + info.map(function (f, i) {
      return '<div class="stat"><div class="fi">' + icon(FACT_ICONS[i % FACT_ICONS.length], 22) + "</div>" +
        '<div class="v">' + esc(f.v) + '</div><div class="l">' + esc(f.l) +
        '</div><div class="s">' + esc(f.d) + "</div></div>";
    }).join("") + "</div>" +
    '<div class="panel cmp" style="margin-top:12px"><h3>' + esc(B.cmp.t) + "</h3><p>" + esc(B.cmp.d) + "</p>" +
    '<div class="cal-count" style="margin:4px 0 8px"><span class="v num" data-count="' + (OF.providers365 || 0) +
    '">0</span><span class="l">' + esc(B.cmp.count) + "</span></div>" +
    '<div class="cmp-out">' + B.cmp.stats.map(function (st) {
      return '<div><div class="v">' + esc(st.v) + '</div><div class="l">' + esc(st.l) +
        (st.s ? '</div><div class="l" style="color:var(--mute-2)">' + esc(st.s) : "") + "</div></div>";
    }).join("") + "</div></div>";

  var sec3 =
    '<h2 class="bg-sec">' + esc(B.adsTitle) + "</h2>" +
    '<div class="panel"><p style="margin:0 0 8px">' + esc(B.adsLead) + "</p>" +
    '<div class="grid g2" style="margin-top:12px">' +
    B.ads.map(function (a) {
      return '<div><div class="vid portrait"><video src="' + a.f + '" controls ' +
        'preload="metadata" playsinline></video></div>' +
        '<div class="vid-cap" style="text-align:center">' + esc(a.t) + "</div></div>";
    }).join("") + "</div></div>";

  /* normal page flow — no snapping. The tight sizing exists so each of the
     three blocks fits one screen on its own as you scroll to it. */
  el.innerHTML = '<div class="bg-tight">' + sec1 + sec2 + sec3 + "</div>";

  function lossCalc() {
    var days = Math.max(0, +$("#bg-days").value || 0);
    var val = tlVal("bg-value");
    var ok = days > 0 && val > 0;
    $("#bg-sum").textContent = ok ? tl(days * val) : "—";
    $("#bg-punch").hidden = !ok;
    if (ok) $("#bg-punch").innerHTML = B.loss.punch.replace("{sum}", tl(days * val));
  }
  $("#bg-days").addEventListener("input", lossCalc);
  bindTl("bg-value", lossCalc);

  function powerCalc() {
    var days = Math.max(0, +$("#pw-days").value || 0);
    var val = tlVal("pw-value");
    var pct = +($("#pw-pct").value || 10);
    var ok = days > 0 && val > 0;
    $("#pw-sum").textContent = ok ? tl(days * val * pct / 100) : "—";
  }
  $("#pw-days").addEventListener("input", powerCalc);
  bindTl("pw-value", powerCalc);
  bindSel("pw-pct", powerCalc);
  countUp(el);
};

function dateTr(iso) {
  var p = String(iso || "").split("-");
  return p.length === 3 ? p[2] + "." + p[1] + "." + p[0] : iso || "";
}

/* ---------------------------------------------------------------- 8. Hikâye */
/* Three sections, one category filter. Section 1 is the presenter's own
   strongest sales (matched by name tokens to the Qlik seller), section 2 the
   rest of their team's, section 3 the success-story films. A non-sales user
   picks a team instead. Cards are anonymous by design: category, place, package,
   start month and the listing's real numbers — never the name, never a deal
   count. */
var storyState = { cat: "*", team: "MoS", open: { mine: true, others: false, stories: false },
  shown: { mine: 2, others: 2 }, order: {} };
var STORY_STEP = 2, STORY_MAX = 6;
/* stable-per-visit random order over the qualifying (top-30%) pool */
function storyOrder(key, ids) {
  if (!storyState.order[key] || storyState.order[key].base !== ids.join(",")) {
    storyState.order[key] = { base: ids.join(","), ids: shuffle(ids) };
  }
  return storyState.order[key].ids;
}

function findMaker(user) {
  var ut = CFG.fold(user.name).split(" ").filter(function (t) { return t.length > 1; });
  var best = null;
  Object.keys(STORY.makers || {}).forEach(function (k) {
    var m = STORY.makers[k];
    if (!m.tokens.length) return;
    var ok = m.tokens.every(function (t) { return ut.indexOf(t) >= 0; });
    if (ok && (!best || m.tokens.length > best.tokens.length)) best = m;
  });
  return best;
}
function teamPool(team, cat, exclude) {
  var block = (STORY.teams || {})[team] || {};
  var list = block[cat] || [];
  var out = [];
  list.forEach(function (pair) {
    if (exclude && pair[1] === exclude) return;
    if (out.indexOf(pair[0]) < 0) out.push(pair[0]);
  });
  return out;
}
function providerCard(pid, i) {
  var p = (STORY.providers || {})[pid];
  if (!p) return "";
  function m(v, l, f) {
    return '<div class="pm"><div class="pv">' + (v == null ? "—" : f(v)) + '</div><div class="pl">' + esc(l) + "</div></div>";
  }
  return '<div class="pcard"><div class="ph"><span class="pno">' + (i + 1) + "</span>" +
    "<div>" + (p.name ? '<span class="pname" aria-hidden="true">' + esc(p.name) + "</span>" : "") +
    "<b>" + esc(p.cat) + "</b><span>" + esc(p.city) + (p.d ? " / " + esc(p.d) : "") +
    " · " + esc(p.product || "") + (p.started ? " · başlangıç " + esc(p.started) : "") + "</span></div></div>" +
    '<div class="pgrid">' +
    m(p.pvPm, "aylık ortalama sayfa görüntüleme", n) +
    m(p.leadsPm, "aylık ortalama iletişime geçen çift", function (v) { return n(v, 1); }) +
    m(p.igPm, "aylık ortalama Instagram'a geçiş", n) +
    m(p.rr, "dönüş oranı", function (v) { return pct(v, 0); }) +
    m(p.in1h, "1 saat içinde dönüş", function (v) { return pct(v, 0); }) +
    m(p.avgH, "tipik dönüş süresi", function (v) {
      return v < 1 ? n(Math.round(v * 60)) + " dk" : n(v, 1) + " sa"; }) +
    m(p.gallery, "galeri sayısı", n) +
    m(p.reviews, "yorum sayısı", n) +
    m(p.campaigns, "aktif kampanya sayısı", n) +
    "</div></div>";
}
function pickVideos(cat) {
  var vids = STORY.videos || [], out = [];
  if (cat && cat !== "*") {
    var pool = vids.filter(function (v) { return v.cat === cat; });
    pool = pool.slice().sort(function () { return Math.random() - .5; });
    out = pool.slice(0, 2);
  }
  if (!out.length) {
    var collage = vids.filter(function (v) { return v.id === STORY.collage; })[0];
    var venueCats = ["Kır Düğünü", "Düğün Salonları", "Balo ve Davet Salonları"];
    var latest = vids.filter(function (v) { return venueCats.indexOf(v.cat) >= 0; })
      .sort(function (a, b) { return (b.pub || "").localeCompare(a.pub || ""); })[0];
    out = [collage, latest].filter(Boolean);
  }
  if (out.length < 2) {
    vids.forEach(function (v) { if (out.length < 2 && out.indexOf(v) < 0) out.push(v); });
  }
  return out;
}

PAGES.hikaye = function (el) {
  var H = S.hikaye, user = currentUser();
  var maker = user.isSales ? findMaker(user) : null;
  var cats = ["*"].concat(STORY.cats || []);

  function section(key, title, desc, bodyId) {
    var open = storyState.open[key];
    return '<div class="acc' + (open ? " open" : "") + '" data-key="' + key + '">' +
      '<button class="acc-h" type="button"><span class="acc-t">' + esc(title) + "</span>" +
      '<span class="acc-ic">' + (open ? "−" : "+") + "</span></button>" +
      '<div class="acc-b"' + (open ? "" : " hidden") + '><p class="acc-d">' + esc(desc) + "</p>" +
      '<div id="' + bodyId + '"></div></div></div>';
  }

  el.innerHTML =
    "<div class='grid g3 st-bar'><div><label class='fld'>" + esc(H.catLabel) + "</label>" +
    sel("st-cat", cats.map(function (c) { return { v: c, t: c === "*" ? H.allCats : c }; }), storyState.cat) +
    "</div></div>" +
    section("mine", H.mine.t, H.mine.d, "st-mine") +
    section("others", H.others.t, user.isSales ? H.others.d : H.others.dAll, "st-others") +
    section("stories", H.stories.t, H.stories.d, "st-stories") +
    '<div class="note">' + esc(H.metricNote) + "</div>";

  bindSel("st-cat", function (v) {
    storyState.cat = v;
    storyState.shown = { mine: STORY_STEP, others: STORY_STEP };
    drawStory(user, maker);
  });
  $$(".acc-h", el).forEach(function (b) {
    b.addEventListener("click", function () {
      var acc = b.parentNode, key = acc.dataset.key, body = $(".acc-b", acc);
      var open = body.hidden;
      body.hidden = !open;
      acc.classList.toggle("open", open);
      $(".acc-ic", b).textContent = open ? "−" : "+";
      storyState.open[key] = open;
    });
  });
  drawStory(user, maker);
};

function drawStory(user, maker) {
  var H = S.hikaye, cat = storyState.cat;
  var mineEl = $("#st-mine"), othersEl = $("#st-others"), storiesEl = $("#st-stories");
  /* the pool is the top-30% band; show a shuffled slice, "Daha fazla göster"
     grows it two at a time up to six */
  function paged(key, ids, section) {
    var ordered = storyOrder(key, ids);
    var count = Math.min(storyState.shown[section] || STORY_STEP, STORY_MAX, ordered.length);
    var slice = ordered.slice(0, count);
    var more = ordered.length > count && count < STORY_MAX;
    return '<div class="grid g2 pcards">' + slice.map(providerCard).join("") + "</div>" +
      (more ? '<button class="st-more" data-sec="' + section + '">' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
        'stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>' +
        esc(H.others.more || "Daha fazla göster") + "</button>" : "");
  }
  function bindMore() {
    $$(".st-more", $("#s-topic-body")).forEach(function (b) {
      b.addEventListener("click", function () {
        var sec = b.dataset.sec;
        storyState.shown[sec] = Math.min(STORY_MAX, (storyState.shown[sec] || STORY_STEP) + STORY_STEP);
        drawStory(user, maker);
      });
    });
  }

  /* 1 — mine. A sales user only gets this section when they have at least two
     qualifying pages overall (>=1 completed month, at or above the overall
     average) — otherwise the whole accordion stays hidden. */
  var mineAcc = $('.acc[data-key="mine"]');
  if (user.isSales) {
    var allMine = maker ? (maker.ex["*"] || []) : [];
    if (allMine.length < 2) {
      if (mineAcc) mineAcc.style.display = "none";
      mineEl.innerHTML = "";
    } else {
      if (mineAcc) mineAcc.style.display = "";
      var ids = maker.ex[cat] || [];
      mineEl.innerHTML = ids.length
        ? paged("mine-" + maker.name, ids, "mine")
        : '<div class="note" style="margin:0">' + esc(H.mine.empty) + "</div>";
    }
  } else {
    mineEl.innerHTML = "<div class='grid g3'><div><label class='fld'>" + esc(H.mine.teamPick) + "</label>" +
      sel("st-team", [{ v: "MoS", t: "Yeni Satış" }, { v: "SAS", t: "Yenileme" }], storyState.team) + "</div></div>" +
      '<div id="st-team-cards" style="margin-top:14px">' +
      paged("team-" + storyState.team, teamPool(storyState.team, cat, null), "mine") + "</div>";
    bindSel("st-team", function (v) {
      storyState.team = v;
      storyState.shown.mine = STORY_STEP;
      drawStory(user, maker);
    });
  }

  /* 2 — "Düğün.com firmaları": everything we sold, the viewer's own included */
  var pool2 = user.isSales
    ? teamPool(user.team === "MoS" || user.team === "SAS" ? user.team : "ALL", cat, null)
    : teamPool("ALL", cat, null);
  othersEl.innerHTML = pool2.length
    ? paged("others", pool2, "others")
    : '<div class="note" style="margin:0">Bu kategoride örnek bulunamadı.</div>';
  bindMore();

  /* 3 — the films */
  var vids = pickVideos(cat);
  storiesEl.innerHTML = '<div class="grid g2">' + vids.map(function (v) {
      return '<div><div class="vid"><iframe src="https://www.youtube.com/embed/' + v.id +
        '" title="' + esc(v.venue) + '" allow="accelerometer; clipboard-write; encrypted-media; ' +
        'picture-in-picture" allowfullscreen loading="lazy"></iframe></div>' +
        '<div class="vid-cap"><b>' + esc(v.venue) + "</b>" + esc(v.t) +
        (v.cat && v.cat !== "*" ? " · " + esc(v.cat) : "") + "</div></div>";
    }).join("") + "</div>" +
    '<div class="chips" style="margin-top:16px">' +
    '<a class="btn ghost" target="_blank" rel="noopener" href="' + H.stories.links.stories + '">Başarı hikâyeleri ↗</a>' +
    '<a class="btn ghost" target="_blank" rel="noopener" href="' + H.stories.links.playlist + '">YouTube oynatma listesi ↗</a></div>';
}

/* ==================================================================== map */
/* Two sources, same event shape. data/livemap.js is generated from real
   providers and real weekly demand and ships with the panel; a published sheet
   in APP_CONFIG.liveSheetCsv replaces it at run time when one exists. Either
   way the block is labelled as the trailing week, never as live. */
var mapTimer = null;

var MAP = (function () {
  var L = window.LIVEMAP || {};
  return {
    labels: L.labels || {},
    events: L.events || [],
    totals: L.totals || {},
    catsAgg: L.cats || {},
    dists: L.dists || {},
    prev: L.prev || {},
    prevCats: L.prevCats || {},
    prevDists: L.prevDists || {},
    cityGroups: L.cityGroups || [],
    catGroups: L.catGroups || []
  };
})();

/* interaction types in their display-priority order */
var MAP_TYPES = ["lead", "wa", "call", "deal", "ig", "yol", "fav", "paylas", "yorum", "site"];
var MAP_ICON = { lead: "✉️", wa: "💬", call: "📞", deal: "🤝", ig: "📸",
  yol: "📍", fav: "❤️", paylas: "🔗", yorum: "⭐", site: "🌐" };

function mapGroupOfCity(city) {
  var f = CFG.fold(city);
  for (var i = 0; i < MAP.cityGroups.length; i++) {
    var g = MAP.cityGroups[i];
    if (CFG.fold(g.label) === f) return g.label;
    for (var j = 0; j < g.cities.length; j++) {
      if (CFG.fold(g.cities[j]) === f) return g.label;
    }
  }
  return "";
}
function mapScopeCities() {
  var v = $("#map-city") ? $("#map-city").value : "";
  if (!v) return null;                                  /* null = all */
  var g = MAP.cityGroups.filter(function (x) { return x.label === v; })[0];
  return g ? g.cities : [v];
}
function mapScopeCats() {
  var v = $("#map-cat") ? $("#map-cat").value : "";
  if (!v) return null;
  var g = MAP.catGroups.filter(function (x) { return x.label === v; })[0];
  return g ? { label: v, cats: g.cats } : null;
}

/* real weekly sums for the selected scope */
function mapScopeTotals() {
  var cities = mapScopeCities();
  var catG = mapScopeCats();
  var list = cities || MAP.cityGroups.reduce(function (a, g) { return a.concat(g.cities); }, []);
  var out = {};
  MAP_TYPES.forEach(function (t) { out[t] = 0; });
  list.forEach(function (c) {
    var src = catG ? MAP.catsAgg[c + "|" + catG.label] : MAP.totals[c];
    if (!src) return;
    MAP_TYPES.forEach(function (t) { out[t] += src[t] || 0; });
  });
  return out;
}

function mapAgo(day) {
  return day === 0 ? "bugün" : day === 1 ? "dün" : day + " gün önce";
}

/* The weekly counts panel that stood here (hero cards + chips) was removed on
   04.09.2026 at Nes's request; mapScopeTotals() stays — the feed header and
   the district popups still read it. */

function drawScopeNotes() {
  var cs = $("#map-city-scope"), ct = $("#map-cat-scope");
  if (cs) {
    var cities = mapScopeCities();
    cs.textContent = (cities && cities.length > 1) ? "Kapsam: " + cities.join(" · ") : "";
  }
  if (ct) {
    var g = mapScopeCats();
    ct.textContent = (g && g.cats.length > 1) ? "Kapsam: " + g.cats.join(" · ") : "";
  }
}

/* --- the optional sheet ------------------------------------------------- */
/* Minimal RFC-4180 parser: the venue names in this feed contain commas, so
   splitting on "," loses half of them. */
function parseCsv(text) {
  var rows = [], row = [], val = "", q = false, i = 0;
  text = String(text).replace(/\r\n?/g, "\n");
  for (; i < text.length; i++) {
    var c = text.charAt(i);
    if (q) {
      if (c === '"') { if (text.charAt(i + 1) === '"') { val += '"'; i++; } else q = false; }
      else val += c;
    } else if (c === '"') q = true;
    else if (c === ",") { row.push(val); val = ""; }
    else if (c === "\n") { row.push(val); rows.push(row); row = []; val = ""; }
    else val += c;
  }
  if (val !== "" || row.length) { row.push(val); rows.push(row); }
  return rows.filter(function (r) { return r.join("").trim() !== ""; });
}

/* Header names are matched folded, so the sheet can be typed however is
   natural: "Şehir" / "sehir" / "İl" all land on the same field. */
var SHEET_COLS = {
  city: ["sehir", "il"], d: ["ilce", "semt"], name: ["firma", "firma adi", "mekan"],
  cat: ["kategori"], img: ["kapak gorseli", "kapak", "gorsel", "resim"],
  t: ["tip", "islem"], ago: ["ne zaman", "zaman", "tarih"], couple: ["cift", "cift adi"]
};

function loadMapSheet(onDone) {
  var url = CFG.liveSheetCsv;
  if (!url) return;
  fetch(url, { cache: "no-store" }).then(function (r) { return r.text(); }).then(function (txt) {
    var rows = parseCsv(txt);
    if (rows.length < 2) return;
    var head = rows[0].map(CFG.fold), idx = {};
    Object.keys(SHEET_COLS).forEach(function (k) {
      idx[k] = -1;
      head.forEach(function (h, i) { if (idx[k] < 0 && SHEET_COLS[k].indexOf(h) >= 0) idx[k] = i; });
    });
    if (idx.city < 0 || idx.name < 0) return;

    var out = [];
    rows.slice(1).forEach(function (r) {
      function cell(k) { return idx[k] >= 0 ? String(r[idx[k]] || "").trim() : ""; }
      var e = {
        city: cell("city"), d: cell("d"), name: cell("name"), cat: cell("cat"),
        img: cell("img"), couple: cell("couple"), ago: cell("ago"),
        t: CFG.fold(cell("t")).indexOf("anlas") >= 0 ? "deal" : "lead"
      };
      if (e.city && e.name && CFG.cityAllowed(e.city) && CFG.catAllowed(e.cat)) out.push(e);
    });
    if (out.length) { MAP.events = out; if (onDone) onDone(); }
  })["catch"](function () { /* keep the built-in feed */ });
}

function mapMarkup() {
  var M = C.turkeyMap;
  return '<div class="s-map-wrap"><svg id="s-mapsvg" viewBox="' + M.viewBox + '" preserveAspectRatio="xMidYMid meet">' +
    '<path class="s-land" d="' + M.d + '"/><g id="s-pins"></g><g id="s-dists"></g></svg>' +
    '<div class="s-bubs" id="s-bubs"></div>' +
    '<div class="dist-pop" id="dist-pop" hidden></div></div>';
}
function stopMap() { if (mapTimer) { clearInterval(mapTimer); mapTimer = null; } }

/* everything that reacts to a filter change, in one place */
/* The pulse layer (ticker + notification feed + leaderboard) is still in
   review: it renders only on localhost until Nes approves it for the live
   deck. Flip this to `true` to ship it. */
var MAP_PULSE = /^(localhost|127\.)/.test(location.hostname);
var mapDistFocus = "";           /* district the feed is narrowed to */
function mapRefresh() {
  mapDistFocus = "";
  drawScopeNotes();
  if (MAP_PULSE) { drawTicker(); drawBoard(); }
  startMap();
  startFeed();
}

/* ---------- the pulse ticker: real week-over-week movers ----------------- */
function mapDelta(cur, prevStore, key) {
  var p = prevStore[key];
  var pt = 0;
  if (p) MAP_TYPES.forEach(function (t) { pt += p[t] || 0; });
  if (!pt) return null;
  return Math.round((cur - pt) / pt * 100);
}
function sumAll(s) {
  var v = 0; MAP_TYPES.forEach(function (t) { v += (s && s[t]) || 0; }); return v;
}
function tickerItem(name, cur, d) {
  return '<span class="tk-item">' + esc(name) + " <b>" + n(cur) + "</b>" +
    (d === null ? "" :
      ' <i class="' + (d >= 0 ? "up" : "down") + '">' + (d >= 0 ? "▲" : "▼") +
      "%" + Math.abs(d) + "</i>") + "</span>";
}
function drawTicker() {
  var host = $("#map-ticker");
  if (!host) return;
  var cities = mapScopeCities();
  var list = cities || MAP.cityGroups.reduce(function (a, g) { return a.concat(g.cities); }, []);
  var items = [];
  /* category movers within the scope */
  MAP.catGroups.forEach(function (g) {
    var cur = 0, prevSum = 0;
    list.forEach(function (c) {
      cur += sumAll(MAP.catsAgg[c + "|" + g.label]);
      prevSum += sumAll(MAP.prevCats && MAP.prevCats[c + "|" + g.label]);
    });
    if (!cur) return;
    items.push(tickerItem(g.label, cur,
      prevSum ? Math.round((cur - prevSum) / prevSum * 100) : null));
  });
  /* place movers: districts in single-city view, cities otherwise */
  var single = cities && cities.length === 1 ? cities[0] : "";
  if (single) {
    Object.keys(MAP.dists).forEach(function (k) {
      if (k.split("|")[0] !== single || k.split("|")[1] === "—") return;
      var cur = sumAll(MAP.dists[k]);
      if (cur < 20) return;
      items.push(tickerItem(k.split("|")[1], cur, mapDelta(cur, MAP.prevDists || {}, k)));
    });
  } else {
    list.forEach(function (c) {
      var cur = sumAll(MAP.totals[c]);
      if (!cur) return;
      items.push(tickerItem(c, cur, mapDelta(cur, MAP.prev || {}, c)));
    });
  }
  if (!items.length) { host.innerHTML = ""; return; }
  var strip = items.join('<span class="tk-sep">·</span>');
  host.innerHTML = '<div class="tk-strip"><div class="tk-run">' + strip +
    '<span class="tk-sep">·</span>' + strip + "</div></div>";
}

/* ---------- leaderboard: the week's most active places ------------------- */
function drawBoard() {
  var host = $("#map-board");
  if (!host) return;
  var cities = mapScopeCities();
  var single = cities && cities.length === 1 ? cities[0] : "";
  var rows = [];
  if (single) {
    Object.keys(MAP.dists).forEach(function (k) {
      var p = k.split("|");
      if (p[0] !== single || p[1] === "—") return;
      rows.push({ name: p[1], cur: sumAll(MAP.dists[k]),
                  d: mapDelta(sumAll(MAP.dists[k]), MAP.prevDists || {}, k) });
    });
  } else {
    var list = cities || MAP.cityGroups.reduce(function (a, g) { return a.concat(g.cities); }, []);
    list.forEach(function (c) {
      rows.push({ name: c, cur: sumAll(MAP.totals[c]),
                  d: mapDelta(sumAll(MAP.totals[c]), MAP.prev || {}, c) });
    });
  }
  rows = rows.filter(function (r) { return r.cur > 0; })
             .sort(function (a, b) { return b.cur - a.cur; }).slice(0, 5);
  if (rows.length < 2) { host.innerHTML = ""; return; }
  var medals = ["🥇", "🥈", "🥉", "4", "5"];
  var max = rows[0].cur;
  host.innerHTML = '<div class="board"><h3>Bu haftanın en hareketlileri' +
    (single ? " · " + esc(single) : "") + "</h3>" + rows.map(function (r, i) {
      return '<div class="bd-row"><span class="rank">' + medals[i] + "</span>" +
        "<span class='nm'>" + esc(r.name) + "</span>" +
        '<span class="bar"><i style="width:' + Math.round(r.cur / max * 100) + '%"></i></span>' +
        "<b>" + n(r.cur) + "</b>" +
        (r.d === null ? "<span class='dlt'></span>" :
          '<span class="dlt ' + (r.d >= 0 ? "up" : "down") + '">' +
          (r.d >= 0 ? "▲" : "▼") + "%" + Math.abs(r.d) + "</span>") + "</div>";
    }).join("") + '<div class="bd-note">toplam etkileşim · geçen haftaya göre</div></div>';
}

/* ---------- the notification feed (single-city view) --------------------- */
var feedTimer = null;
function stopFeed() { if (feedTimer) { clearInterval(feedTimer); feedTimer = null; } }
function feedTime(e, i) {
  var h = 9 + (i * 7) % 13, m = (i * 13) % 60;
  var hm = (h < 10 ? "0" : "") + h + ":" + (m < 10 ? "0" : "") + m;
  return mapAgo(e.day || 0) + " " + hm;
}
function feedItemHtml(e, i) {
  var label = MAP.labels[e.t] || "";
  var line = e.couple ? "<b>" + esc(e.couple) + "</b> " + esc(label) : esc(label);
  return '<div class="mf-item"><span class="ic">' + MAP_ICON[e.t] + "</span>" +
    "<div><div class='tx'>" + line + "</div>" +
    "<div class='meta'>" + esc(e.name) + (e.d ? " · " + esc(e.d) : "") +
    " · " + esc(feedTime(e, i)) + "</div></div></div>";
}
function startFeed() {
  stopFeed();
  var panel = $("#map-feed"), listEl = $("#mf-list"), head = $("#mf-head");
  var flex = $("#map-flex");
  if (!panel || !listEl) return;
  var cities = mapScopeCities();
  var single = cities && cities.length === 1 ? cities[0] : "";
  if (!MAP_PULSE || !single) {
    panel.hidden = true;
    if (flex) flex.classList.remove("split");
    return;
  }
  panel.hidden = false;
  if (flex) flex.classList.add("split");
  var catG = mapScopeCats();
  var evs = MAP.events.filter(function (e) {
    return e.city === single &&
      (!catG || catG.cats.indexOf(e.cat) >= 0) &&
      (!mapDistFocus || e.d === mapDistFocus);
  });
  /* week total for the header */
  var tot = mapDistFocus
    ? sumAll(MAP.dists[single + "|" + mapDistFocus])
    : sumAll(mapScopeTotals());
  head.innerHTML = "<b>" + esc(single) + (mapDistFocus ? " · " + esc(mapDistFocus) : "") +
    "</b><span class='cnt'>" + n(tot) + " etkileşim / hafta</span>" +
    (mapDistFocus ? '<button type="button" class="mf-all" id="mf-all">✕ tüm ilçeler</button>' : "");
  var allBtn = $("#mf-all");
  if (allBtn) allBtn.addEventListener("click", function () {
    mapDistFocus = "";
    var pop = $("#dist-pop"); if (pop) pop.hidden = true;
    startFeed();
  });
  listEl.innerHTML = "";
  if (!evs.length) {
    listEl.innerHTML = "<div class='mf-empty'>Bu seçim için akış kaydı yok.</div>";
    return;
  }
  /* newest-looking first: today, then yesterday, ... */
  evs = evs.slice().sort(function (a, b) { return (a.day || 0) - (b.day || 0); });
  var shown = 0, FIRST = 10;
  function add(front) {
    var e = evs[shown % evs.length];
    var div = document.createElement("div");
    div.innerHTML = feedItemHtml(e, shown);
    var node = div.firstChild;
    if (front && listEl.firstChild) {
      node.classList.add("drop");
      listEl.insertBefore(node, listEl.firstChild);
      while (listEl.children.length > 30) listEl.lastChild.remove();
    } else {
      listEl.appendChild(node);
    }
    shown++;
  }
  for (var i = 0; i < Math.min(FIRST, evs.length); i++) add(false);
  feedTimer = setInterval(function () {
    if (!document.body.contains(listEl)) { stopFeed(); return; }
    add(true);
  }, 4200);
}

/* ---- zoom: animate the SVG viewBox to a window around one city ---------- */
var mapZoomAnim = null;
function mapSetView(box) {
  var svg = $("#s-mapsvg");
  if (!svg) return;
  var cur = svg.getAttribute("viewBox").split(" ").map(Number);
  if (mapZoomAnim) cancelAnimationFrame(mapZoomAnim);
  /* rAF is frozen in hidden tabs — land on the target instantly there */
  if (document.hidden) { svg.setAttribute("viewBox", box.join(" ")); return; }
  var t0 = null;
  function step(ts) {
    if (!t0) t0 = ts;
    var k = Math.min(1, (ts - t0) / 480);
    k = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;   /* easeInOut */
    svg.setAttribute("viewBox", cur.map(function (v, i) {
      return (v + (box[i] - v) * k).toFixed(1);
    }).join(" "));
    if (k < 1) mapZoomAnim = requestAnimationFrame(step);
  }
  mapZoomAnim = requestAnimationFrame(step);
}

/* the district cloud around a zoomed city: real weekly totals per district,
   laid out on a deterministic spiral (positions are presentational — district
   coordinates are not geographic) */
function drawDistricts(city, zoomW, box) {
  var M = C.turkeyMap, g = $("#s-dists"), pop = $("#dist-pop");
  if (!g) return;
  g.innerHTML = "";
  if (pop) pop.hidden = true;
  if (!city) return;
  var p = M.cities[city];
  if (!p) return;
  var catG = mapScopeCats();
  var rows = [];
  Object.keys(MAP.dists).forEach(function (k) {
    var parts = k.split("|");
    if (parts[0] !== city || parts[1] === "—") return;
    var s = MAP.dists[k], tot = 0;
    MAP_TYPES.forEach(function (t) { tot += s[t] || 0; });
    if (tot > 0) rows.push({ d: parts[1], s: s, tot: tot });
  });
  rows.sort(function (a, b) { return b.tot - a.tot; });
  rows = rows.slice(0, 14);
  if (!rows.length) return;
  var max = rows[0].tot;
  rows.forEach(function (r, i) {
    /* golden-angle spiral around the city point, scaled to the zoom window */
    var ang = i * 2.39996, rad = zoomW * (0.055 + 0.028 * Math.sqrt(i));
    var x = p[0] + Math.cos(ang) * rad * 1.25;
    var y = p[1] + Math.sin(ang) * rad * 0.78;
    var rr = zoomW * (0.014 + 0.028 * Math.sqrt(r.tot / max));
    if (box) {           /* keep bubble + label inside the zoomed window */
      var mx = rr + Math.max(zoomW * 0.05, r.d.length * zoomW * 0.0065),
          my = rr + zoomW * 0.035;
      x = Math.max(box[0] + mx, Math.min(box[0] + box[2] - mx, x));
      y = Math.max(box[1] + my + zoomW * 0.03, Math.min(box[1] + box[3] - my, y));
    }
    var node = document.createElementNS("http://www.w3.org/2000/svg", "g");
    node.setAttribute("class", "s-dist");
    node.innerHTML = '<circle cx="' + x + '" cy="' + y + '" r="' + rr + '"/>' +
      '<text x="' + x + '" y="' + (y - rr - zoomW * 0.008) + '" font-size="' + (zoomW * 0.022) + '">' +
      esc(r.d) + "</text>";
    node.addEventListener("click", function (ev) {
      ev.stopPropagation();
      showDistPop(r, ev);
      mapDistFocus = r.d;          /* the feed narrows to this district */
      startFeed();
    });
    g.appendChild(node);
  });

  function showDistPop(r, ev) {
    if (!pop) return;
    var s = r.s, other = Math.max(0, (s.lead || 0) - (s.wa || 0) - (s.call || 0));
    pop.innerHTML = "<b>" + esc(city) + " · " + esc(r.d) + "</b><span class='w'>son 1 hafta</span>" +
      "<div class='row hi'>✉️ İletişime geçen çift <b>" + n(s.lead || 0) + "</b></div>" +
      "<div class='row sub'>💬 WhatsApp " + n(s.wa || 0) + " · 📞 Arama " + n(s.call || 0) +
      " · diğer " + n(other) + "</div>" +
      "<div class='row hi'>🤝 Anlaşma <b>" + n(s.deal || 0) + "</b></div>" +
      "<div class='row'>📸 Instagram " + n(s.ig || 0) + " · ❤️ Favori " + n(s.fav || 0) + "</div>" +
      "<div class='row'>📍 Yol tarifi " + n(s.yol || 0) + " · 🔗 Paylaşım " + n(s.paylas || 0) + "</div>" +
      "<div class='row low'>⭐ Yorum " + n(s.yorum || 0) + " · 🌐 Site " + n(s.site || 0) + "</div>";
    pop.hidden = false;
    var wrap = pop.parentElement.getBoundingClientRect();
    var x = ev.clientX - wrap.left, y = ev.clientY - wrap.top;
    pop.style.left = Math.min(x, wrap.width - pop.offsetWidth - 8) + "px";
    pop.style.top = Math.max(8, y - pop.offsetHeight - 12) + "px";
  }
}

/* One balloon at a time — two at once overlap on the western pins — and the
   whole feed rotates through, consecutive balloons moving between cities. */
var MAP_LIVE = 1, MAP_EVERY = 3200, MAP_TTL = MAP_EVERY + 400;

function startMap() {
  stopMap();
  var M = C.turkeyMap, host = $("#s-bubs"), pinHost = $("#s-pins");
  if (!host || !pinHost) return;
  var cities = mapScopeCities();               /* null = all */
  var catG = mapScopeCats();
  var evs = MAP.events.filter(function (e) {
    return (!cities || cities.indexOf(e.city) >= 0) &&
           (!catG || catG.cats.indexOf(e.cat) >= 0);
  });
  host.innerHTML = "";

  /* zoom in when exactly one city is on scope, back out otherwise */
  var vb0 = M.viewBox.split(" ").map(Number);
  var single = cities && cities.length === 1 ? cities[0] : "";
  var zoomW = vb0[2] * 0.34;
  if (single && M.cities[single]) {
    var zc = M.cities[single], zh = zoomW * vb0[3] / vb0[2];
    var zbox = [
      Math.max(0, Math.min(vb0[2] - zoomW, zc[0] - zoomW / 2)),
      Math.max(0, Math.min(vb0[3] - zh, zc[1] - zh / 2)), zoomW, zh];
    mapSetView(zbox);
    drawDistricts(single, zoomW, zbox);
  } else {
    mapSetView(vb0);
    drawDistricts("", 0, null);
  }

  if (!evs.length) {
    pinHost.innerHTML = "";
    host.innerHTML = "<div class='note' style='position:absolute;left:0;top:0'>Bu seçim için kayıt yok.</div>";
    return;
  }
  var pins = [];
  evs.forEach(function (e) { if (pins.indexOf(e.city) < 0) pins.push(e.city); });
  /* under zoom the city dot duplicates the district cloud — hide it */
  pinHost.innerHTML = single ? "" : pins.map(function (c) {
    var p = M.cities[c];
    return p ? '<g class="s-pin"><circle class="halo" cx="' + p[0] + '" cy="' + p[1] +
      '" r="22"/><circle class="dot" cx="' + p[0] + '" cy="' + p[1] + '" r="7"/></g>' : "";
  }).join("");

  var VW = vb0[2], VH = vb0[3];
  /* round-robin across cities so consecutive balloons are not all in one place */
  var byCity = {}, order = [];
  evs.forEach(function (e) {
    if (!byCity[e.city]) { byCity[e.city] = []; order.push(e.city); }
    byCity[e.city].push(e);
  });
  var queue = [], added = true;
  for (var round = 0; added; round++) {
    added = false;
    order.forEach(function (c) { if (byCity[c][round]) { queue.push(byCity[c][round]); added = true; } });
  }
  var cursor = 0, live = [];

  function place(el) {
    var box = el.querySelector(".box");
    if (!box || getComputedStyle(el).position !== "absolute") return;
    for (var i = 0; i < 3; i++) {
      var m = host.getBoundingClientRect(), r = box.getBoundingClientRect(), moved = false;
      if (r.right > m.right - 1 && !el.classList.contains("alignR")) {
        el.classList.remove("alignL"); el.classList.add("alignR"); moved = true;
      } else if (r.left < m.left + 1 && !el.classList.contains("alignL")) {
        el.classList.remove("alignR"); el.classList.add("alignL"); moved = true;
      }
      if (r.top < m.top + 1 && !el.classList.contains("below")) { el.classList.add("below"); moved = true; }
      else if (r.bottom > m.bottom - 1 && el.classList.contains("below")) {
        el.classList.remove("below"); moved = true;
      }
      if (!moved) return;
    }
  }
  function retire(rec) {
    rec.el.classList.add("out");
    setTimeout(function () { if (rec.el.parentNode) rec.el.remove(); }, 400);
    live = live.filter(function (x) { return x !== rec; });
  }
  function nextEvent() {
    /* prefer a city with no balloon on screen; fall back to plain order */
    var busy = live.map(function (x) { return x.e.city; });
    for (var k = 0; k < queue.length; k++) {
      var e = queue[(cursor + k) % queue.length];
      if (busy.indexOf(e.city) < 0 || pins.length <= live.length) {
        cursor = (cursor + k + 1) % queue.length;
        return e;
      }
    }
    var f = queue[cursor % queue.length]; cursor++; return f;
  }
  function pop() {
    if (!document.body.contains(host)) { stopMap(); return; }
    var now = Date.now();
    live.slice().forEach(function (rec) { if (now - rec.t > MAP_TTL) retire(rec); });
    while (live.length >= MAP_LIVE) retire(live[0]);
    var e = nextEvent();
    var p = M.cities[e.city];
    if (!p) return;
    var el = document.createElement("div");
    /* project through the CURRENT viewBox so balloons land right under zoom */
    var svg = $("#s-mapsvg");
    var vb = svg ? svg.getAttribute("viewBox").split(" ").map(Number) : [0, 0, VW, VH];
    var xp = (p[0] - vb[0]) / vb[2] * 100, yp = (p[1] - vb[1]) / vb[3] * 100;
    xp = Math.max(4, Math.min(96, xp)); yp = Math.max(6, Math.min(94, yp));
    el.className = "s-bub " + (e.t === "deal" ? "deal " : "") +
      (yp < 42 ? "below " : "") + (xp < 20 ? "alignL" : xp > 80 ? "alignR" : "");
    el.style.left = xp + "%"; el.style.top = yp + "%";
    var label = MAP.labels[e.t] || "";
    var act = MAP_ICON[e.t] + " " +
      (e.couple ? esc(e.couple) + " " + esc(label) : esc(label));
    var ago = e.ago || (typeof e.day === "number" ? mapAgo(e.day) : "");
    /* Same shape as the card on dugun.com: cover, city, provider, category. */
    el.innerHTML = '<div class="box"><div class="hd">' +
      '<img class="ph" alt="" src="' + esc(e.img || "") + '">' +
      '<div class="tx"><span class="city">' + esc(e.city) +
      (e.d ? " · " + esc(e.d) : "") + "</span>" +
      "<b>" + esc(e.name) + '</b><span class="cat">' + esc(e.cat) + "</span></div></div>" +
      '<div class="act">' + act +
      (ago ? " <i>" + esc(ago) + "</i>" : "") + "</div></div>";
    host.appendChild(el);
    /* A missing cover must not leave a broken-image icon on a customer's
       screen — swap in the venue's initial on the brand gradient instead. */
    var img = el.querySelector(".ph");
    if (img) img.addEventListener("error", function () {
      var fb = document.createElement("div");
      fb.className = "ph ph-fb";
      fb.textContent = (e.name || "?").charAt(0).toLocaleUpperCase("tr");
      if (img.parentNode) img.parentNode.replaceChild(fb, img);
    });
    place(el);
    live.push({ el: el, e: e, t: now });
  }
  pop();
  mapTimer = setInterval(pop, MAP_EVERY);
}

/* ================================================================== pen */
var Pen = (function () {
  var cv = $("#s-draw"), bar = $("#s-draw-bar"), ctx = null, on = false;
  var col = "#E21B71", w = 3, alpha = 1, straight = false, drawing = false, startY = 0;
  function fit() {
    var img = ctx ? ctx.getImageData(0, 0, cv.width, cv.height) : null;
    var r = cv.getBoundingClientRect();
    cv.width = Math.max(1, Math.round(r.width)); cv.height = Math.max(1, Math.round(r.height));
    ctx = cv.getContext("2d");
    if (img) ctx.putImageData(img, 0, 0);
    ctx.lineJoin = "round";
  }
  function pt(e) {
    var t = e.touches ? e.touches[0] : e, r = cv.getBoundingClientRect();
    return { x: t.clientX - r.left, y: t.clientY - r.top };
  }
  cv.addEventListener("mousedown", start);
  cv.addEventListener("touchstart", start, { passive: false });
  window.addEventListener("mousemove", move);
  cv.addEventListener("touchmove", move, { passive: false });
  window.addEventListener("mouseup", function () { drawing = false; });
  window.addEventListener("touchend", function () { drawing = false; });
  function start(e) {
    if (!ctx) fit();
    e.preventDefault();
    drawing = true;
    var p = pt(e); startY = p.y;
    ctx.globalAlpha = alpha; ctx.strokeStyle = col; ctx.lineWidth = w;
    ctx.lineCap = straight ? "butt" : "round";
    ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + .01, p.y); ctx.stroke();
  }
  function move(e) {
    if (!drawing) return;
    e.preventDefault();
    var p = pt(e);
    ctx.lineTo(p.x, straight ? startY : p.y); ctx.stroke();
  }
  window.addEventListener("resize", function () { if (on) fit(); });
  $$(".s-sw").forEach(function (s) {
    s.addEventListener("click", function () {
      $$(".s-sw").forEach(function (o) { o.setAttribute("aria-pressed", o === s); });
      col = s.dataset.col;
    });
  });
  $$(".s-draw-bar [data-pen]").forEach(function (b) {
    b.addEventListener("click", function () {
      $$(".s-draw-bar [data-pen]").forEach(function (o) { o.setAttribute("aria-pressed", o === b); });
      straight = b.dataset.pen === "mark";
      w = straight ? 20 : 3; alpha = straight ? .55 : 1;
      var want = straight ? "#FFE24A" : "#E21B71";
      var sw = $$(".s-sw").filter(function (o) { return o.dataset.col === want; })[0];
      if (sw) { $$(".s-sw").forEach(function (o) { o.setAttribute("aria-pressed", o === sw); }); col = want; }
    });
  });
  $("#s-pen-clear").addEventListener("click", function () {
    if (ctx) ctx.clearRect(0, 0, cv.width, cv.height);
  });
  $("#s-pen-close").addEventListener("click", function () { toggle(false); });
  /* The header sits above the canvas (z-index), so the pen button stays
     clickable while drawing and a second click closes the pen — no trip to
     the "Kapat" button needed. */
  function toggle(force) {
    on = force == null ? !on : force;
    cv.classList.toggle("on", on);
    bar.classList.toggle("on", on);
    $("#s-pen").classList.toggle("on", on);
    if (on) {
      fit();
      /* the pen opens as the yellow highlighter every time — that is what a
         rep reaches for first (striking a list price, underlining a figure);
         the thin pen is one click away */
      var mark = $('.s-draw-bar [data-pen="mark"]');
      if (mark) mark.click();
    }
  }
  return { toggle: toggle };
})();

/* =================================================================== boot */
$("#s-topic-home").addEventListener("click", goHome);
$("#s-sim-home").addEventListener("click", goHome);
$("#s-logo-home").addEventListener("click", goHome);
$("#s-pen").addEventListener("click", function () { Pen.toggle(); });
document.addEventListener("keydown", function (e) {
  var t = e.target.tagName;
  if (t === "INPUT" || t === "SELECT" || t === "TEXTAREA") return;
  if (e.key === "p" || e.key === "P") Pen.toggle();
  if (e.key === "Escape") {
    Pen.toggle(false);
    if (!$("#s-topic").hidden) goHome();
  }
});
renderBoard();
})();
