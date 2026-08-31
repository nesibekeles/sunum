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
  return { name: u.name || "", team: team, dept: dept, isSales: isSales };
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
    "<div><label class='fld'>Şehir</label><select id='map-city'><option value=''>Tüm şehirler</option>" +
    mapCities().map(function (c) { return "<option>" + esc(c) + "</option>"; }).join("") +
    "</select></div><div><label class='fld'>Kategori</label><select id='map-cat'>" +
    "<option value=''>Tüm kategoriler</option>" +
    mapCats().map(function (c) { return "<option>" + esc(c) + "</option>"; }).join("") +
    "</select></div></div>" + mapMarkup() +
    '<div class="note" id="map-note">' + esc(B.mapInfo) + "</div></div>";

  el.innerHTML = h;
  function search() {
    var q = ($("#g-q").value || "").trim();
    if (q) window.open("https://www.google.com/search?q=" + encodeURIComponent(q), "_blank", "noopener");
  }
  $("#g-go").addEventListener("click", search);
  $("#g-q").addEventListener("keydown", function (e) { if (e.key === "Enter") search(); });
  $("#map-city").addEventListener("change", startMap);
  $("#map-cat").addEventListener("change", startMap);
  startMap();

  /* If a sheet is configured it lands a moment later and takes over. The
     built-in feed is already on screen by then, so the map never starts empty. */
  loadMapSheet(function () {
    var cs = $("#map-city"), ct = $("#map-cat");
    if (!cs || !ct) return;
    cs.innerHTML = "<option value=''>Tüm şehirler</option>" +
      mapCities().map(function (c) { return "<option>" + esc(c) + "</option>"; }).join("");
    ct.innerHTML = "<option value=''>Tüm kategoriler</option>" +
      mapCats().map(function (c) { return "<option>" + esc(c) + "</option>"; }).join("");
    startMap();
  });
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
/* A short experiment instead of a wall of arguments: the rep asks the venue
   owner three everyday questions, and each answer unlocks one of the four
   `moves` on the shared objection card (data/content.js) — so the argument
   text still lives in one place. Either answer leads to the same insight;
   the venue is never told it answered wrong. */
