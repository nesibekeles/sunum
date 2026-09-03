/* düğün.com · Satış Sunumu — login gate
   Shared by index.html and sunum.html. Loaded before the page's own script.

   What this is and is not: it decides who may USE the panel and it records
   every login in the sheet. It does not protect the data files — on a public
   static host anyone can fetch data/renewal.js directly. If that matters, the
   panel has to move behind a real server. See docs/AUTH_SETUP.md. */
(function () {
"use strict";

var CFG = window.APP_CONFIG || {};
var KEY = "dc_sales_session";
var URL_KEY = "dc_sales_auth_url";   /* pasted endpoint, remembered per browser */

/* --------------------------------------------------------------- session */
function readSession() {
  try {
    var s = JSON.parse(localStorage.getItem(KEY) || "null");
    if (s && s.exp && Date.now() < s.exp) return s;
  } catch (e) {}
  return null;
}
function writeSession(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }
function clearSession() { try { localStorage.removeItem(KEY); } catch (e) {} }

function endpoint() {
  var u = CFG.authUrl;
  if (!u) { try { u = localStorage.getItem(URL_KEY) || ""; } catch (e) { u = ""; } }
  return u;
}

/* ------------------------------------------------------------------- markup */
function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; });
}

function screenName() {
  return /sunum/.test(location.pathname) ? "Sunum" : "Panel";
}

function buildGate() {
  var wrap = document.createElement("div");
  wrap.className = "auth-gate";
  wrap.id = "auth-gate";
  wrap.innerHTML =
    '<div class="auth-card">' +
      '<img class="auth-logo" src="assets/logo-krem.svg" alt="düğün.com">' +
      "<h1>" + (screenName() === "Sunum" ? "Satış Küpü" : "Saha Satış Paneli") + "</h1>" +
      "<p class=\"auth-sub\">Devam etmek için düğün.com mail adresiniz ve şifrenizle giriş yapın.</p>" +
      '<form class="auth-form" id="auth-form" autocomplete="on">' +
        '<label class="auth-fld" for="auth-mail">Mail adresi</label>' +
        '<input type="email" id="auth-mail" name="username" autocomplete="username" ' +
          'placeholder="ad.soyad@dugun.com" required>' +
        '<label class="auth-fld" for="auth-pass">Şifre</label>' +
        '<input type="password" id="auth-pass" name="password" autocomplete="current-password" required>' +
        '<div class="auth-err" id="auth-err" hidden></div>' +
        '<button class="auth-btn" type="submit" id="auth-go">Giriş Yap</button>' +
      "</form>" +
      '<div class="auth-setup" id="auth-setup" hidden>' +
        "<b>Giriş servisi henüz bağlanmamış.</b>" +
        "<p>Apps Script Web App adresini bir kez yapıştırın; bu tarayıcıda hatırlanır. " +
        "Kurulum adımları <code>docs/AUTH_SETUP.md</code> dosyasında.</p>" +
        '<input type="url" id="auth-url" placeholder="https://script.google.com/macros/s/.../exec">' +
        '<button class="auth-btn ghost" type="button" id="auth-url-go">Adresi Kaydet</button>' +
      "</div>" +
      '<div class="auth-foot">Giriş kayıtları BI ekibi tarafından tutulur.</div>' +
    "</div>";
  return wrap;
}

/* ------------------------------------------------------------------ header */
/* A chip in the top bar: who is logged in, and the way out. Both surfaces have
   a spacer element in their header, so the chip is inserted right after it. */
function mountUserChip(user) {
  var bar = document.querySelector(".s-top") || document.querySelector(".top");
  if (!bar || document.getElementById("auth-chip")) return;
  var chip = document.createElement("div");
  chip.className = "auth-chip";
  chip.id = "auth-chip";
  var initials = (user.name || user.mail || "?").trim().split(/\s+/)
    .slice(0, 2).map(function (w) { return w.charAt(0); }).join("").toUpperCase();
  chip.innerHTML = '<span class="av">' + esc(initials) + "</span>" +
    '<span class="who"><b>' + esc(user.name || user.mail) + "</b></span>" +
    '<button type="button" class="out" id="auth-out" title="Çıkış yap">Çıkış</button>';
  /* Always the last thing in the bar: the person is the rightmost element,
     the tools (pen, etc.) sit to its left. */
  bar.appendChild(chip);
  document.getElementById("auth-out").addEventListener("click", function () {
    clearSession();
    /* the simulator access code is per person, not per device: a logout must
       force the next user to enter their own code */
    try { localStorage.removeItem("yss_code"); } catch (e) {}
    location.reload();
  });
}

/* -------------------------------------------------------------------- flow */
function start() {
  var session = readSession();
  if (session) {
    window.CURRENT_USER = session.user;
    mountUserChip(session.user);
    document.dispatchEvent(new CustomEvent("auth:ready", { detail: session.user }));
    return;
  }

  document.documentElement.classList.add("auth-locked");
  var gate = buildGate();
  document.body.appendChild(gate);

  var form = gate.querySelector("#auth-form");
  var errEl = gate.querySelector("#auth-err");
  var btn = gate.querySelector("#auth-go");
  var setup = gate.querySelector("#auth-setup");

  if (!endpoint()) setup.hidden = false;

  gate.querySelector("#auth-url-go").addEventListener("click", function () {
    var v = (gate.querySelector("#auth-url").value || "").trim();
    if (!/^https:\/\/script\.google\.com\/macros\/s\/.+\/exec/.test(v)) {
      return fail("Adres https://script.google.com/macros/s/.../exec biçiminde olmalı.");
    }
    try { localStorage.setItem(URL_KEY, v); } catch (e) {}
    setup.hidden = true;
    fail("");
  });

  function fail(msg) {
    errEl.hidden = !msg;
    errEl.textContent = msg || "";
  }

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var url = endpoint();
    if (!url) { setup.hidden = false; return fail("Önce giriş servisi adresini kaydedin."); }

    var mail = gate.querySelector("#auth-mail").value.trim();
    var pass = gate.querySelector("#auth-pass").value;
    if (!mail || !pass) return fail("Mail adresi ve şifre gerekli.");

    btn.disabled = true;
    btn.textContent = "Kontrol ediliyor…";
    fail("");

    /* text/plain keeps this a simple CORS request, so the browser skips the
       preflight — Apps Script cannot answer an OPTIONS request. */
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        mail: mail, pass: pass,
        screen: screenName(),
        ua: navigator.userAgent
      })
    }).then(function (r) { return r.json(); }).then(function (res) {
      btn.disabled = false;
      btn.textContent = "Giriş Yap";
      if (!res || !res.ok) return fail((res && res.message) || "Giriş yapılamadı.");
      writeSession({ user: res.user, exp: res.exp, token: res.token });
      window.CURRENT_USER = res.user;
      document.documentElement.classList.remove("auth-locked");
      gate.classList.add("out");
      setTimeout(function () { if (gate.parentNode) gate.remove(); }, 320);
      mountUserChip(res.user);
      document.dispatchEvent(new CustomEvent("auth:ready", { detail: res.user }));
    })["catch"](function () {
      btn.disabled = false;
      btn.textContent = "Giriş Yap";
      fail("Giriş servisine ulaşılamadı. İnternet bağlantınızı ve servis adresini kontrol edin.");
    });
  });

  setTimeout(function () { gate.querySelector("#auth-mail").focus(); }, 60);
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
else start();
})();
