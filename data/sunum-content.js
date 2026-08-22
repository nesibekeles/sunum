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
    { id: "roi", w: 3, area: "d", icon: "return",
      t: "Ne vereceksiniz, ne alacaksınız?",
      d: "Yatırım ve geri dönüş, birlikte hesaplayalım" },
    { id: "ortaklik", w: 2, area: "e", icon: "partner",
      t: "İşinizi birlikte büyütmek için çok çalışıyoruz",
      d: "Bir listelemeden çok daha fazlası" },
    { id: "instagram", w: 2, area: "f", icon: "camera",
      t: "Instagram'ınızı da biz büyütüyoruz",
      d: "Rakip değiliz, arayışın başladığı yeriz" },
    { id: "rakip", w: 2, area: "g", icon: "radar",
      t: "Rakipler ne durumda?",
      d: "Bölgenizde şu an ne oluyor?" },
    { id: "bosgun", w: 2, area: "h", icon: "calendar",
      t: "Boş günleriniz ne olacak?",
      d: "Joker kartımız: Özel Fiyat" }
  ],

  baslar: {
    kicker: "19 yıldır sektörün lideri",
    googleTitle: "Düğün.com Google'da hep ilk sıralarda",
    googleNote: "Çiftin yazdığı her aramada karşısına çıkıyoruz. Deneyin.",
    mapTitle: "Son 1 haftada neler oldu?",
    mapInfo: "Bu haritada; Düğün.com üzerinden firmalara ulaşıp teklif isteyen veya " +
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
    expLead: "Üç kısa soru. Cevabı siz verin; biz sadece çiftlerin ne yaptığını gösterelim.",
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
        react: ["Reklam trafiği, reklam bütçesiyle başlar ve onunla biter. Denemesi kolay: " +
                "bir haftalığına durdurun.",
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
        proof: "Connect uygulaması ile teklif → randevu → sonuç akışı tek ekranda." }
    ]
  },

  rakip: {
    marketTitle: "Kaç evlilik oldu, ne kadarı Düğün.com'u kullandı?",
    marketLead: "Şehir ve kategori seçin. Resmi evlilik sayısından başlayıp Düğün.com'daki " +
      "çiftlere, oradan sizin kategorinizde teklif alan çiftlere inelim.",
    marriageNote: "Evlilik sayıları resmi istatistiklerinin 2026 projeksiyonudur.",
    title: "Bölgenizde şu an ne oluyor?",
    lead: "Aynı şehir ve kategoride, Düğün.com üzerinden gerçekleşen hareketi birlikte okuyalım."
  },

  bosgun: {
    title: "Boş günleriniz ne olacak?",
    lead: "Cumartesi akşamı dolu olabilir. Peki hafta içi, gündüz ve pazar günleri? " +
      "Boş kalan gün, geri gelmeyen gelirdir.",
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
           "veren firmalara açılır — çiftin gördüğü fiyat gerçekten özel olsun diye." },
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
    /* the calendar demo: a month of a venue's Saturdays-only bookings, and what
       Özel Fiyat does to the weekdays — a picture instead of a paragraph */
    cal: {
      t: "Takviminize bakalım",
      d: "Cumartesi akşamları dolu. Hafta içi, gündüz ve pazar — işte orası gelir getirmeyen " +
         "boşluk. Özel Fiyat'ı açın, farkı görün.",
      off: "Bugünkü takvim",
      on: "Özel Fiyat ile",
      legendFull: "dolu", legendEmpty: "boş", legendNew: "Özel Fiyat ile dolan",
      punchOff: "Ayda 30 günün yalnızca <b>4–5'i</b> satılıyor; kalan günler sessiz.",
      punchOn: "Aynı ay, aynı mekan: boş hafta içi ve pazar günlerine <b>fiyatı gören çift</b> geliyor."
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
      d: "Son 1 yılda satışını yaptığınız firmalar arasından, seçili kategoride en güçlü " +
         "sonuçları alan iki sayfa.",
      teamPick: "Ekip",
      empty: "Bu kategoride son 1 yılda satışınız bulunmuyor. Başka bir kategori seçin ya da " +
             "ekip örneklerine bakın.",
      unknown: "Satış kaydınızla eşleşme bulunamadı — ekip örneklerini gösteriyoruz."
    },
    others: {
      t: "Diğer iş geliştirme yöneticilerinin firmaları",
      d: "Ekibinizdeki diğer arkadaşlarınızın son 1 yılda sattığı firmalar arasından en " +
         "güçlü iki örnek. Farklı bir şehir ya da ilçe olması iyidir — “sadece bende oluyor” " +
         "algısını kırar.",
      dAll: "Tüm satış ekiplerinin son 1 yılda sattığı firmalar arasından en güçlü iki örnek."
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
