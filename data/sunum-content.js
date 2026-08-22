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
      d: "Sizden önce başlayanların anlattıkları" },
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
     data/content.js and are shared with the panel's objection library. Only
     the opening belongs to the deck: here the venue has not objected yet, so
     the page starts where the couple's search actually starts. */
  instagram: {
    hero: "Çift araştırmasına Google'da başlar. Google'da da en üstte biz varız.",
    lead: "\"Kır düğünü mekanları\", \"düğün salonu fiyatları\", \"İzmir düğün mekanı\" — " +
      "çift ne yazarsa yazsın, karşısına ilk çıkan sonuçlardan biri Düğün.com. " +
      "Yani sizi henüz tanımayan çift, sizi ilk burada görüyor."
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
    title: "Bölgenizde şu an ne oluyor?",
    lead: "Şehir ve kategori seçin; o segmentte Düğün.com üzerinden gerçekleşen hareketi " +
      "birlikte okuyalım.",
    reachTitle: "Peki siz bu çiftlerin kaçına ulaşıyorsunuz?",
    reachText: "Siz kesinlikle çiftlere ulaşıyorsunuz — referans, geçmiş düğünler, Instagram " +
      "reklamları. Ama bir firma, bölgesindeki çiftlerin ortalama <b>dörtte birine</b> " +
      "erişebiliyor. Aşağıdaki oranı kendi durumunuza göre değiştirebilirsiniz.",
    reachNote: "Erişim oranı bir varsayımdır; çift sayısı ve teklif sayısı gerçek Düğün.com verisidir."
  },

  bosgun: {
    title: "Boş günleriniz ne olacak?",
    lead: "Cumartesi akşamı dolu olabilir. Peki hafta içi, gündüz ve pazar günleri? " +
      "Boş kalan gün, geri gelmeyen gelirdir.",
    joker: {
      t: "Joker kartımız: Özel Fiyat",
      d: "Belirli tarihler ya da belirli koşullar için özel fiyat tanımlarsınız. Kartınız " +
         "listede rozetle farklılaşır, çift fiyatı görerek tıklar. Takviminizin boş kalan " +
         "kısmını doldurmanın en hızlı yolu budur."
    },
    facts: [
      { v: "%6", l: "daha yüksek tıklanma",
        d: "Özel Fiyat rozeti taşıyan kartların listede tıklanma oranı, taşımayanlara göre " +
           "daha yüksek (2026 verisi, ödeyen mekanlar)." },
      { v: "Siz belirlersiniz", l: "hangi tarih, hangi koşul",
        d: "Kampanyayı Connect uygulamasından kendiniz tanımlar, onay sonrası yayına alırsınız." },
      { v: "Anında", l: "yayına alma",
        d: "İndirim, taksit veya hediye — üç kampanya tipinden birini seçip başlıkla birlikte " +
           "girersiniz." }
    ],
    ads: [
      { f: "assets/video/ozel-fiyat-reklam-1.mp4", t: "Özel Fiyat reklamı" },
      { f: "assets/video/ozel-fiyat-reklam-2.mp4", t: "Özel Fiyat reklamı" }
    ],
    adsTitle: "Özel Fiyat'ı nasıl duyuruyoruz?",
    adsLead: "Kampanyanızı yalnızca listede göstermiyoruz — kendi reklam kanallarımızda da " +
      "çiftlerin karşısına çıkarıyoruz.",
    repWarn: "Özel Fiyat kullanan mekanların toplam teklif sayısı ortalamanın altında görünüyor — " +
      "çünkü kampanyayı genelde talebi düşük mekanlar açıyor. <b>“Özel Fiyat daha çok teklif " +
      "getirir” demeyin.</b> Savunulabilir olan tek rakam tıklanma oranı; asıl argüman boş " +
      "günlerin doldurulması."
  },

  hikaye: {
    title: "Kendi hikâyeni yarat",
    lead: "Rakamlar ikna eder, hikâyeler karar verdirir.",
    steps: [
      { n: 1, t: "Kendi tecrübenizden bir firma anlatın",
        d: "Bizzat çalıştığınız, başlangıcını ve bugününü bildiğiniz bir mekan. İsim verin, " +
           "rakam verin, ne yaptıklarını anlatın.",
        rep: "Bu kısmı önceden hazırlayın. Görüşmede aklınıza gelen ilk örnek genelde en zayıf olandır." },
      { n: 2, t: "Duyduğunuz bir hikâyeyi aktarın",
        d: "Başka bir satış arkadaşınızdan ya da Düğün.com'dan duyduğunuz bir firma. " +
           "Farklı bir şehir ya da kategori olması iyidir — “sadece İstanbul'da oluyor” " +
           "algısını kırar.",
        rep: "Aşağıdaki başarı hikâyelerinden müşterinin kendi şehrine/kategorisine en yakın olanı seçin." },
      { n: 3, t: "Sözü onlara bırakın",
        d: "İki kısa video. Sizin söylediğinizi bir başkasının ağzından duymak, aynı cümleyi " +
           "iki kat güçlendirir.", rep: "" }
    ],
    videos: [
      { id: "P0rjyYfz59w",
        t: "Çamlıca Köşk", d: "“Düğün.com sayesinde 1 mekandan 8 mekana çıktık!”" },
      { id: "sjea8hmRwVI",
        t: "Mutlu iş ortakları", d: "“İşlerinizin ne kadarı Düğün.com'dan geliyor?”" }
    ]
  }
};
