/* Shared configuration for both surfaces (index.html and sunum.html).
   Loaded before every other data file. Plain JS, no build step. */

window.APP_CONFIG = {

  /* ------------------------------------------------------------------ auth */
  /* The Apps Script Web App /exec URL. Leave empty and the login screen shows
     the setup box instead, where the URL can be pasted once and is remembered
     in this browser — so a non-developer never has to edit this file.
     Deployment steps: docs/AUTH_SETUP.md */
  authUrl: "https://script.google.com/macros/s/AKfycbyvMc24vIq0VQSQQhetMbCqHQfr8KZTvdTGtC270JJM-5JMspf7LKB9DZ5x2jP4jCv2/exec",

  /* --------------------------------------------------------- live map data */
  /* A published-to-web CSV of the "son 1 hafta" activity feed. Empty means the
     map falls back to data/livemap.js, which is generated from real providers.
     Expected columns (header row, Turkish, order does not matter):
       Şehir | İlçe | Firma | Kategori | Kapak Görseli | Tip | Ne Zaman | Çift
     Tip is "teklif" or "anlasma". Kapak Görseli is a full https:// image URL.
     Publish with File → Share → Publish to web → Comma-separated values. */
  liveSheetCsv: "",

  /* ---------------------------------------------------------------- scope */
  /* Every city picker in both surfaces is limited to these. The panel sells in
     more cities than this, but the deck is built for the six main ones plus
     Mersin — a picker with 41 entries is a picker nobody scrolls. */
  cities: ["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Adana", "Mersin"],

  /* Venue categories only: this panel is for the SAS and MoS venue teams, so
     the service categories (fotoğrafçı, gelinlik, organizasyon, müzik…) are out.
     Names differ slightly between the Qlik pulls and the price list, so both
     spellings of the same category are listed and matched by `catAllowed`. */
  venueCategories: [
    "Kır Düğünü",
    "Düğün Salonları", "Düğün Salonu",
    "Balo ve Davet Salonları", "Balo ve Davet Salonu",
    "Otel Düğünü", "Oteller",
    "Tarihi Mekanlar", "Tarihi Mekan",
    "Nikah Salonları", "Nikah Salonu",
    "Nikah Sonrası Yemeği",
    "Söz, Nişan Mekanları", "Söz ve Nişan Mekanları", "Söz & Nişan Mekanı",
    "Kına ve Bekarlığa Veda Mekan", "Kına ve Bekarlığa Veda", "Kına & Bekarlığa Veda",
    "Tekne Düğünü",
    "After Party"
  ]
};

/* Fold for comparison: Turkish-aware lower-case with the diacritics stripped,
   so "Söz & Nişan Mekanı" and "Söz, Nişan Mekanları" resolve to the same key.
   String.toLowerCase() maps "I" to "i"; Turkish wants "ı", hence the pre-pass. */
window.APP_CONFIG.fold = function (s) {
  s = String(s == null ? "" : s).replace(/İ/g, "i").replace(/I/g, "ı").toLowerCase();
  var from = "çğıöşü", to = "cgiosu";
  return s.replace(/[çğıöşü]/g, function (c) { return to.charAt(from.indexOf(c)); })
          .replace(/[^a-z0-9]+/g, " ").trim();
};

(function () {
  var CFG = window.APP_CONFIG, fold = CFG.fold;
  var cityKeys = {}, catKeys = {};
  CFG.cities.forEach(function (c) { cityKeys[fold(c)] = 1; });
  CFG.venueCategories.forEach(function (c) { catKeys[fold(c)] = 1; });

  CFG.cityAllowed = function (c) { return !!cityKeys[fold(c)]; };
  CFG.catAllowed = function (c) { return !!catKeys[fold(c)]; };

  /* Filter a list of city names down to the allowed set, keeping the order of
     APP_CONFIG.cities rather than the source list's — İstanbul first is the
     order a rep expects, alphabetical is not. */
  CFG.filterCities = function (list) {
    var have = {};
    (list || []).forEach(function (c) { have[fold(c)] = c; });
    return CFG.cities.filter(function (c) { return have[fold(c)]; })
      .map(function (c) { return have[fold(c)]; });
  };
  CFG.filterCats = function (list) {
    return (list || []).filter(function (c) { return CFG.catAllowed(c); });
  };
})();
