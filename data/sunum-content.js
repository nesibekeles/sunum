/* Copy for the simple presentation (sunum.html). Kept separate from
   data/content.js so the short deck and the full panel can evolve apart.
   Turkish, customer-facing. Rep-directed lines carry `rep: true`. */

window.SUNUM = {
  title: "Daha Çok Çift Düğün.com'da",

  /* size = how much room the tile gets in the bento grid, not a sort order.
     `area` is the explicit grid-area so the layout never becomes a staircase. */
  tiles: [
    { id: "baslar", w: 4, area: "a", icon: "rings",
      t: "Her düğün, Düğün.com ile başlar",
      d: "Türkiye'de evlenen çiftlerin başladığı yer" },
    { id: "hikaye", w: 4, area: "b", icon: "quote",
      t: "Kendi hikâyeni yarat",
      d: "İş ortaklarımızın deneyimleri" },
    { id: "verim", w: 3, area: "c", icon: "trend",
      t: "Maksimum verimi almak sizin elinizde",
      d: "Aynı paketle ne kadar fark yaratılabilir?" },
    { id: "bosgun", w: 3, area: "d", icon: "calendar",
      t: "Boş günleriniz ne olacak?",
      d: "Joker kartımız: Özel Fiyat" },
    { id: "ortaklik", w: 2, area: "e", icon: "partner",
      t: "İşinizi birlikte büyütmek için çok çalışıyoruz",
      d: "Bir listelemeden çok daha fazlası" },
    { id: "instagram", w: 2, area: "f", icon: "camera",
      t: "Instagram'ınızı da biz büyütüyoruz",
      d: "Rakip değiliz, arayışın başladığı yeriz" },
    { id: "rakip", w: 2, area: "g", icon: "radar",
      t: "Rakipler ne durumda?",
      d: "Bölgenizde şu an ne oluyor?" }
  ],

  baslar: {
    kicker: "19 yıldır sektörün lideri",
    googleTitle: "Düğün.com Google'da hep ilk sıralarda",
    googleNote: "Çiftin yazdığı her aramada karşısına çıkıyoruz. Deneyin.",
    mapTitle: "Son 1 haftada neler oldu?",
    mapInfo: "Bu haritada; Düğün.com üzerinden firmalara ulaşan veya " +
      "anlaşma sağlayan çiftlerin son 1 haftalık verilerini görmektesiniz."
  },

  /* The four arguments themselves live on the `instagram` objection card in
     data/content.js and are shared with the panel's objection library. The
     deck wraps them in a short, conversational experiment: three questions the
     rep asks the venue owner, each answer unlocking one of the arguments. The
     question index maps to a `moves` index on the card. */
  instagram: {
    hero: "Çiftler mekan araştırmalarına Google'da başlar. Google'da da en üstte biz varız.",
    lead: "\"Kır düğünü mekanları\", \"düğün salonu fiyatları\", \"İzmir düğün mekanı\" — " +
      "çift ne yazarsa yazsın, karşısına ilk çıkan sonuçlardan biri Düğün.com. " +
      "Yani sizi henüz tanımayan çift, sizi ilk burada görüyor.",
    expTitle: "Küçük bir deney",
    expLead: "Dört kısa soru. Cevabı siz verin; biz sadece çiftlerin ne yaptığını gösterelim.",
    questions: [
      { q: "Akşam yemeği için yeni bir restoran arıyorsunuz. İlk nereye bakarsınız?",
        a: ["Google'a yazarım", "Instagram'da ararım"],
        react: ["Çoğu insan gibi. Çiftler de mekan ararken aynısını yapıyor.",
                "Olabilir — ama Instagram'da aramak için adını bilmeniz gerekir. " +
                "Adını bilmediğiniz bir mekanı nerede bulursunuz?"],
        move: 1 },
      { q: "Sizi hiç duymamış bir çift, Instagram'da sizi nasıl bulur?",
        a: ["Keşfet ya da hashtag ile", "Bulamaz — adımı bilmesi gerekir"],
        react: ["Keşfet, takip ettiği hesaplara benzeyenleri gösterir; sizi arayan çifte değil. " +
                "Bilinmeyen bir mekan için bu bir piyango.",
                "Tam olarak bu. Instagram sizi bilenlerin kanalı; sizi arayanların değil."],
        move: 2 },
      { q: "Instagram reklamınızı bu ay durdursanız ne olur?",
        a: ["Trafik aynı kalır", "Trafik biter"],
        react: ["Reklam trafiği, reklam bütçesiyle başlar ve onunla biter.",
                "Evet. Reklam bir musluktur; kapattığınız an akış durur."],
        move: 3 },
      { q: "Peki Düğün.com sizin için Instagram'ın rakibi mi?",
        a: ["Rakibi", "Değil"],
        react: ["Öyle görünebilir — ama profilinizdeki Instagram butonu her gün size çift gönderiyor.",
                "Değil. Profilinizden Instagram'ınıza geçen her çift, sizin takipçiniz oluyor."],
        move: 0 }
    ],
    closing: "Düğün hazırlığında olan tüm çiftlerin ilk geldiği yer Düğün.com. Mekanınızı " +
      "önceden duymamış olsa bile bütün çiftlerin karşısına çıkarsınız.",
    /* the Instagram hand-off metric; the raw figure (MARKET.ig.d30) is
       multiplied by 1.5 at render time — couples who see the handle on the
       page and search Instagram themselves never press the button */
    metricTitle: "Düğün.com'dan Instagram'ınıza",
    metricL: "çift, son 30 günde Düğün.com'daki firma sayfalarından Instagram'a geçti",
    metricS: "buton tıklamaları ×1,5 — sayfada görüp Instagram'da kendisi aratan çiftler de hesaba katıldı",
    metricAside: "Bir de sahadan sık duyduğumuz bir şey var: firmalarımız, Düğün.com'a üye " +
      "olduktan sonra Instagram'dan gelen taleplerin de arttığını söylüyor. Bunu biz ölçmüyoruz — " +
      "ama bu kadar sık duyunca aktarmadan geçmek istemedik.",
    /* the last word goes to the venue's own couples — an invitation, not a claim */
    askTitle: "En iyi kanıt sizin çiftlerinizde",
    askText: "Bu hafta görüştüğünüz çiftlere sormaktan çekinmeyin: “Düğün.com'u biliyor musunuz? " +
      "Mekan ararken baktınız mı?” Cevabı bizim söylememize gerek kalmaz — onlar söyler."
  },

  ortaklik: {
    pillars: [
      { icon: "megaphone", t: "Yüksek reklam bütçeleri",
        d: "Siz ekstra reklam bütçesi harcamadan, evlilik hazırlığındaki çifte doğrudan " +
           "ulaşırsınız. Google ve sosyal medya reklamlarının parasını biz ödüyoruz; siz gelen " +
           "talebi karşılıyorsunuz.",
        proof: "Çift “düğün mekanı” aradığında arama sonuçlarının üstünde Düğün.com var." },
      { icon: "headset", t: "Ücretsiz Wedding Planner",
        d: "Kendi çağrı merkezimizdeki uzman ekip çiftle birebir görüşür, bütçesini ve tarihini " +
           "analiz eder ve kriterlerine uyan mekanlara yönlendirir. Bu hizmet için ayrıca ücret " +
           "ödemezsiniz.",
        proof: "Wedding Planner yönlendirmesi paket ücretine dahildir." },
      { icon: "chart", t: "Portföy Yöneticisi (PY)",
        d: "Size atanmış bir yönetici, sayfanızın verilerini okur; hangi ayda neyi düzeltmeniz " +
           "gerektiğini söyler. Tahmine değil, veriye göre ilerlersiniz.",
        proof: "Rakip analizi, profil skoru ve dönüş süresi raporlanır." },
      { icon: "cap", t: "Satış eğitimi ve araçlar",
        d: "Gelen talebi anlaşmaya çevirmek için eğitim, Düğün.com Connect uygulaması, kampanya " +
           "araçları ve rakip analizi. Talep gelmesi işin yarısı; kapatmayı da birlikte öğreniyoruz.",
        proof: "Connect uygulaması ile gelen çift → randevu → sonuç akışı tek ekranda." }
    ]
  },

  rakip: {
    marketTitle: "Kaç evlilik oldu, ne kadarı Düğün.com'u kullandı?",
    marketLead: "Şehir ve kategori seçin. Resmi evlilik sayısından başlayıp Düğün.com'daki " +
      "çiftlere, oradan sizin kategorinizi tercih eden çiftlere inelim.",
    marriageNote: "Evlilik sayıları; 2025 TUIK resmi istatistiklerinin, 2026 projeksiyonudur.",
    title: "Bölgenizde şu an ne oluyor?",
    lead: "Aynı şehir ve kategoride, Düğün.com üzerinden gerçekleşen hareketi birlikte okuyalım."
  },

  bosgun: {
    title: "Boş günleriniz ne olacak?",
    lead: "Cumartesi akşamı dolu olabilir. Peki hafta içi, gündüz ve pazar günleri?",
    sec1: "Birlikte Hesaplayalım",
    sec2: "Joker kartımız: Özel Fiyat",
    /* the loss calculator — the training's "20 × 350.000 = 7 milyon" moment.
       Both numbers are asked to the venue owner; the screen does the maths. */
    loss: {
      t: "Boş günün maliyeti",
      d: "İki rakamı birlikte dolduralım.",
      days: "Yılda kaç gününüz boş geçiyor?",
      value: "Ortalama bir düğünün size getirisi (₺)",
      out: "masada kalan yıllık ciro",
      punch: "Yılda <b>{sum}</b> masada kalıyor. Aşağıdaki her şey, bu rakamı geri almak için var."
    },
    /* the strong diagnosis from the sales-method training: empty-day demand is
       a lever on Saturday pricing, not just a patch on the calendar */
    power: {
      t: "Fiyatlama gücü: boş gün, sadece boş gün değildir",
      d: "Mesele yalnızca boş günü doldurmak değil. Talep havuzunuz büyüdükçe, en değerli " +
         "gününüzü premium fiyata satma fırsatı kazanırsınız. Bütçesi yetmeyen çifti " +
         "kaybetmezsiniz; boş cuma ve pazar günlerinize kaydırırsınız.",
      calc: {
        days: "Yılda kaç düğün yapıyorsunuz?",
        value: "Ortalama bir düğünün size getirisi",
        pct: "Fiyat artışı",
        out: "ek yıllık ciro"
      },
      punch: "Boş güne gelen ek talep, cumartesi fiyatınızı yukarı çeken bir kaldıraçtır: " +
         "doluluk arttıkça fiyatı siz belirlersiniz, iskonto yapan taraf olmazsınız."
    },
    joker: {
      t: "Joker kartımız: Özel Fiyat",
      d: "Belirli tarihler ya da belirli koşullar için özel fiyat tanımlarsınız. Kartınız " +
         "listede rozetle farklılaşır, çift fiyatı görerek tıklar; kampanyanızı kendi reklam " +
         "kanallarımızda da çiftlerin karşısına çıkarırız. Takviminizin boş kalan kısmını " +
         "doldurmanın en hızlı yolu budur."
    },
    /* `count` pulls the live figure from STORY.ozelFiyat.providers365 */
    facts: [
      { v: "Kontenjanlı", l: "her firmaya açılmaz",
        d: "Özel Fiyat kontenjanla kullanılır. Gerçekten Düğün.com'a özel, güçlü bir indirim " +
           "veren firmalara açılır." },
      { v: "Yılda 2 kez", l: "kullanım hakkı",
        d: "Her firma Özel Fiyat'ı yılda en fazla iki kez kullanabilir. Boş kalan dönemleri " +
           "hedeflemek için en doğru iki anı birlikte seçeriz." },
      { count: "providers365", l: "firma",
        d: "son bir yılda boş günlerini Özel Fiyat sayesinde doldurdu." },
      { v: "Birebir yönetim", l: "tecrübeli asistan",
        d: "Ekibimizden çok tecrübeli bir asistan bu süreci sizinle birebir yönetir. " +
           "Sonuçlarını birlikte takip eder, reklamlarınızı gün gün kontrol eder." },
      { v: "Ek ücret yok", l: "hizmet pakete dahil",
        d: "Özel Fiyat ve reklam desteği için ayrıca ücret alınmaz." }
    ],
    /* BI's on/off event study (docs/OZEL_FIYAT_ONOFF_RESULTS.md, 27.08.2026):
       same firm, ±6 weeks around the campaign activation, season-adjusted,
       2026 cohort (n=73). These figures are maintained by hand from that doc —
       they do not come from the panel's own pull. */
    cmp: {
      t: "Özel fiyatın somut faydası",
      d: "Özel Fiyat'ı açan firmalarda, açılıştan önceki ve sonraki verilerini karşılaştırdık.",
      count: "firma, son bir yılda boş günlerini Özel Fiyat sayesinde doldurdu.",
      stats: [
        { v: "+%25", l: "organik iletişime geçen çift / ay", s: "tipik firmada ayda +3–4 çift" },
        { v: "+%15", l: "sayfa görüntüleme / ay", s: "listede görünme ve tıklama da artıyor" }
      ]
    },
    ads: [
      { f: "assets/video/ozel-fiyat-reklam-1.mp4", t: "Özel Fiyat reklamı" },
      { f: "assets/video/ozel-fiyat-reklam-2.mp4", t: "Özel Fiyat reklamı" }
    ],
    adsTitle: "Özel Fiyat'ı nasıl duyuruyoruz?",
    adsLead: "Kampanyanızı yalnızca listede göstermiyoruz — kendi reklam kanallarımızda da " +
      "çiftlerin karşısına çıkarıyoruz."
  },

  hikaye: {
    title: "Kendi hikâyeni yarat",
    lead: "İş ortaklarımızın deneyimleri.",
    catLabel: "Kategori",
    allCats: "Tüm kategoriler",
    mine: {
      t: "Benim firmalarım",
      d: "Son 1 yılda satışını yaptığım firmalar arasından örnekler.",
      teamPick: "Ekip",
      empty: "Bu kategoride son 1 yılda satışınız bulunmuyor. Başka bir kategori seçin ya da " +
             "ekip örneklerine bakın.",
      unknown: "Satış kaydınızla eşleşme bulunamadı — ekip örneklerini gösteriyoruz."
    },
    others: {
      t: "Düğün.com firmaları",
      d: "Son 1 yılda satışını yaptığımız firmalar arasından örnekler.",
      dAll: "Son 1 yılda satışını yaptığımız firmalar arasından örnekler.",
      more: "Daha fazla göster"
    },
    stories: {
      t: "Düğün.com başarı hikayeleri",
      d: "İş ortaklarımız Düğün.com ile işlerini büyütme süreçlerini paylaşıyor. " +
         "Bu hikayeleri dinleyen değil, anlatan kişi olmanız için buradayım.",
      links: { stories: "https://dugun.com/isortagim/basari-hikayeleri",
               playlist: "https://www.youtube.com/watch?v=XVGtFubSlgQ&list=PLwBs3owE4E5LsN9awq7h5IV0fXWJUPbN0" }
    },
    metricNote: "Rakamlar son 12 ayın gerçek sayfa verisidir; firma adı ve anlaşma sayısı " +
      "bilinçli olarak gösterilmez."
  }
};
