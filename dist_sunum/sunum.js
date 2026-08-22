/* düğün.com · Daha Çok Çift Düğün.com'da
   The short deck: one board of topics, one topic on screen at a time.
   Standalone — shares only the data files with the full panel. */
(function () {
"use strict";

var C = window.CONTENT, P = window.PRICING, S = window.SUNUM, REG = window.REGION;
var CFG = window.APP_CONFIG;

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
       '<path d="M6 10.8V16c0 1.7 2.7 3 6 3s6-1.3 6-3v-5.2"/>'
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
  $("#s-topic").hidden = false;
  $("#s-home").hidden = false;
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
  $("#s-topic").hidden = true;
  $("#s-home").hidden = true;
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
/* The four arguments come straight from the "Instagram bana yetiyor" objection
   card in data/content.js, so the deck and the panel never drift apart on this
   argument. The hero line is the deck's own: in the objection library the card
   opens by agreeing with the venue, but here nobody has objected yet, so the
   page opens on where the search actually starts. `moves` carry inline <b>. */
PAGES.instagram = function (el) {
  var O = (C.objections || []).filter(function (o) { return o.id === "instagram"; })[0];
  if (!O) { el.innerHTML = "<div class='panel'><p>İçerik bulunamadı.</p></div>"; return; }

  el.innerHTML =
    '<div class="panel hero-tint"><h2>' + S.instagram.hero + "</h2>" +
    "<p>" + S.instagram.lead + "</p></div>" +
    '<div class="grid g2">' + O.moves.map(function (m, i) {
      return '<div class="panel" style="margin:0"><div class="move-no">' + (i + 1) + "</div>" +
        '<p style="margin:0">' + m + "</p></div>";
    }).join("") + "</div>";
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
PAGES.verim = function (el) {
  /* The local export, not the live Apps Script build: /exec needs a dugun.com
     Google session and Apps Script refuses to be framed unless the script calls
     setXFrameOptionsMode(ALLOWALL). The local copy also survives a venue with
     no signal. */
  el.innerHTML = '<iframe class="simframe tall" id="sim-frame" src="' + C.links.simulatorLocal +
    '" title="Satış Simülatörü"></iframe>';

  /* The deck already put a title on this page, so the simulator's own header is
     a second one. Hiding it means more than display:none — the simulator's
     layout offsets itself by --hdr in four places, so zeroing the variable is
     what actually reclaims the space.
     Only possible same-origin: opened over http:// this works, opened straight
     off the disk Chrome treats the frame as an opaque origin and the throw is
     caught, leaving the simulator's header visible but everything working. */
  var f = $("#sim-frame");
  f.addEventListener("load", function () {
    try {
      var d = f.contentDocument;
      if (!d) return;
      var st = d.createElement("style");
      st.textContent = "header{display:none!important}:root{--hdr:0px!important}";
      d.head.appendChild(st);
    } catch (e) { /* cross-origin frame — leave the simulator as it is */ }
  });
};

/* --------------------------------------------------------------- 5. Rakip */
var regionState = { city: "İstanbul", cat: "Kır Düğünü", win: "y1", reach: 25, deals: 30 };

PAGES.rakip = function (el) {
  var R = S.rakip;
  el.innerHTML = '<div class="panel"><h2>' + esc(R.title) + "</h2><p>" + esc(R.lead) + "</p>" +
    '<div class="grid g3" style="margin-top:16px">' +
    "<div><label class='fld'>Şehir</label><select id='rg-city'>" +
    cityList(REG.cities).map(function (c) {
      return "<option" + (c === regionState.city ? " selected" : "") + ">" + esc(c) + "</option>";
    }).join("") + "</select></div>" +
    "<div><label class='fld'>Kategori</label><select id='rg-cat'></select></div>" +
    "<div><label class='fld'>Dönem</label><div class='chips' id='rg-win'>" +
    REG.windows.map(function (w) {
      return '<button class="chip" data-k="' + w.k + '" aria-pressed="' + (w.k === regionState.win) +
        '">' + esc(w.t) + "</button>";
    }).join("") + "</div></div></div>" +
    '<div id="rg-out" style="margin-top:20px"></div></div>' +
    '<div class="panel tint" id="rg-reach"></div>';
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
    regionState.city = this.value; fillCats(); drawRegion();
  });
  $("#rg-cat").addEventListener("change", function () { regionState.cat = this.value; drawRegion(); });
  $$("#rg-win .chip").forEach(function (b) {
    b.addEventListener("click", function () {
      regionState.win = b.dataset.k;
      $$("#rg-win .chip").forEach(function (o) { o.setAttribute("aria-pressed", o === b); });
      drawRegion();
    });
  });
  drawRegion();
}

function drawRegion() {
  var cell = REG.data[regionState.city + "|" + regionState.cat];
  var out = $("#rg-out"), reach = $("#rg-reach");
  if (!cell) {
    out.innerHTML = "<p style='color:var(--mute)'>Bu şehir ve kategori için veri yok.</p>";
    reach.innerHTML = ""; return;
  }
  var w = cell.w[regionState.win];
  var label = REG.windows.filter(function (x) { return x.k === regionState.win; })[0].t;
  out.innerHTML = '<div class="grid g4">' +
    stat(w.views, "Çift ziyareti", label.toLowerCase() + " · sayfa görüntüleme") +
    stat(w.offers, "Teklif", "çiftin firmalara gönderdiği") +
    stat(w.weddings, "Tahmini düğün", "bu segmentte gerçekleşen") +
    stat(w.providers, "Firma", "talebi paylaşan mekan sayısı") + "</div>" +
    '<div class="punch" style="margin-top:18px">' + esc(regionState.city) + " · " +
    esc(regionState.cat) + " segmentinde <b>" + label.toLowerCase() + "</b> " +
    "<b>" + n(w.views) + "</b> çift ziyareti ve <b>" + n(w.offers) + "</b> teklif oluştu. " +
    "Bu talebi <b>" + n(w.providers) + "</b> mekan paylaştı — ortalama mekan başına <b>" +
    n(w.offers / (w.providers || 1)) + " teklif</b>.</div>" +
    '<div class="note">' + esc(REG.note) + "</div>";
  countUp(out);

  /* the quarter argument, driven by the same segment's real couple count */
  var pool = cell.couples12m;
  var r = regionState.reach / 100;
  var reached = Math.round(pool * r), missed = pool - reached;
  var closeRate = reached ? regionState.deals / reached : 0;
  reach.innerHTML = "<h2>" + esc(S.rakip.reachTitle) + "</h2><p>" + S.rakip.reachText + "</p>" +
    '<div class="grid g2" style="margin:16px 0">' +
    "<div><label class='fld'>Bu çiftlerin yüzde kaçına kendi kanallarınızla ulaşıyorsunuz?</label>" +
    "<input type='number' id='rg-reach-in' min='1' max='100' value='" + regionState.reach + "'></div>" +
    "<div><label class='fld'>Yılda kaç anlaşma yapıyorsunuz?</label>" +
    "<input type='number' id='rg-deals-in' min='0' value='" + regionState.deals + "'></div></div>" +
    '<div class="grid g3">' +
    stat(pool, "Bölgenizdeki çift", "son 12 ayda Düğün.com'da teklif gönderen") +
    stat(reached, "Ulaştığınız", "%" + regionState.reach + " varsayımıyla") +
    stat(missed, "Ulaşamadığınız", "sizi hiç görmeyen çift") + "</div>" +
    '<div class="punch" style="margin-top:18px">Diyelim ki bölgenizdeki <b>' + n(pool) +
    "</b> çiftin <b>" + n(reached) + "</b> tanesine ulaşıyorsunuz ve <b>" + n(regionState.deals) +
    "</b> anlaşma yapıyorsunuz. Aynı oranla, ulaşamadığınız <b>" + n(missed) +
    "</b> çift <b>" + n(missed * closeRate) + " anlaşma</b> daha demek. " +
    "Düğün.com'da olmak, tam olarak bu farkı kapatmaktır.</div>" +
    '<div class="note">' + esc(S.rakip.reachNote) + "</div>";
  countUp(reach);
  $("#rg-reach-in").addEventListener("change", function () {
    regionState.reach = Math.max(1, Math.min(100, +this.value || 25)); drawRegion();
  });
  $("#rg-deals-in").addEventListener("change", function () {
    regionState.deals = Math.max(0, +this.value || 0); drawRegion();
  });
}
function stat(v, l, s, money) {
  return '<div class="stat"><div class="v num" data-count="' + Math.round(v) + '"' +
    (money ? ' data-money="1"' : "") + '>0</div><div class="l">' + esc(l) +
    '</div><div class="s">' + esc(s) + "</div></div>";
}

/* ------------------------------------------------------------------ 6. ROI */
var roi = { profit: 250000, weddings: 2, city: "İstanbul", cat: "Kır Düğünü", pkg: null, sale: null };

PAGES.roi = function (el) {
  el.innerHTML = '<div class="panel"><h2>Ne vereceksiniz, ne alacaksınız?</h2>' +
    "<p>Önce bir düğünün sizin için ne ifade ettiğini konuşalım, sonra rakamı yanına koyalım.</p>" +
    '<div class="grid g2" style="margin-top:16px">' +
    "<div><label class='fld'>Bir düğünden ortalama kazancınız (₺)</label>" +
    "<input type='number' id='r-profit' step='10000' min='0' value='" + roi.profit + "'></div>" +
    "<div><label class='fld'>Düğün.com'dan yılda kaç düğün beklersiniz?</label>" +
    "<input type='number' id='r-count' step='1' min='0' value='" + roi.weddings + "'></div></div></div>" +
    '<div class="panel"><h3>Paket</h3><div class="grid g3" style="margin-top:12px">' +
    "<div><label class='fld'>Şehir</label><select id='r-city'>" +
    cityList(P.geo.sahaIller).map(function (c) {
      return "<option" + (c === roi.city ? " selected" : "") + ">" + esc(c) + "</option>";
    }).join("") + "</select></div>" +
    "<div><label class='fld'>Kategori</label><select id='r-cat'>" +
    catList(P.sas.blocks[0].rows.map(function (r) { return r.category.trim(); })).map(function (c) {
      return "<option" + (c === roi.cat ? " selected" : "") + ">" + esc(c) + "</option>";
    }).join("") + "</select></div>" +
    "<div><label class='fld'>Paket</label><select id='r-pkg'></select></div></div>" +
    '<div class="grid g2" style="margin-top:14px;align-items:end">' +
    "<div><label class='fld'>Satış fiyatı (aylık, ₺)</label><input type='number' id='r-sale' step='500'></div>" +
    "<div><button class='btn' id='r-go'>Hesapla →</button></div></div>" +
    "<div id='r-note' class='note'></div></div>" +
    '<div id="r-out"></div>';
  bindRoi();
};

function roiPackages(city, cat) {
  var out = [];
  var map = { "İstanbul": "İstanbul", "Ankara": "Ankara", "İzmir": "İzmir", "Bursa": "Bursa",
    "Adana": "Adana - Antalya - Mersin", "Antalya": "Adana - Antalya - Mersin",
    "Mersin": "Adana - Antalya - Mersin" };
  var bl = P.sas.blocks.filter(function (b) { return b.name === (map[city] || "Uydu İller"); })[0];
  if (bl) {
    var row = bl.rows.filter(function (r) { return r.category.trim() === cat; })[0];
    if (row) [["Winner 6X", 0], ["Winner 4X", 1], ["Winner 2X", 2]].forEach(function (w) {
      if (row.prices[w[1]]) out.push({ name: w[0], term: 12, list: row.prices[w[1]], sale: null });
    });
  }
  var scope = ["İstanbul", "Ankara", "Bursa"].indexOf(city) >= 0 ? city : "Uydu İller";
  var sc = P.mos.scopes.filter(function (s) { return s.name === scope; })[0];
  var mb = sc && sc.blocks.filter(function (b) { return b.categories.indexOf(cat) >= 0; })[0];
  if (mb && mb.list) mb.terms.forEach(function (t) {
    out.push({ name: t.term, term: t.term.indexOf("12") >= 0 ? 12 : 6,
               list: mb.list, sale: t.monthly });
  });
  return out;
}

function bindRoi() {
  function fillPkgs() {
    var opts = roiPackages(roi.city, roi.cat);
    $("#r-pkg").innerHTML = opts.length
      ? opts.map(function (o) { return "<option>" + esc(o.name) + "</option>"; }).join("")
      : "<option value=''>Fiyat yok</option>";
    if (!opts.filter(function (o) { return o.name === roi.pkg; }).length) roi.pkg = opts[0] && opts[0].name;
    if (roi.pkg) $("#r-pkg").value = roi.pkg;
    syncSale();
  }
  function current() {
    return roiPackages(roi.city, roi.cat).filter(function (o) { return o.name === roi.pkg; })[0] || null;
  }
  function syncSale() {
    var pk = current();
    if (!pk) { $("#r-note").textContent = ""; return; }
    roi.sale = pk.sale || pk.list;
    $("#r-sale").value = Math.round(roi.sale);
    $("#r-note").innerHTML = "Liste fiyatı <b>" + tl(pk.list) + " / ay</b> · sözleşme süresi <b>" +
      pk.term + " ay</b>" + (pk.sale ? " · bu paketin satış fiyatı sabittir" : "");
  }
  ["city", "cat", "pkg"].forEach(function (k) {
    $("#r-" + k).addEventListener("change", function () {
      roi[k] = this.value;
      if (k !== "pkg") fillPkgs(); else syncSale();
    });
  });
  $("#r-sale").addEventListener("change", function () { roi.sale = Math.max(0, +this.value || 0); });
  $("#r-profit").addEventListener("change", function () { roi.profit = Math.max(0, +this.value || 0); });
  $("#r-count").addEventListener("change", function () { roi.weddings = Math.max(0, +this.value || 0); });
  $("#r-go").addEventListener("click", drawRoi);
  fillPkgs();
}

function drawRoi() {
  var pk = roiPackages(roi.city, roi.cat).filter(function (o) { return o.name === roi.pkg; })[0];
  var out = $("#r-out");
  if (!pk) { out.innerHTML = ""; return; }
  var total = roi.sale * pk.term;
  var payback = roi.profit ? Math.ceil(total / roi.profit) : null;
  var gross = roi.profit * roi.weddings;
  out.innerHTML = '<div class="roi-hero"><div class="grid g3">' +
    '<div class="roi-cell"><div class="l">Yatırımınız</div><div class="v num" data-money="1" data-count="' +
    Math.round(total) + '">0</div></div>' +
    '<div class="roi-cell"><div class="l">' + n(roi.weddings) + " düğünden kazancınız</div>" +
    '<div class="v num" data-money="1" data-count="' + Math.round(gross) + '">0</div></div>' +
    '<div class="roi-cell"><div class="l">Geri dönüş</div><div class="v num">' +
    (total ? n(gross / total, 1) + "×" : "—") + "</div></div></div>" +
    (payback ? '<div style="margin-top:18px;background:rgba(255,250,240,.16);border-radius:13px;' +
      'padding:16px 20px;font-size:17px;text-align:center;line-height:1.6"><b>' + n(payback) +
      " düğün</b> yatırımınızı karşılıyor." +
      (roi.weddings > payback
        ? " Beklediğiniz " + n(roi.weddings) + " düğünün kalan <b>" + n(roi.weddings - payback) +
          " tanesi tamamen kârınız</b>: <b>" + tl((roi.weddings - payback) * roi.profit) + "</b>."
        : " Bundan sonra aldığınız her düğün tamamen kârınıza kalır.") + "</div>" : "") +
    "</div>";
  countUp(out);
  out.scrollIntoView({ behavior: "smooth", block: "center" });
}

/* --------------------------------------------------------------- 7. Boş gün */
PAGES.bosgun = function (el) {
  var B = S.bosgun;
  el.innerHTML = '<div class="panel hero-tint"><h2>' + esc(B.title) + "</h2><p>" + esc(B.lead) + "</p></div>" +
    '<div class="panel tint"><h2>' + esc(B.joker.t) + "</h2><p>" + esc(B.joker.d) + "</p></div>" +
    '<div class="grid g3">' + B.facts.map(function (f) {
      return '<div class="stat"><div class="v">' + esc(f.v) + '</div><div class="l">' + esc(f.l) +
        '</div><div class="s">' + esc(f.d) + "</div></div>";
    }).join("") + "</div>" +
    '<div class="panel" style="margin-top:18px"><h3>' + esc(B.adsTitle) + "</h3><p>" +
    esc(B.adsLead) + '</p><div class="grid g2" style="margin-top:16px">' +
    B.ads.map(function (a) {
      return '<div><div class="vid portrait"><video src="' + a.f + '" controls ' +
        'preload="metadata" playsinline></video></div>' +
        '<div class="vid-cap" style="text-align:center">' + esc(a.t) + "</div></div>";
    }).join("") + "</div></div>" +
    '<div class="panel"><h3>Görüşmede kullanacağınız soru</h3>' +
    '<div class="punch">“Cumartesi akşamlarınız dolu — peki hafta içi ve gündüz? ' +
    "O günleri doldurmak için elinizde ne var?”</div>" +
    repNote(B.repWarn) + "</div>";
};

/* ---------------------------------------------------------------- 8. Hikâye */
PAGES.hikaye = function (el) {
  var H = S.hikaye;
  var cities = [];
  C.testimonials.forEach(function (t) { if (cities.indexOf(t.city) < 0) cities.push(t.city); });
  el.innerHTML = '<div class="panel"><h2>' + esc(H.title) + "</h2><p>" + esc(H.lead) + "</p>" +
    H.steps.map(function (s) {
      return '<div class="step-row"><div class="no">' + s.n + "</div><div><h3>" + esc(s.t) +
        "</h3><p style='margin:6px 0 0;color:var(--ink-2)'>" + esc(s.d) + "</p>" +
        (s.rep ? repNote(esc(s.rep)) : "") + "</div></div>";
    }).join("") + "</div>" +
    '<div class="panel"><h3>Sözü onlara bırakın</h3>' +
    '<div class="grid g2" style="margin-top:16px">' + H.videos.map(function (v) {
      return '<div><div class="vid"><iframe src="https://www.youtube.com/embed/' + v.id +
        '" title="' + esc(v.t) + '" allow="accelerometer; clipboard-write; encrypted-media; ' +
        'picture-in-picture" allowfullscreen loading="lazy"></iframe></div>' +
        '<div class="vid-cap"><b>' + esc(v.t) + "</b>" + esc(v.d) + "</div></div>";
    }).join("") + "</div>" +
    '<div class="chips" style="margin-top:16px">' +
    '<a class="btn ghost" target="_blank" rel="noopener" href="' + C.links.stories + '">Başarı hikâyeleri ↗</a>' +
    '<a class="btn ghost" target="_blank" rel="noopener" href="' + C.links.youtube + '">YouTube kanalı ↗</a></div></div>';
};

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
            { teklif: "adlı çift teklif istedi", anlasma: "adlı çift ile anlaşma yapıldı!" },
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
  var cursor = 0, live = null;

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
  function pop() {
    if (!document.body.contains(host)) { stopMap(); return; }
    var e = queue[cursor % queue.length]; cursor++;
    var p = M.cities[e.city];
    if (!p) return;
    if (live) {
      (function (old) {
        old.classList.add("out");
        setTimeout(function () { if (old.parentNode) old.remove(); }, 400);
      })(live);
    }
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
    live = el;
  }
  pop();
  mapTimer = setInterval(pop, 3200);
}

/* ==================================================================== pen */
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
  function toggle(force) {
    on = force == null ? !on : force;
    cv.classList.toggle("on", on);
    bar.classList.toggle("on", on);
    $("#s-pen").classList.toggle("on", on);
    if (on) fit();
  }
  return { toggle: toggle };
})();

/* =================================================================== boot */
$("#s-home").addEventListener("click", goHome);
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