PAGES.instagram = function (el) {
  var O = (C.objections || []).filter(function (o) { return o.id === "instagram"; })[0];
  var I = S.instagram;
  if (!O) { el.innerHTML = "<div class='panel'><p>İçerik bulunamadı.</p></div>"; return; }

  /* the hand-off metric: raw button clicks ×1.5 (couples who see the handle
     and search Instagram themselves never press the button) */
  var igRaw = (MKT.ig && MKT.ig.d30) || 0;
  var igAdj = Math.round(igRaw * 1.5 / 500) * 500;
  el.innerHTML =
    '<div class="panel hero-tint"><h2>' + esc(I.hero) + "</h2><p>" + esc(I.lead) + "</p></div>" +
    (igAdj ? '<div class="panel tint"><h2>' + esc(I.metricTitle) + "</h2>" +
      '<div class="cal-count" style="margin-top:6px"><span class="v num" data-count="' + igAdj +
      '">0</span><span class="l">' + esc(I.metricL) + "</span></div>" +
      '<div class="note" style="margin-top:6px">' + esc(I.metricS) + "</div>" +
      '<p style="margin:14px 0 0">' + esc(I.metricAside) + "</p></div>" : "") +
    '<div class="panel ask"><div class="ask-ic">' +
    '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M4 5h16v10H9l-5 4V5z"/><path d="M9 10h.01M12 10h.01M15 10h.01"/></svg></div>' +
    "<div><h3>" + esc(I.askTitle) + "</h3><p style='margin:0'>" + esc(I.askText) + "</p></div></div>" +
    '<div class="panel"><h2>' + esc(I.expTitle) + "</h2><p>" + esc(I.expLead) + "</p>" +
    '<div class="exp" id="ig-exp">' + I.questions.map(function (q, i) {
      return '<div class="exp-q' + (i === 0 ? " on" : "") + '" data-i="' + i + '">' +
        '<div class="exp-no">' + (i + 1) + "</div>" +
        '<div class="exp-body"><div class="exp-ask">' + esc(q.q) + "</div>" +
        '<div class="exp-opts">' + q.a.map(function (a, j) {
          return '<button class="chip" data-j="' + j + '">' + esc(a) + "</button>";
        }).join("") + "</div>" +
        '<div class="exp-reveal" hidden><p class="exp-react"></p>' +
        '<div class="exp-move">' + O.moves[q.move] + "</div></div></div></div>";
    }).join("") + "</div>" +
    '<div class="punch" id="ig-close" hidden>' + esc(I.closing) + "</div></div>";
  countUp(el);

  $$("#ig-exp .exp-q").forEach(function (qEl) {
    var i = +qEl.dataset.i, q = I.questions[i];
    $$(".exp-opts .chip", qEl).forEach(function (b) {
      b.addEventListener("click", function () {
        $$(".exp-opts .chip", qEl).forEach(function (o) {
          o.setAttribute("aria-pressed", o === b); o.disabled = true; });
        var rv = $(".exp-reveal", qEl);
        $(".exp-react", rv).textContent = q.react[+b.dataset.j];
        rv.hidden = false;
        qEl.classList.add("done");
        var next = qEl.nextElementSibling;
        if (next && next.classList.contains("exp-q")) {
          next.classList.add("on");
          setTimeout(function () { next.scrollIntoView({ behavior: "smooth", block: "center" }); }, 120);
        } else {
          $("#ig-close").hidden = false;
        }
      });
    });
  });
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
    C.links.simulatorLocal + '" title="Satış Simülatörü"></iframe>';
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
  var cities = cityList(REG.cities);
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
  return catList(REG.categories).filter(function (c) { return REG.data[city + "|" + c]; });
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
  var punch = esc(regionState.city) + "'da " + esc(label) + " döneminde <b>" + n(marriages) +
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
  var key = regionState.city + "|" + regionState.cat;
  var seg = MKT.seg && MKT.seg[key];
  var cityT = MKT.cityTot && MKT.cityTot[regionState.city];
  if (!seg || !cityT || !MKT.tr) {
    out.innerHTML = "<p style='color:var(--mute)'>Bu şehir ve kategori için veri yok.</p>"; return;
  }
  var cym = completedYM();
  var winLabel = { w1: "son 1 hafta", w2: "son 15 gün", m1: ymLabel(cym), y1: "son 1 yıl" }[regionState.win];

  function funnel(title, metric) {
    var trV = winVal(MKT.tr[metric], regionState.win, cym);
    var ciV = winVal(cityT[metric], regionState.win, cym);
    var sgV = winVal(seg[metric], regionState.win, cym);
    return "<h3 style='margin:18px 0 10px'>" + esc(title) + "</h3>" +
      '<div class="funnel3">' +
      '<div class="f3"><div class="v num" data-count="' + trV + '">0</div>' +
      "<div class='l'>Tüm Türkiye</div><div class='s'>tüm kategoriler</div></div>" +
      '<div class="f3-arrow">→</div>' +
      '<div class="f3"><div class="v num" data-count="' + ciV + '">0</div>' +
      "<div class='l'>" + esc(regionState.city) + "</div><div class='s'>tüm kategoriler</div></div>" +
      '<div class="f3-arrow">→</div>' +
      '<div class="f3 hi"><div class="v num" data-count="' + sgV + '">0</div>' +
      "<div class='l'>" + esc(regionState.city) + " · " + esc(regionState.cat) +
      "</div><div class='s'>" + esc(winLabel) + "</div></div></div>";
  }

  out.innerHTML = funnel("Düğün.com trafiği", "sessions") + funnel("Firmalarla iletişime geçen çift", "offers") +
    '<div class="punch" style="margin-top:18px">' + esc(regionState.city) + " · " +
    esc(regionState.cat) + " segmentinde <b>" + esc(winLabel) + "</b> döneminde <b>" +
    n(winVal(seg.sessions, regionState.win, cym)) + "</b> Düğün.com ziyareti oldu, <b>" +
    n(winVal(seg.offers, regionState.win, cym)) + "</b> çift firmalarla iletişime geçti.</div>";
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
    m(p.igPm, "aylık Instagram'a geçiş", n) +
    m(p.rr, "dönüş oranı", function (v) { return pct(v, 0); }) +
    m(p.in1h, "1 saat içinde dönüş", function (v) { return pct(v, 0); }) +
    m(p.avgH, "ort. dönüş süresi", function (v) { return n(v, 1) + " sa"; }) +
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
  var raw = (window.LIVEMAP && window.LIVEMAP.events) || [];
  return {
    labels: (window.LIVEMAP && window.LIVEMAP.labels) ||
            { teklif: "adlı çift iletişime geçti", anlasma: "adlı çift ile anlaşma yapıldı!" },
    events: raw.filter(function (e) { return CFG.cityAllowed(e.city) && CFG.catAllowed(e.cat); })
  };
})();

function mapCities() { return cityList(MAP.events.map(function (e) { return e.city; })); }
function mapCats() {
  var out = [];
  MAP.events.forEach(function (e) { if (out.indexOf(e.cat) < 0) out.push(e.cat); });
  return out.sort();
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
        t: CFG.fold(cell("t")).indexOf("anlas") >= 0 ? "anlasma" : "teklif"
      };
      if (e.city && e.name && CFG.cityAllowed(e.city) && CFG.catAllowed(e.cat)) out.push(e);
    });
    if (out.length) { MAP.events = out; if (onDone) onDone(); }
  })["catch"](function () { /* keep the built-in feed */ });
}

function mapMarkup() {
  var M = C.turkeyMap;
  return '<div class="s-map-wrap"><svg viewBox="' + M.viewBox + '" preserveAspectRatio="xMidYMid meet">' +
    '<path class="s-land" d="' + M.d + '"/><g id="s-pins"></g></svg>' +
    '<div class="s-bubs" id="s-bubs"></div></div>';
}
function stopMap() { if (mapTimer) { clearInterval(mapTimer); mapTimer = null; } }

/* One balloon at a time — two at once overlap on the western pins — and the
   whole feed rotates through, consecutive balloons moving between cities. */
var MAP_LIVE = 1, MAP_EVERY = 3200, MAP_TTL = MAP_EVERY + 400;

function startMap() {
  stopMap();
  var M = C.turkeyMap, host = $("#s-bubs"), pinHost = $("#s-pins");
  if (!host || !pinHost) return;
  var city = $("#map-city") ? $("#map-city").value : "";
  var cat = $("#map-cat") ? $("#map-cat").value : "";
  var evs = MAP.events.filter(function (e) {
    return (!city || e.city === city) && (!cat || e.cat === cat);
  });
  host.innerHTML = "";
  if (!evs.length) {
    pinHost.innerHTML = "";
    host.innerHTML = "<div class='note' style='position:absolute;left:0;top:0'>Bu seçim için kayıt yok.</div>";
    return;
  }
  var pins = [];
  evs.forEach(function (e) { if (pins.indexOf(e.city) < 0) pins.push(e.city); });
  pinHost.innerHTML = pins.map(function (c) {
    var p = M.cities[c];
    return p ? '<g class="s-pin"><circle class="halo" cx="' + p[0] + '" cy="' + p[1] +
      '" r="22"/><circle class="dot" cx="' + p[0] + '" cy="' + p[1] + '" r="7"/></g>' : "";
  }).join("");

  var vb = M.viewBox.split(" "), VW = +vb[2], VH = +vb[3];
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
    var xp = p[0] / VW * 100, yp = p[1] / VH * 100;
    el.className = "s-bub " + (e.t === "anlasma" ? "deal " : "") +
      (yp < 42 ? "below " : "") + (xp < 20 ? "alignL" : xp > 80 ? "alignR" : "");
    el.style.left = xp + "%"; el.style.top = yp + "%";
    /* Same shape as the card on dugun.com: cover, city, provider, category. */
    el.innerHTML = '<div class="box"><div class="hd">' +
      '<img class="ph" alt="" src="' + esc(e.img || "") + '">' +
      '<div class="tx"><span class="city">' + esc(e.city) +
      (e.d ? " · " + esc(e.d) : "") + "</span>" +
      "<b>" + esc(e.name) + '</b><span class="cat">' + esc(e.cat) + "</span></div></div>" +
      '<div class="act">' + (e.t === "anlasma" ? "🤝 " : "✉️ ") +
      (e.couple ? esc(e.couple) + " " : "") + esc(MAP.labels[e.t]) +
      (e.ago ? " <i>" + esc(e.ago) + "</i>" : "") + "</div></div>";
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
