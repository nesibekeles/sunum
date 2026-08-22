/* Sale Dashboard — sales content library (Turkish, customer-facing).
   Edited by hand; no build step. Rep-facing guidance is rendered through
   repNote() in app.js so Sunum Modu can hide it. See docs/CONTENT_SPEC.md
   for the shape of every block and the rules for editing it. */

window.CONTENT = {

  links: {
    b2b: "https://dugun.com/isortagim",
    stories: "https://dugun.com/isortagim/basari-hikayeleri",
    instagram: "https://www.instagram.com/duguncomisortagim/",
    youtube: "https://www.youtube.com/@DugunComIsOrtagim/posts",
    eduVideo: "https://www.youtube.com/watch?v=WN8hUhkCJUw",
    features: "https://canva.link/jsj7npgatb4a7op",
    playbook: "https://nesibekeles.github.io/loyalty_acquisition/dugun.com_playbook.html",
    simulatorLive: "https://script.google.com/a/dugun.com/macros/s/AKfycbxRQY2lw7IPTFMBrzr6zAlC1sfwEAwOufBaeAbeWB-Ybo0JYWk306Im4Bx_dSAVMH4B5w/exec?t=abab41d0742923cd972d802cc369097e",
    simulatorLocal: "simulator/yeni_satis_simulatoru.html"
  },

  /* ---------------------------------------------------------------- intro */
  intro: {
    kicker: "19 yıldır sektörün lideri",
    title: "Türkiye'de Her Düğün Düğün.com ile Başlar",
    lead: "Türkiye'de yılda yaklaşık 600 bin düğün oluyor. Bu çiftlerin büyük bölümü mekan araştırmasına Google'dan başlıyor ve Düğün.com'da karar veriyor. Biz o kararın verildiği masayı kuruyoruz — siz de o masada olun.",

    stats: [
      { v: "2007", l: "Kuruluş yılı", s: "19 yıllık sektör liderliği" },
      { v: "400.000+", l: "Yıllık çift", s: "Evlilik hazırlığındaki gerçek kullanıcı" },
      { v: "20M+", l: "Yıllık çift ziyareti", s: "Platform üzerindeki toplam ziyaret" },
      { v: "%85", l: "Firma yenileme oranı", s: "İş ortaklarımızın kalma oranı" },
      { v: "81 il", l: "Kapsama", s: "Tüm iller ve tüm hizmet kategorileri" }
    ],

    /* the four things the customer actually buys */
    pillars: [
      {
        icon: "🔎",
        t: "Hazır talep",
        d: "Reklam bütçesi harcamadan, evlilik hazırlığındaki çifte doğrudan ulaşırsınız. Google ve sosyal medya reklamlarının parasını biz ödüyoruz; siz gelen talebi karşılıyorsunuz.",
        proof: "Çift 'düğün mekanı' aradığında arama sonuçlarının üstünde Düğün.com var."
      },
      {
        icon: "🎧",
        t: "Ücretsiz Wedding Planner",
        d: "Kendi çağrı merkezimizdeki uzman ekip çiftle birebir görüşür, bütçesini ve tarihini analiz eder ve kriterlerine uyan mekanlara yönlendirir. Bu hizmet için ayrıca ücret ödemezsiniz.",
        proof: "Wedding Planner yönlendirmesi paket ücretine dahildir."
      },
      {
        icon: "📈",
        t: "Portföy Yöneticisi (PY)",
        d: "Size atanmış bir yönetici, sayfanızın verilerini okur; hangi ayda neyi düzeltmeniz gerektiğini söyler. Tahmine değil, veriye göre ilerlersiniz.",
        proof: "Rakip analizi, profil skoru ve dönüş süresi raporlanır."
      },
      {
        icon: "🎓",
        t: "Satış eğitimi ve araçlar",
        d: "Gelen talebi anlaşmaya çevirmek için eğitim, Düğün.com Connect uygulaması, kampanya araçları ve rakip analizi. Talep gelmesi işin yarısı; kapatmayı da birlikte öğreniyoruz.",
        proof: "Connect uygulaması ile teklif → randevu → sonuç akışı tek ekranda."
      }
    ],

    /* how a couple actually reaches the venue - used as an animated funnel */
    funnel: [
      { t: "Google'da arıyor", d: "\"İstanbul kır düğünü mekanları\" — çift araştırmaya arama motorundan başlıyor." },
      { t: "Düğün.com listesine giriyor", d: "Listede kartınız görünür. Burası vitrin: fotoğraf, fiyat aralığı, puan." },
      { t: "Sayfanızı açıyor", d: "Galeri, menü, kapasite, yorumlar. Karar burada şekilleniyor." },
      { t: "Sizinle etkileşime geçiyor", d: "Çiftler form, telefon hatta WhatsApp üzerinden sizinle " +
        "doğrudan iletişime geçebiliyor; Instagram sayfanızı inceleyebiliyor, yol tarifi alabiliyor, " +
        "sayfanızı sonradan ziyaret etmek için favorilerine ekleyebiliyor." },
      { t: "Siz de doğrudan çift ile görüşüyorsunuz", d: "Hızlı dönen kazanıyor. Aynı çift genelde " +
        "4-6 mekana birden yazıyor." },
      { t: "Randevu ve anlaşma", d: "Mekanı gezme, teklif, imza. Düğün.com'un işi burada bitiyor, sizinki başlıyor." }
    ],

    /* the "where do couples come from" argument - matches the simulator's own chart */
    traffic: {
      title: "Sayfanıza gelen çift nereden geliyor?",
      note: "Rakamlar 2026 ortalamalarıdır, şehir ve kategoriye göre değişir. Firmaya özel değeri Satış Simülatörü'nden alın.",
      parts: [
        { l: "Liste ve kart tıklaması", v: 57, c: "pink" },
        { l: "Düğün.com reklamı + dış kaynak", v: 30, c: "green" },
        { l: "Kendi organik aramanız (Google)", v: 8, c: "teal" },
        { l: "Platform içi öneriler", v: 5, c: "soft" }
      ],
      punch: "Sayfanızı açan her 100 çiftten 92'si Düğün.com üzerinden geliyor. Sizi Google'da kendi adınızla arayan yalnızca 8 tanesi."
    },

    /* Connect app - from the official kılavuz */
    app: {
      title: "Düğün.com Connect",
      lead: "Gelen çifti kaybetmemek için cebinizdeki uygulama. Talebi getirmek bizim işimiz; " +
        "kaybetmemeniz için de araç veriyoruz.",
      shots: [
        { f: "01-giris.jpg", t: "Giriş", d: "Telefon numaranız ve tek kullanımlık kod" },
        { f: "02-anasayfa.jpg", t: "Anasayfa", d: "Profil skoru, ortalama cevap süresi, bekleyen işler" },
        { f: "03-ciftlerim.jpg", t: "Çiftlerim", d: "Tüm teklifler tek listede, süreç ikonlarıyla" },
        { f: "04-cift-detayi.jpg", t: "Çift detayı", d: "Mesajlar, notlar, organizasyon tarihi" },
        { f: "05-cift-detayi-2.jpg", t: "Teklif yolculuğu", d: "Yeni teklif → görüşülüyor → randevu → sonuç" },
        { f: "06-mesaj-icerik.jpg", t: "Mesaja içerik ekleme", d: "Dosya, fotoğraf, konum, hazır mesaj" },
        { f: "07-randevu.jpg", t: "Randevu oluşturma", d: "Tarih, saat, not — uygulama hatırlatır" },
        { f: "08-kampanya.jpg", t: "Kampanya oluşturma", d: "İndirim, taksit veya hediye kampanyası" },
        { f: "09-menu.jpg", t: "Menü", d: "Etkileşimler, istatistikler, taslaklar, yorumlar" },
        { f: "10-sayfa-istatistik.jpg", t: "Sayfa istatistikleri", d: "Görüntülenme ve etkileşim rakamları" },
        { f: "11-anlasma-istatistik.jpg", t: "Anlaşma istatistikleri", d: "Anlaşan çiftler ve yorum talebi" },
        { f: "12-rakip-analizi.jpg", t: "Rakip analizi", d: "Sektördeki konumunuz ve doğrudan rakipleriniz" }
      ],
      features: [
        { t: "Tüm çiftler tek listede", d: "Size teklif gönderen bütün çiftler tek ekranda; arayabilir, filtreleyebilirsiniz." },
        { t: "Teklif yolculuğu", d: "Yeni Teklif → Görüşülüyor → Randevu → Sonuç → Yorum. Hangi çiftte nerede kaldığınızı kaçırmazsınız." },
        { t: "Sıradaki adım önerisi", d: "Sistem her çift için ne yapmanız gerektiğini söyler: dönüş yap, randevu ver, sonuç gir." },
        { t: "Mesajlaşma", d: "Dosya, fotoğraf, konum ve hazır mesajlar aynı ekrandan." },
        { t: "Anlık etkileşim", d: "Kim görüntüledi, kim WhatsApp'tan ulaştı, kim yol tarifi aldı." },
        { t: "Kampanya oluşturma", d: "İndirim, taksit ve hediye kampanyalarınızı kendiniz tanımlar, onay sonrası yayına alırsınız." },
        { t: "Rakip analizi", d: "Sektördeki sıranız, doğrudan rakipleriniz, çiftlerin teklif aldığı ve anlaştığı diğer firmalar." },
        { t: "İstatistikler", d: "Sayfa istatistikleri ve anlaşma istatistikleri; yorum talebi tek dokunuşla." }
      ]
    }
  },

  /* --------------------------------------------------------- testimonials */
  testimonials: [
    { n: "Riva's Club Sırapınar", c: "Kır Düğünü", city: "İstanbul", q: "Düğün.com olmasaydı, bugün burada düğün yapılmazdı." },
    { n: "Ada Kanlıca - Baro Bahçe", c: "Kır Düğünü", city: "İstanbul", q: "İlk anlaştığımız sezon işlerimizin %92'si Düğün.com'dan geldi!" },
    { n: "Çamlıca Köşk Kamelya Bahçesi", c: "Kır Düğünü", city: "İstanbul", q: "Düğün.com sayesinde 1 mekandan 8 mekana çıktık!" },
    { n: "Asfor & Arus Balo Salonları", c: "Kulüp / Davet Alanı", city: "Ankara", q: "Yılda 60 bin kişi ağırlıyoruz; işlerimizin yarısı Düğün.com'dan geliyor!" },
    { n: "Aslan Bey Düğün Salonu", c: "Düğün Salonu", city: "Ankara", q: "Çiftlerimizin %60'ı Düğün.com'dan geliyor!" },
    { n: "Sheraton İstanbul Esenyurt", c: "Otel", city: "İstanbul", q: "Düğünlerimizin %60'ı Düğün.com'dan geliyor!" },
    { n: "Gala Düğün Davet", c: "Düğün Salonu", city: "İstanbul", q: "Düğün.com'la çalıştıktan sonra müşteri sayımız %75 arttı!" },
    { n: "Bella Wedding Antares", c: "Kulüp / Davet Alanı", city: "Ankara", q: "Düğün.com size müşteriyi yönlendirir. Satış yapıp yapmamak size kalmış!" },
    { n: "Moda Davet Özlüce", c: "Davet Alanı", city: "Bursa", q: "Müşteri getirmenin en etkili yolu Düğün.com!" },
    { n: "Elite World İstanbul Florya", c: "Otel", city: "İstanbul", q: "Düğün.com'dan önce en büyük problemimiz, rakip sayımızın fazla olmasıydı." },
    { n: "Liya", c: "Kır Düğünü", city: "İstanbul", q: "Düğün.com'la çalışmayı yeni firmalara tavsiye etmem, şart koşarım!" },
    { n: "Svadba Maçka", c: "Kır Düğünü", city: "İstanbul", q: "Hedefimiz 39 ilçede 39 Svadba kurmak — Düğün.com sayesinde bunu yapabileceğimize eminiz!" },
    { n: "Armonia Ada", c: "Düğün Salonu", city: "İstanbul", q: "Düğün.com bizim en büyük destekçimiz!" },
    { n: "Boğaztepe", c: "Kır Düğünü", city: "İstanbul", q: "Düğün.com profilinizi en etkili şekilde kullanırsanız, doğru çiftlere ulaşıyorsunuz!" },
    { n: "Portaxe", c: "Kulüp / Davet Alanı", city: "İstanbul", q: "Düğün.com sayesinde göz önünde olmanın faydalarını görüyoruz!" },
    { n: "Kukki Event", c: "Söz & Nişan Mekanı", city: "İstanbul", q: "Sektördeki firmalara Düğün.com'u milyonlarca kez tavsiye ederim!" },
    { n: "Hülya Davet Organizasyon", c: "Düğün Organizasyonu", city: "İstanbul", q: "Düğünle ilgisi olan herkesin Düğün.com'da yer alması gerekir!" },
    { n: "Mediha Cambaz Gelinlik", c: "Gelinlik", city: "Bursa", q: "Düğün.com'la çalışmaya başladıktan sonra müşteri portföyümüz genişledi!" }
  ],

  /* ------------------------------------------------------- AVM metaphor */
  avm: {
    kicker: "Nasıl düşünebiliriz",
    title: "Düğün.com, şehrinizin tek AVM'sidir",
    lead: "Alışveriş yapmak isteyen herkes nasıl bu AVM'ye gidecekse, evlenecek tüm çiftler de Düğün.com'a gelir.",
    parts: [
      { k: "yol", icon: "🛣️", t: "Google = AVM'ye çıkan yol", d: "Çift \"düğün mekanı\" diye aradığında yolun sonunda Düğün.com var. Bu yolun reklamını, SEO'sunu, sosyal medyasını biz yapıyoruz — trafiği AVM'ye biz getiriyoruz.", say: "Siz müşteriyi yola çıkarmakla uğraşmıyorsunuz; o iş bizde." },
      { k: "avm", icon: "🏬", t: "Düğün.com = AVM", d: "İçeride sadece evlenecek çiftler var. Vitrin önünden geçen herkes zaten alıcı. Sokakta yürüyen kalabalıktan farkı bu.", say: "Burada boşa geçen ayak trafiği yok; içeri giren zaten evleniyor." },
      { k: "magaza", icon: "🏪", t: "Mekanınız = mağaza", d: "AVM'ye giriyorsunuz ama mağazayı siz işletiyorsunuz. Ürün sizin, fiyat sizin, satış sizin.", say: "Biz mağazayı doldurmuyoruz; kapınıza müşteriyi getiriyoruz." },
      { k: "kat", icon: "🛗", t: "Paket (X) = kat ve konum", d: "Giriş kat, yürüyen merdiven başı bir mağaza mı, yoksa 4. katın köşesi mi? Paket büyüdükçe listede daha üstte, daha sık görünürsünüz.", say: "Aynı AVM, aynı müşteri — ama sizi kaç kişinin gördüğü kata bağlı." },
      { k: "vitrin", icon: "🪟", t: "Profiliniz = vitrin", d: "Fotoğraf, video, menü, fiyat aralığı, yorumlar. Vitrini boş mağazanın önünden herkes geçer, kimse girmez.", say: "Kata para verip vitrini boş bırakmak en pahalı hata." },
      { k: "etiket", icon: "🏷️", t: "Kampanya = indirim etiketi", d: "Özel fiyat ve kampanya rozeti kartınızı listede farklılaştırır; tıklanma oranınız artar.", say: "Aynı vitrin, üstünde etiket varken daha çok duraklatır." },
      { k: "danisma", icon: "💁", t: "Wedding Planner = danışma bankosu", d: "Çift ne aradığını bilmiyorsa danışmaya soruyor. Ekibimiz kriterlerine uyan mekanlara yönlendiriyor — ücretsiz.", say: "Danışma sizi öneriyorsa, müşteri kapınıza yönlendirilmiş demektir." },
      { k: "kapi", icon: "🤝", t: "Dönüş süreniz = kapıdaki karşılama", d: "Müşteri içeri girdi, kimse ilgilenmedi. Ne olur? Yandaki mağazaya geçer. Çift aynı anda 4-6 mekana yazıyor; ilk dönen konuşmayı başlatıyor.", say: "Talep geldikten sonraki ilk saat, satışın en pahalı saati." },
      { k: "sokak", icon: "📱", t: "Instagram = kendi sokağınızdaki dükkan", d: "Güzel bir dükkan; ama oraya gelmesi için müşterinin adresinizi zaten biliyor olması gerekir. AVM'de ise sizi tanımayan çift de bulur.", say: "Instagram'ı kapatmayın — AVM'ye de girin. İkisi rakip değil." }
    ],
    /* Floors, ordered by how close the shop sits to the entrance. The weights
       are the real priority weights from Qlik's sim_xw table. */
    floors: [
      { x: 6, label: "Winner 6X", floor: "Giriş kat, kapının yanı", weight: 100 },
      { x: 4, label: "Winner 4X", floor: "Giriş kat, uzak köşe", weight: 80 },
      { x: 3, label: "Pro Start", floor: "1. kat, merdiven başı", weight: 75 },
      { x: 2, label: "Winner 2X", floor: "1. kat, iç koridor", weight: 70 },
      { x: 0, label: "Düğün.com'da yok", floor: "AVM'nin dışında, sokakta", weight: 0 }
    ]
  },

  /* Turkey outline, generated from public boundary GeoJSON and simplified to
     654 points (Douglas-Peucker, 1.1 viewBox units). Pin coordinates are the
     same projection, so cities land where they belong. */
  turkeyMap: {
    viewBox: "0 0 1000 429",
    d: "M487.5 6.0 L483.7 6.5 L478.1 14.4 L472.4 15.9 L461.5 13.9 L451.3 15.4 L400.8 11.5 L378.0 21.3 L358.4 25.2 L347.7 30.5 L339.8 38.1 L301.9 58.1 L301.9 63.9 L297.4 70.1 L282.6 73.3 L271.2 72.7 L245.0 64.3 L238.1 69.1 L223.0 69.1 L194.1 63.3 L186.4 63.7 L183.2 61.5 L174.4 60.3 L140.0 43.2 L133.8 36.2 L134.3 34.4 L127.5 23.3 L128.6 21.1 L131.7 21.0 L130.5 14.2 L123.6 14.7 L121.6 13.2 L119.1 14.0 L119.6 16.5 L112.0 15.1 L105.9 19.4 L92.1 7.0 L88.2 7.0 L87.3 8.9 L80.7 7.2 L74.6 13.0 L69.8 13.4 L69.0 14.9 L57.6 14.7 L54.6 18.1 L55.4 21.7 L53.3 24.8 L44.6 25.0 L42.3 30.0 L44.0 32.2 L50.9 34.7 L52.9 38.2 L56.0 39.0 L58.2 54.6 L55.7 58.2 L53.0 56.7 L46.2 62.5 L42.1 62.6 L41.4 67.3 L42.9 69.5 L41.5 71.6 L44.3 77.6 L42.6 79.8 L44.0 82.7 L40.5 83.7 L40.2 86.1 L39.0 84.8 L37.1 86.4 L36.3 90.6 L32.9 92.8 L32.0 96.1 L26.6 97.4 L26.9 100.9 L28.0 104.6 L31.8 106.9 L50.8 107.3 L66.4 103.9 L67.6 106.4 L49.8 114.2 L36.7 122.4 L35.9 123.9 L39.3 130.0 L33.8 142.6 L36.9 142.3 L45.3 136.1 L44.9 132.2 L56.6 123.8 L62.1 115.9 L91.4 101.1 L94.8 95.2 L101.3 89.4 L102.6 83.6 L110.0 80.2 L118.8 79.9 L120.4 81.8 L126.3 82.4 L130.1 77.5 L138.1 75.9 L143.1 75.9 L160.8 82.4 L167.4 81.5 L170.2 83.0 L178.4 79.6 L185.9 86.3 L181.0 84.2 L181.2 87.6 L184.1 88.7 L185.2 91.7 L187.7 87.8 L190.6 88.3 L191.6 92.5 L195.5 92.5 L197.4 96.2 L204.4 94.5 L216.6 95.0 L217.5 96.8 L207.9 98.4 L207.2 95.7 L201.0 98.5 L178.1 101.3 L175.8 104.2 L169.5 106.3 L167.3 108.6 L167.6 111.0 L177.3 115.7 L182.4 114.8 L184.7 116.4 L181.9 120.0 L170.5 118.0 L160.0 119.8 L154.4 118.1 L140.2 118.0 L126.1 120.6 L124.4 119.4 L130.4 115.2 L132.9 115.9 L134.0 113.8 L130.8 114.2 L126.0 111.1 L116.4 109.7 L113.0 110.0 L111.9 113.9 L116.7 118.6 L116.6 120.7 L118.9 119.3 L121.6 120.5 L115.1 124.2 L100.9 124.0 L93.0 119.7 L94.6 118.3 L92.2 113.5 L86.9 115.9 L82.9 114.8 L77.4 119.0 L63.9 118.1 L51.3 130.9 L45.7 132.2 L46.0 137.2 L42.2 142.7 L34.2 143.9 L31.1 157.1 L30.4 154.8 L23.8 154.2 L22.8 156.6 L24.3 158.8 L27.7 160.5 L31.1 159.4 L31.7 168.4 L29.0 171.5 L27.7 180.8 L31.2 182.4 L58.0 175.3 L67.7 175.0 L71.9 173.0 L73.7 174.1 L72.6 178.2 L66.3 182.1 L66.4 184.7 L64.2 186.8 L62.6 183.6 L61.2 187.4 L59.9 184.9 L56.1 184.2 L54.6 186.0 L55.5 187.3 L52.4 189.9 L57.2 189.6 L54.9 192.6 L62.2 194.9 L64.4 200.2 L70.2 206.0 L64.9 210.1 L66.3 216.3 L67.7 217.6 L72.2 215.9 L78.2 217.9 L70.8 222.1 L72.3 225.4 L71.1 227.7 L67.8 226.2 L61.7 228.9 L62.1 233.9 L74.0 249.1 L80.4 247.3 L83.0 248.6 L81.7 250.3 L77.5 249.1 L66.7 252.5 L66.9 249.4 L61.8 240.3 L60.7 245.6 L62.5 247.2 L59.4 252.5 L56.9 248.7 L58.9 246.6 L58.4 241.8 L52.6 232.6 L47.1 231.5 L43.7 233.2 L43.5 235.2 L46.0 245.1 L44.7 247.5 L43.1 246.8 L40.9 248.8 L45.8 249.6 L47.6 246.3 L51.2 248.5 L48.6 248.4 L47.1 250.8 L48.1 252.7 L45.5 253.5 L44.5 255.7 L41.9 251.5 L39.4 251.1 L39.8 257.0 L37.0 257.7 L37.3 259.9 L45.2 262.3 L56.6 270.8 L58.8 264.1 L64.2 263.0 L71.0 276.1 L71.4 273.7 L75.6 272.5 L83.5 278.3 L89.2 278.7 L90.4 281.0 L88.7 287.4 L90.2 291.1 L88.8 294.5 L82.5 297.3 L77.6 297.0 L76.9 300.4 L82.0 301.5 L84.9 305.5 L85.8 311.9 L87.6 311.3 L86.3 319.7 L92.1 320.5 L93.5 322.2 L96.8 316.7 L96.9 322.2 L99.2 323.5 L101.7 322.6 L100.0 326.4 L102.8 325.9 L102.5 328.3 L104.2 328.1 L107.6 325.5 L103.1 329.7 L104.0 331.1 L100.8 335.4 L104.2 334.2 L101.1 336.9 L95.0 330.8 L95.0 332.7 L89.6 334.1 L91.0 335.7 L88.2 338.7 L89.5 344.7 L93.3 346.4 L97.2 342.1 L101.6 346.0 L103.2 344.4 L108.2 345.5 L111.4 343.7 L144.3 340.7 L139.1 342.4 L135.2 346.5 L129.0 347.4 L128.2 354.0 L130.3 355.5 L119.0 354.8 L112.6 356.2 L109.7 354.9 L108.0 357.9 L100.2 357.5 L97.4 359.8 L97.4 361.8 L95.0 361.7 L97.1 365.5 L112.2 366.0 L114.6 359.2 L124.0 360.7 L132.0 359.1 L127.9 360.8 L125.8 364.8 L130.5 366.8 L130.3 368.3 L125.5 368.9 L126.8 372.8 L130.1 372.7 L131.8 370.4 L134.9 370.1 L137.4 364.6 L143.2 361.7 L143.8 359.5 L141.8 356.7 L148.7 357.5 L150.6 353.8 L154.1 357.2 L158.0 355.8 L159.8 363.0 L168.1 364.0 L171.6 370.6 L177.0 364.6 L177.1 361.7 L180.6 363.5 L182.8 367.4 L180.7 368.5 L181.0 372.0 L179.3 372.9 L185.3 373.4 L184.9 384.2 L191.0 387.9 L197.8 394.1 L197.2 395.2 L198.9 391.9 L200.3 392.1 L201.9 395.9 L203.0 394.7 L209.4 396.9 L212.0 396.0 L212.1 400.1 L217.6 399.2 L217.3 401.1 L225.1 398.0 L226.5 394.4 L230.5 395.0 L233.1 392.8 L236.8 392.9 L240.1 388.8 L245.1 388.4 L251.0 391.5 L251.7 398.0 L254.2 392.9 L255.8 393.7 L256.5 388.2 L258.3 387.6 L256.3 381.6 L259.3 379.1 L258.0 377.6 L261.7 370.5 L260.1 368.4 L260.3 360.8 L262.9 353.8 L265.9 351.0 L269.8 353.7 L283.8 353.2 L298.8 356.0 L315.7 366.8 L334.1 373.7 L352.8 398.2 L367.7 406.5 L374.6 408.3 L382.5 402.6 L388.6 404.6 L391.3 400.6 L404.7 401.1 L408.2 399.0 L413.4 401.1 L416.8 397.0 L420.3 400.5 L423.2 395.6 L424.4 397.4 L424.0 395.0 L429.4 388.8 L431.2 389.0 L434.3 393.7 L437.1 389.7 L439.4 389.3 L440.6 382.0 L449.4 372.0 L469.0 356.5 L475.4 355.8 L480.5 358.6 L482.2 361.5 L487.1 362.4 L504.6 373.7 L508.6 370.4 L516.4 372.2 L520.2 368.4 L520.7 364.9 L524.0 362.7 L524.2 361.0 L519.2 361.7 L520.5 359.8 L527.8 359.1 L539.0 348.2 L544.2 351.1 L548.6 357.7 L548.2 369.2 L540.2 373.0 L526.7 387.9 L537.0 408.2 L534.3 413.3 L538.4 412.7 L538.4 416.4 L543.9 418.0 L546.7 421.4 L547.7 413.1 L551.7 411.2 L553.0 412.5 L553.4 408.2 L556.3 409.3 L557.9 408.0 L558.1 394.6 L562.4 395.8 L564.2 392.9 L570.4 394.7 L570.3 393.2 L574.1 392.7 L572.1 386.7 L569.5 387.1 L570.3 385.4 L566.4 376.0 L568.6 370.2 L567.9 365.3 L571.0 361.9 L569.8 359.7 L572.7 354.2 L589.5 358.4 L589.6 360.0 L592.0 360.5 L590.7 365.0 L594.3 367.0 L596.9 364.2 L614.1 367.2 L615.0 364.5 L623.2 359.5 L630.0 359.4 L653.8 347.9 L669.6 353.3 L678.6 362.1 L694.1 361.9 L703.1 364.8 L735.1 358.9 L746.9 352.4 L752.8 351.0 L762.7 344.6 L764.4 341.8 L770.8 341.0 L783.0 334.6 L786.5 335.9 L789.9 334.3 L806.0 338.7 L822.7 337.3 L848.0 330.6 L857.7 321.8 L856.6 324.4 L860.7 324.5 L864.0 327.6 L862.7 330.7 L864.2 336.3 L868.9 333.9 L875.9 333.2 L881.6 322.6 L886.3 318.0 L895.4 322.2 L898.8 319.6 L904.8 318.3 L913.5 322.7 L916.0 321.3 L923.7 327.1 L926.5 326.0 L929.6 328.5 L934.6 327.3 L940.1 330.0 L941.2 328.0 L945.7 326.8 L949.6 321.3 L954.9 321.9 L962.6 327.0 L963.0 331.9 L960.4 332.5 L958.2 336.1 L961.9 344.0 L964.6 345.3 L966.8 340.1 L975.3 336.1 L981.1 330.4 L989.0 333.4 L987.5 327.8 L990.6 324.4 L989.6 322.4 L978.7 313.7 L980.3 303.4 L978.0 298.9 L980.6 296.3 L978.9 292.4 L976.3 291.2 L972.7 292.5 L971.8 289.9 L969.0 288.6 L969.3 286.7 L960.1 284.5 L962.6 275.4 L968.9 267.2 L969.1 260.9 L975.1 254.6 L971.8 251.6 L967.8 253.2 L964.4 251.0 L965.5 238.7 L962.0 229.6 L964.7 223.8 L959.6 217.9 L957.5 211.6 L959.6 209.7 L958.4 206.2 L960.4 204.9 L959.6 202.0 L953.8 197.4 L954.2 192.3 L950.2 185.9 L953.3 183.9 L955.1 185.4 L960.1 183.4 L963.3 186.1 L970.5 183.8 L970.1 174.3 L973.4 170.8 L972.9 165.9 L980.0 159.6 L990.1 169.7 L990.6 167.9 L984.3 158.9 L979.6 156.3 L977.3 151.5 L970.3 144.9 L961.6 141.7 L943.3 143.4 L931.5 138.1 L931.7 135.0 L933.9 133.5 L927.9 121.9 L929.2 117.3 L925.9 114.0 L930.0 110.6 L935.9 100.7 L935.8 96.8 L932.3 89.2 L932.4 83.7 L921.5 77.2 L920.4 67.5 L916.6 65.6 L909.2 67.7 L907.4 62.5 L904.0 62.4 L908.4 59.0 L898.5 54.4 L892.2 46.0 L890.0 48.1 L887.2 46.1 L889.4 40.4 L877.1 40.4 L875.2 42.0 L875.4 45.7 L872.6 47.9 L872.9 50.3 L855.3 45.2 L848.4 46.6 L844.2 44.5 L837.0 50.6 L831.2 47.8 L831.2 46.4 L827.3 47.0 L822.3 44.6 L816.2 51.7 L797.5 63.7 L787.1 66.6 L771.1 76.4 L762.0 76.9 L753.4 83.6 L748.5 84.1 L744.1 79.7 L737.4 80.9 L730.1 77.1 L723.9 77.4 L717.5 71.9 L713.8 71.0 L706.0 74.5 L698.8 73.1 L695.2 75.5 L687.9 75.4 L676.5 81.1 L672.0 80.5 L668.4 83.0 L663.3 83.4 L636.1 79.0 L630.5 73.8 L631.7 70.4 L624.1 69.3 L619.5 76.2 L616.5 76.2 L604.8 68.8 L592.4 66.3 L591.3 59.9 L583.1 55.5 L572.9 52.9 L570.5 53.3 L565.5 61.3 L560.3 62.0 L551.7 55.0 L545.8 47.2 L545.8 39.2 L543.4 34.1 L535.5 29.8 L522.5 35.5 L515.2 36.0 L510.2 34.5 L499.1 28.1 L493.0 19.5 L494.2 13.0 L498.6 13.2 L497.7 10.4 L491.0 10.3 L490.3 7.7 L487.5 6.0 Z M21.6 128.6 L10.9 132.6 L8.0 137.2 L11.7 139.6 L25.3 136.8 L26.9 134.5 L24.5 134.6 L24.7 130.2 L21.6 128.6 Z M109.1 100.7 L103.4 102.5 L105.5 107.2 L109.0 107.4 L116.3 103.1 L109.1 100.7 Z",
    cities: {"İstanbul": [178.5, 78.5], "Ankara": [377.4, 149.7], "İzmir": [84.1, 249.3], "Bursa": [182.6, 132.5], "Antalya": [267.2, 349.5], "Adana": [503.6, 342.9], "Konya": [357.9, 285.5], "Gaziantep": [609.2, 338.3], "Trabzon": [729.2, 79.1], "Muğla": [146.7, 328.4], "Kayseri": [512.3, 228.8], "Mersin": [468.2, 355.4], "Eskişehir": [257.4, 159.6], "Kocaeli": [228.2, 94.3], "Denizli": [184.1, 291.5], "Samsun": [555.4, 60.0], "Balıkesir": [122.6, 168.1], "Sakarya": [250.3, 95.0], "Aydın": [120.0, 286.8], "Manisa": [99.0, 236.1], "Hatay": [546.7, 395.6], "Nevşehir": [472.3, 236.1], "Yalova": [193.8, 102.2], "Diyarbakır": [755.9, 282.9], "Erzurum": [808.7, 151.7], "Van": [916.9, 244.6]}
  },

  /* Live-activity map. The events are placeholder data with a real shape:
     one balloon per couple who just requested an offer or closed a deal.
     Wire to live per-district data later — see PROJECT.md. */
  liveMap: {
    title: "Düğün.com iş ortakları şu an ne yakalıyor?",
    info: "Bu haritada; canlı olarak Düğün.com üzerinden firmalara ulaşıp, teklif isteyen veya anlaşma sağlayan çiftlerin verisini görmektesiniz.",
    labels: { teklif: "teklif istedi", anlasma: "anlaşma sağladı" },
    events: [
      { city: "İstanbul", d: "Beykoz", cat: "Kır Düğünü", t: "teklif", ago: "az önce" },
      { city: "İstanbul", d: "Şişli", cat: "Balo ve Davet Salonu", t: "anlasma", ago: "2 dakika önce" },
      { city: "İstanbul", d: "Kadıköy", cat: "Düğün Salonu", t: "teklif", ago: "4 dakika önce" },
      { city: "İstanbul", d: "Sarıyer", cat: "Tarihi Mekan", t: "anlasma", ago: "6 dakika önce" },
      { city: "İstanbul", d: "Bakırköy", cat: "Otel Düğünü", t: "teklif", ago: "9 dakika önce" },
      { city: "İstanbul", d: "Üsküdar", cat: "Söz & Nişan Mekanı", t: "teklif", ago: "12 dakika önce" },
      { city: "Ankara", d: "Çankaya", cat: "Balo ve Davet Salonu", t: "teklif", ago: "1 dakika önce" },
      { city: "Ankara", d: "Gölbaşı", cat: "Kır Düğünü", t: "anlasma", ago: "5 dakika önce" },
      { city: "Ankara", d: "Keçiören", cat: "Düğün Salonu", t: "teklif", ago: "8 dakika önce" },
      { city: "Ankara", d: "Yenimahalle", cat: "Kına & Bekarlığa Veda", t: "teklif", ago: "14 dakika önce" },
      { city: "İzmir", d: "Çeşme", cat: "Kır Düğünü", t: "anlasma", ago: "3 dakika önce" },
      { city: "İzmir", d: "Karşıyaka", cat: "Düğün Salonu", t: "teklif", ago: "7 dakika önce" },
      { city: "İzmir", d: "Urla", cat: "Kır Düğünü", t: "teklif", ago: "11 dakika önce" },
      { city: "İzmir", d: "Bornova", cat: "Sosyal Tesis", t: "teklif", ago: "16 dakika önce" },
      { city: "Bursa", d: "Nilüfer", cat: "Balo ve Davet Salonu", t: "teklif", ago: "2 dakika önce" },
      { city: "Bursa", d: "Osmangazi", cat: "Düğün Salonu", t: "anlasma", ago: "6 dakika önce" },
      { city: "Bursa", d: "Mudanya", cat: "Kır Düğünü", t: "teklif", ago: "13 dakika önce" },
      { city: "Bursa", d: "Gemlik", cat: "Söz & Nişan Mekanı", t: "teklif", ago: "18 dakika önce" },
      { city: "Antalya", d: "Konyaaltı", cat: "Otel Düğünü", t: "anlasma", ago: "4 dakika önce" },
      { city: "Antalya", d: "Kepez", cat: "Düğün Salonu", t: "teklif", ago: "9 dakika önce" },
      { city: "Antalya", d: "Serik", cat: "Kır Düğünü", t: "teklif", ago: "15 dakika önce" },
      { city: "Antalya", d: "Muratpaşa", cat: "Balo ve Davet Salonu", t: "teklif", ago: "21 dakika önce" },
      { city: "Adana", d: "Seyhan", cat: "Düğün Salonu", t: "teklif", ago: "5 dakika önce" },
      { city: "Adana", d: "Çukurova", cat: "Kır Düğünü", t: "anlasma", ago: "10 dakika önce" },
      { city: "Adana", d: "Yüreğir", cat: "Balo ve Davet Salonu", t: "teklif", ago: "17 dakika önce" },
      { city: "Adana", d: "Sarıçam", cat: "Sosyal Tesis", t: "teklif", ago: "24 dakika önce" },
      { city: "Konya", d: "Selçuklu", cat: "Düğün Salonu", t: "teklif", ago: "3 dakika önce" },
      { city: "Gaziantep", d: "Şehitkamil", cat: "Balo ve Davet Salonu", t: "anlasma", ago: "8 dakika önce" },
      { city: "Trabzon", d: "Ortahisar", cat: "Kır Düğünü", t: "teklif", ago: "12 dakika önce" },
      { city: "Kayseri", d: "Melikgazi", cat: "Düğün Salonu", t: "teklif", ago: "19 dakika önce" },
      { city: "Samsun", d: "Atakum", cat: "Kır Düğünü", t: "teklif", ago: "7 dakika önce" },
      { city: "Muğla", d: "Bodrum", cat: "Kır Düğünü", t: "anlasma", ago: "11 dakika önce" },
      { city: "Diyarbakır", d: "Kayapınar", cat: "Düğün Salonu", t: "teklif", ago: "22 dakika önce" },
      { city: "Mersin", d: "Yenişehir", cat: "Balo ve Davet Salonu", t: "teklif", ago: "6 dakika önce" },
      { city: "Eskişehir", d: "Tepebaşı", cat: "Kır Düğünü", t: "teklif", ago: "14 dakika önce" },
      { city: "Denizli", d: "Merkezefendi", cat: "Düğün Salonu", t: "anlasma", ago: "20 dakika önce" }
    ]
  },

  /* Offer sources, reworded the way the Pro Start renewal karne words them.
     "Info Request" means nothing to a venue owner; "sayfanızdaki teklif formu"
     does. Keys are the raw first_lead_type values from Qlik. */
  leadTypes: {
    "Info Request": { t: "Teklif formu", d: "Çift, sayfanızdaki formu doldurup size yazdı" },
    "Call": { t: "Telefonla arama", d: "Çift, sayfanızdaki numaradan sizi aradı" },
    "Whatsapp": { t: "WhatsApp", d: "Çift, sayfanızdan WhatsApp ile ulaştı" },
    "WP": { t: "Düğün.com danışmanı", d: "Danışmanımız çiftle görüşüp sizi önerdi" },
    "Multi Lead": { t: "Benzer mekan önerisi", d: "Çift başka bir mekana yazarken size de gönderdi" },
    "Lead Pool": { t: "Talep havuzu", d: "Platform üzerinden toplu yönlendirme" }
  },

  /* Response channels, same treatment. */
  responseMethods: {
    "Telefon": "Telefonla aradınız",
    "Telefona Cevap": "Çiftin aramasına cevap verdiniz",
    "Sms": "SMS gönderdiniz",
    "E-mail": "E-posta gönderdiniz"
  },

  /* What the venue says it cares about, ticked during the discovery phase of
     the meeting. Each one has the answer the panel should lead with. */
  criteria: [
    { k: "talep", icon: "📥", t: "Daha çok talep",
      answer: "Simülatörde şehir + kategori + paket seçip aylık talep tahminini birlikte okuyun." },
    { k: "kalite", icon: "🎯", t: "Doğru çift profili",
      answer: "Bütçe, kapasite ve tarih filtreleriyle eşleşen çift gelir; Wedding Planner ekibi ayrıca eler." },
    { k: "butce", icon: "💰", t: "Bütçe / nakit akışı",
      answer: "Süre ve ödeme yapısı esnek: 6-12 ay, taksit, havale, parçalı çek, yıllık peşin avantajı." },
    { k: "gorunurluk", icon: "🔎", t: "Görünürlük",
      answer: "Paket (X) listedeki sıranızın tavanını, profil kalitesi de o tavana ne kadar yaklaştığınızı belirler." },
    { k: "marka", icon: "✨", t: "Marka algısı",
      answer: "Sektörün lideri olan platformda görünmek, çiftin gözünde referans etkisi yaratır." },
    { k: "haftaici", icon: "📅", t: "Hafta içi / gündüz doluluğu",
      answer: "Küçük ve gündüz organizasyonlara talep hızla artıyor; boş takvim günleri buradan doluyor." },
    { k: "sezon", icon: "🗓️", t: "Gelecek sezona hazırlık",
      answer: "Rezervasyon 6-12 ay önceden yapılıyor; listede olmadığınız her ay gelecek sezonun çiftidir." },
    { k: "rakip", icon: "👥", t: "Rakip takibi",
      answer: "Connect uygulamasındaki rakip analizi ile sektördeki sıranızı ve doğrudan rakiplerinizi görürsünüz." },
    { k: "kolaylik", icon: "📱", t: "Kolay yönetim",
      answer: "Connect uygulaması teklifi, randevuyu ve sonucu tek ekranda yönetir; sıradaki adımı size söyler." },
    { k: "destek", icon: "🤝", t: "Destek / danışmanlık",
      answer: "Size atanmış Portföy Yöneticisi ve satış eğitimleri paket ücretine dahildir." }
  ],

  /* ------------------------------------------------------- objections */
  objections: [
    {
      id: "instagram",
      tag: "Kanal",
      icon: "📱",
      title: "\"Instagram bana yetiyor.\"",
      hear: [
        "Instagram'dan zaten müşteri geliyor.",
        "İstediğim zaman, istediğim kadar reklam veriyorum.",
        "Instagram'ı kendim yönetiyorum, kolay."
      ],
      means: "Kontrolü elinde tutmak istiyor ve sabit bir gider taahhüdünden kaçınıyor. Genelde Instagram'ın <i>bilinirlik</i>, Düğün.com'un <i>satın alma niyeti</i> kanalı olduğunu ayırt etmemiş.",
      bridge: "Çok doğru — Instagram'ı bırakmanızı zaten istemiyoruz. Biz Instagram'ın rakibi değiliz; onu besleyen kanalız.",
      moves: [
        "<b>Rakip değiliz.</b> Düğün.com'daki profilinizden Instagram'ınıza geçiş butonu var. Bu geçişleri size anlık olarak bildirim olarak da gönderiyoruz. Sayfanızı gezen çift Instagram'ınıza da gidiyor — yani burada olmanız Instagram'ınızı da büyütüyor.",
        "<b>Çift Instagram'da mekan aramıyor; Google'da arıyor.</b> \"Kır düğünü mekanları\" yazan çift Instagram'a değil arama motoruna gidiyor. Orada üstte biz varız.",
        "<b>Instagram'da sizi bulmak için sizi zaten biliyor olması gerek.</b> Düğün.com'da sizi hiç duymamış çift de bulur — asıl büyüme oradan gelir.",
        "<b>Instagram reklamı kesildiğinde trafik biter.</b> Düğün.com'daki listeleme reklamı kapatınca kaybolmaz; arama sonucu olarak kalır ve organik trafiğiniz büyümeye devam eder."
      ],
      proof: [
        "Firma sayfanızdan Instagram'a geçen çift sayısını size aylık raporluyoruz.",
        "Sayfanızı açan çiftlerin ~%92'si Düğün.com kanallarından geliyor; kendi adınızla arayan yalnızca ~%8."
      ],
      tool: { label: "Trafik kırılımını göster", target: "sim" },
      avoid: "Instagram'ı küçümsemeyin. \"Instagram işe yaramaz\" dediğiniz an savunmaya geçer ve kapanış biter."
    },
    {
      id: "garanti",
      tag: "Risk",
      icon: "🎯",
      title: "\"Anlaşma yapacağımın garantisi yok.\"",
      hear: [
        "Para veriyorum ama düğün alacağım kesin değil.",
        "Bize garanti veriyor musunuz?",
        "Ya hiç talep gelmezse?"
      ],
      means: "Riski tek başına üstlenmek istemiyor. Aslında sorduğu şey: \"Ben ne yaparsam bu iş yürür?\"",
      bridge: "Haklısınız, kimse anlaşma garantisi veremez — biz de vermiyoruz. Verdiğimiz şey <b>talep</b>: kaç çift sizi görecek, kaç tanesi size yazacak. Onu da tahmin değil, veriyle söylüyoruz.",
      moves: [
        "<b>Garanti ettiğimiz kısım görünürlük ve talep.</b> Şehrinizdeki, kategorinizdeki, sizin paketinizdeki mekanların gerçek ortalamalarını size şimdi gösterebilirim.",
        "<b>Kalanı iki şeye bağlı:</b> profilinizin dolu olması ve gelen talebe hızlı dönmeniz. İkisi de sizin elinizde, ikisinde de PY'niz yanınızda.",
        "<b>Payınıza düşeni yapan mekanın talep almaması neredeyse imkânsız.</b> PY'nizin önerdiği adımları uygulayın; ilk aydan itibaren rakamları birlikte takip edelim.",
        "<b>Yatırımın geri dönüşü tek haneli anlaşmada.</b> 1-2 düğün genelde yıllık üyeliği karşılıyor; gerisi kâr."
      ],
      proof: [
        "Satış Simülatörü: şehir + kategori + paket seçin, aylık organik/plus talep tahminini birlikte okuyalım.",
        "Bella Wedding Antares: \"Düğün.com size müşteriyi yönlendirir. Satış yapıp yapmamak size kalmış!\""
      ],
      tool: { label: "Satış Simülatörü'nü aç", target: "sim" },
      avoid: "Sayısal garanti vermeyin (\"ayda şu kadar düğün alırsınız\"). Simülatör bir tahmin modelidir; taahhüt değildir — bunu açıkça söyleyin."
    },
    {
      id: "dolu",
      tag: "İhtiyaç",
      icon: "📅",
      title: "\"Günlerim zaten dolu.\"",
      hear: [
        "Sezonum kapalı, yeni müşteriye ihtiyacım yok.",
        "Cumartesilerim satılmış durumda.",
        "Zaten yetişemiyorum."
      ],
      means: "Bu bir itiraz değil, bir <i>övünç</i>. Onaylayın, sonra boşluğu gösterin: hafta içi, gündüz, ikinci sezon.",
      bridge: "Harika — bu zaten mekanınızın iyi olduğunun kanıtı. Peki hafta içi ve gündüz saatleriniz de dolu mu?",
      moves: [
        "<b>Boş kalan gün, geri gelmeyen gelirdir.</b> Cumartesi akşamı dolu olabilir; ama hafta içi, gündüz ve pazar günleri çoğu mekanda boş kalıyor.",
        "<b>Çiftlerin talebi değişti.</b> Büyük gece düğünlerinin yanında daha küçük, gündüz ve hafta içi organizasyonlar hızla artıyor. Bu talebi karşılayan mekan takvimini ikinci kez dolduruyor.",
        "<b>Bu bir sezonluk anlaşma değil.</b> Bugün konuştuğumuz çift gelecek sezonun çifti. Rezervasyon 6-12 ay önceden yapılıyor; gelecek sezona bugünden hazırlanmazsanız aynı yerde olursunuz.",
        "<b>Doluluk fiyat gücüdür.</b> Talep akışı olan mekan iskonto yapmak zorunda kalmaz; seçen taraf olur."
      ],
      proof: [
        "Simülatördeki mevsimsellik grafiği: kış ayları ve sonbahar yoğun; boş dönemlerinizi de bu grafikle konuşun.",
        "Çamlıca Köşk: \"Düğün.com sayesinde 1 mekandan 8 mekana çıktık!\""
      ],
      tool: { label: "Simülatörde mevsimselliği göster", target: "sim" },
      avoid: "\"O zaman size gerek yok\" gibi geri çekilmeyin. Doluluk itirazı, en kolay dönen itirazdır."
    },
    {
      id: "deneyim",
      tag: "Güven",
      icon: "💬",
      title: "\"Daha önce kötü deneyim yaşadım / olumsuz şeyler duydum.\"",
      hear: [
        "Bir dönem üyeydik, verim alamadık.",
        "Tanıdığım bir mekan memnun kalmamış.",
        "Gelen çiftler ciddi değildi."
      ],
      means: "Somut bir olay ya da kulaktan dolma bir hikâye var. Önce dinleyin — savunmaya geçerseniz kapanış biter.",
      bridge: "Anlatır mısınız — tam olarak ne yaşandı, kim söyledi? Her deneyim kendine özgüdür ve dinlemeden cevap vermek istemiyorum.",
      moves: [
        "<b>Önce dinleyin, not alın, tekrar edin.</b> \"Doğru anladıysam, dönüşleriniz karşılıksız kalmış.\" Müşteri anlaşıldığını hissetmeden hiçbir argüman işlemez.",
        "<b>Sonra ayrıştırın.</b> Sorun talep <i>miktarında</i> mıydı, talep <i>kalitesinde</i> mi, yoksa dönüş sürecinde mi? Üçünün cevabı farklı.",
        "<b>Son 1-2 yılda ne değişti anlatın:</b> Connect uygulaması, rakip analizi, özel fiyat kampanyası, Wedding Planner yönlendirmesindeki çift başına teklif limiti — hepsi çift kalitesini ve takip disiplinini iyileştirmek için geldi.",
        "<b>Kanıtı üçüncü ağızdan verin.</b> Başarı hikâyeleri sayfasını birlikte açın; kendi şehrinden/kategorisinden bir firmayı gösterin."
      ],
      proof: [
        "dugun.com/isortagim/basari-hikayeleri — 20+ firma, isim ve kategori ile.",
        "Elite World Florya: \"Düğün.com'dan önce en büyük problemimiz, rakip sayımızın fazla olmasıydı.\""
      ],
      tool: { label: "Başarı hikâyelerini aç", target: "stories" },
      avoid: "\"Öyle bir şey olmaz\" demeyin. Yaşanmış bir olayı reddetmek güveni tamamen bitirir."
    },
    {
      id: "pahali",
      tag: "Fiyat",
      icon: "💸",
      title: "\"Pahalısınız.\"",
      hear: [
        "Bu rakam bize çok yüksek.",
        "Geçen sene bu kadar değildi.",
        "Rakip platformlar daha ucuz."
      ],
      means: "Fiyatı <i>gider</i> olarak görüyor, <i>yatırım</i> olarak değil. Rakamı düşürmeden önce, rakamı bir düğünün kârının yanına koyun.",
      bridge: "Rakamı tek başına konuşursak her yatırım pahalıdır. Bunu bir düğünün getirisiyle yan yana koyalım — beraber bakalım.",
      moves: [
        "<b>Fiyatı ödeme değil, geri dönüş üzerinden konuşun.</b> Aylık tutarı yazın, yanına ortalama bir düğünün cironuza katkısını yazın. Genelde 1-2 anlaşma yıllık üyeliği karşılar.",
        "<b>Talep başına maliyet.</b> Yıllık bedeli beklenen talep sayısına bölün. Çift başına maliyeti gördüğünde tartışma biter.",
        "<b>Alternatifin maliyeti.</b> Aynı çifte kendi reklamınızla ulaşmak isteseniz, Google ve Instagram reklam bütçesi + ajans + zaman ne kadar tutardı?",
        "<b>İndirime inmeden önce değer ekleyin.</b> Süre esnekliği, ödeme planı, ek kategori indirimi — kademe merdivenini önce yukarıdan aşağı kullanın."
      ],
      proof: [
        "Satış Simülatörü'ndeki \"TL / talep\" kolonu — paket başına çift maliyeti.",
        "Simülatördeki üyelik/yıl ve toplam talep/yıl karşılaştırması."
      ],
      tool: { label: "ROI tablosunu göster", target: "sim" },
      avoid: "İlk itirazda indirime koşmayın. İndirimi erken açmak, fiyatın şişik olduğunu itiraf etmektir."
    },
    {
      id: "butce",
      tag: "Nakit",
      icon: "🧾",
      title: "\"Şu an param yok / riske girmek istemiyorum.\"",
      hear: [
        "Sezon sonu, nakit akışım sıkışık.",
        "Bu kadar parayı bir anda veremem.",
        "Önce bir deneyeyim, olursa devam ederim."
      ],
      means: "Fiyat değil, <b>nakit akışı</b> ve <b>taahhüt süresi</b> sorunu. Çözüm indirim değil, doğru ödeme yapısı.",
      bridge: "O zaman rakamı değil, ödeme şeklini konuşalım. Farklı süre ve ödeme seçeneklerimiz var; işletmenizin nakit akışına uyanı birlikte seçelim.",
      moves: [
        "<b>Süreyi esnetin.</b> 6 aylık ve 12 aylık seçenekler farklı aylık tutarlara denk gelir; uzun süre aylık maliyeti düşürür.",
        "<b>Ödeme yöntemini esnetin.</b> Kredi kartına taksit, havale ya da vadeli çek — çekte parçalı vade seçenekleri var.",
        "<b>Peşin avantajını gösterin.</b> Yıllık peşin ödemede ek indirim devreye giriyor; nakdi olan firma için en ucuz yol bu.",
        "<b>Geri dönüş takvimini kurun.</b> İlk anlaşma genelde ilk 2-3 ay içinde geliyor; ödeme planını o takvimin üstüne oturtun."
      ],
      proof: [
        "Paket sayfasındaki süre × ödeme yöntemi tablosu.",
        "Çek vadeleri: Pro Start 6 → 60-90-120 gün, Pro Start 12 → 60-90-120-150 gün."
      ],
      tool: { label: "Paket ve ödeme seçeneklerini aç", target: "packages" },
      avoid: "\"Bütçeniz yoksa konuşmayalım\" demeyin. Bu itiraz kapanışa en yakın itirazdır — kapanmaya hazır ama yolu tıkalı."
    },
    {
      id: "dusuneyim",
      tag: "Karar",
      icon: "🤔",
      title: "\"Düşüneyim / ortağıma sorayım.\"",
      hear: [
        "Bir düşünelim, size dönerim.",
        "Eşimle/ortağımla konuşmam lazım.",
        "Şimdi karar veremem."
      ],
      means: "Ya karar mercii masada değil, ya da cevaplanmamış bir soru kaldı. İkisini de şimdi öğrenmelisiniz.",
      bridge: "Tabii ki. Yalnız şunu netleştirelim: aklınıza takılan bir konu mu var, yoksa kararı birlikte vereceğiniz biri mi var?",
      moves: [
        "<b>Karar mercii kim, öğrenin.</b> \"Karar sizde mi, yoksa X Bey/Hanım da mı onaylayacak?\" Cevabı bilmeden ikinci görüşme kurulamaz.",
        "<b>Gerçek itirazı çıkarın.</b> \"Bugün imzalamayı düşünmenizi engelleyen tek şey ne olurdu?\" Genelde asıl itiraz burada söylenir.",
        "<b>Kararı boşlukta bırakmayın.</b> Somut bir tarih ve saat alın; \"size dönerim\" kapanmamış görüşmedir.",
        "<b>Karar merciine gidecek özet bırakın.</b> Ekrandaki tabloyu ya da simülatör sonucunu gönderin; kulaktan anlatılan teklif erir."
      ],
      proof: [
        "Görüşme sonunda karne/simülatör çıktısını WhatsApp'tan gönderin — teklif, ortağa sizin ağzınızdan gitsin."
      ],
      tool: { label: "Görüşme akışını aç", target: "flow" },
      avoid: "\"Tamam, bekliyorum\" deyip kapatmayın. Tarihi olmayan takip, takip değildir."
    },
    {
      id: "zaman",
      tag: "Zamanlama",
      icon: "⏳",
      title: "\"Şimdi sırası değil, sezon başında konuşalım.\"",
      hear: [
        "Sezon bitti, gelecek yıl bakarız.",
        "Şu an yoğunum, sonra arayın.",
        "Kışın konuşalım."
      ],
      means: "Aciliyet hissi yok. Aciliyeti siz değil, çiftin rezervasyon takvimi kurar.",
      bridge: "Aslında tam da bu yüzden şimdi konuşmamız gerekiyor — çünkü çift, düğününden aylar önce karar veriyor.",
      moves: [
        "<b>Çift takvimi işletme takvimine uymuyor.</b> Rezervasyonlar genelde 6-12 ay önceden yapılıyor; sezon başında listeye girmek, o sezonun çiftlerini kaçırmış olmak demek.",
        "<b>Sıralama bir günde oluşmuyor.</b> Sayfa geçmişi, yorum sayısı ve talep hareketi zamanla birikiyor. Geç başlayan mekan ilk aylarını ısınmaya harcıyor.",
        "<b>Rakipleriniz şu an listede.</b> Aynı çift bugün listeye bakıyor ve sizi görmüyor.",
        "<b>Boş dönem hazırlık dönemidir.</b> Yoğun sezonda profil düzenlemeye vakit bulamazsınız; şimdi kurun, sezonda sadece talebi karşılayın."
      ],
      proof: [
        "Simülatördeki aylık talep grafiği: kış ayları ve sonbahar yoğun — \"ölü sezon\" diye bir şey yok."
      ],
      tool: { label: "Mevsimsellik grafiğini aç", target: "sim" },
      avoid: "Görüşmeyi tarihsiz ertelemeyin. Ertelenen görüşmenin dönüş oranı çok düşer."
    },
    {
      id: "kalabalik",
      tag: "Rekabet",
      icon: "👥",
      title: "\"Orada çok firma var, kaybolurum.\"",
      hear: [
        "Yüzlerce mekan listelenmiş, beni kim görecek?",
        "Rakiplerim de orada, fark yaratamam.",
        "Küçük bir mekanım, büyüklerle yarışamam."
      ],
      means: "Görünürlüğün rastgele dağıldığını sanıyor. Oysa listede sıra, ölçülebilir kriterlere göre belirleniyor.",
      bridge: "Kalabalık olması iyi haber aslında — çünkü çift alternatifleri görmek için oraya geliyor. Asıl mesele listede nerede durduğunuz, ve o sıra tesadüf değil.",
      moves: [
        "<b>Sıra kriterlere bağlı:</b> paketiniz (görünürlük katsayısı), profil doluluğunuz, dönüş hızınız, yorumlarınız ve kampanyalarınız. Hepsi ölçülüyor, hepsi geliştirilebilir.",
        "<b>Rakip analizi elinizde.</b> Connect uygulamasında sektördeki sıranızı ve doğrudan rakiplerinizi görüyorsunuz. Karanlıkta yarışmıyorsunuz.",
        "<b>Küçük mekan dezavantaj değil.</b> Çiftler bütçe ve kapasiteye göre filtreliyor; sizin segmentinizdeki çift, büyük mekanı zaten aramıyor.",
        "<b>Listede olmamak görünmemektir.</b> Kalabalıktan çekilmenin yolu listeden çıkmak değil, listede yükselmek."
      ],
      proof: [
        "Connect → İstatistikler → Rakip Analizi: sektördeki konumunuz, doğrudan rakipleriniz, çiftlerin anlaştığı diğer firmalar.",
        "Simülatörde \"Kaldıraçlar\" tablosu: paket, profil kalitesi, dönüş süresi ve dönüş oranının talebe etkisi."
      ],
      tool: { label: "Kaldıraçlar tablosunu aç", target: "sim" },
      avoid: "\"Rakipleriniz de burada\" cümlesini tehdit tonuyla kurmayın; bilgi olarak verin."
    }
  ],

  /* --------------------------------------------------------- meeting flow */
  flow: {
    newSale: {
      title: "Yeni satış görüşmesi — 6 adım",
      lead: "Deneyimi az bir arkadaşımız da bu sırayı takip ederse görüşme dağılmaz. Her adımın süresi tahminidir.",
      steps: [
        { t: "Tanışma ve teşhis", m: "5 dk", d: "Mekanı, kapasiteyi, sezonu ve şu anki müşteri kaynağını sorun. <b>Konuşmayın, not alın.</b>",
          ask: ["Şu an çiftler size en çok hangi kanaldan ulaşıyor?", "Hafta içi ve gündüz doluluğunuz nasıl?", "Gelen taleplere kim, ne kadar sürede dönüyor?"] },
        { t: "Otorite kurma", m: "5 dk", d: "Düğün.com'u tanıtın: 19 yıl, 400.000+ çift, Google'da liderlik. AVM benzetmesini burada kullanın.",
          ask: ["Düğün.com'u daha önce kullandınız mı?"] },
        { t: "FOMO ve kanıt", m: "5 dk", d: "Aynı şehir/kategoriden bir başarı hikâyesi açın. Rakiplerin listede olduğunu bilgi olarak verin.",
          ask: ["Sizin segmentinizde hangi mekanları rakip görüyorsunuz?"] },
        { t: "Simülasyon", m: "10 dk", d: "Satış Simülatörü'nü açın; şehir, kategori, paket ve profil kalitesini birlikte seçin. Rakamı siz değil, ekran söylesin.",
          ask: ["Bu talep sayısı size ne ifade ediyor?", "Bunların kaçını anlaşmaya çevirirsiniz?"] },
        { t: "Teklif ve kapanış", m: "10 dk", d: "Paketi ve ödeme planını yazın. Liste fiyatını yazıp üstünü çizin, indirimli fiyatı yazın. Beyaz tahtayı kullanın.",
          ask: ["Bu plan nakit akışınıza uyuyor mu?", "Bugün başlatmamıza engel bir konu var mı?"] },
        { t: "İtiraz ve imza", m: "10 dk", d: "İtiraz gelirse İtiraz Kütüphanesi'nden ilgili kartı açın. İtiraz karşılandıktan sonra <b>tekrar kapanışa gidin.</b>",
          ask: ["Netleştirmemi istediğiniz başka bir konu var mı?"] }
      ]
    },
    renewal: {
      title: "Yenileme görüşmesi — 6 adım",
      lead: "Yenilemede sunum değil, muhasebe yapılır: geçen dönem ne oldu, önümüzdeki dönem ne olacak.",
      steps: [
        { t: "Hazırlık (görüşmeden önce)", m: "10 dk", d: "Yenileme sekmesinde firmayı açın. PY notunu, churn riskini ve zayıf metrikleri okuyun. <b>Sunum Modu'nu görüşmeden önce açın</b> — iç notlar müşteriye görünmesin.",
          ask: [] },
        { t: "Teşekkür ve kutlama", m: "5 dk", d: "Önce iyi giden metrikleri gösterin. Ortalamanın üstündeki her metriği tek tek söyleyin.",
          ask: ["Geçen sezon sizin açınızdan nasıl geçti?"] },
        { t: "Karne okuma", m: "10 dk", d: "Görünürlük → sayfa → talep → dönüş → anlaşma sırasıyla ilerleyin. Zayıf halkayı birlikte bulun.",
          ask: ["Gelen taleplere dönüşü kim yapıyor?", "Dönüş süreniz neden uzamış olabilir?"] },
        { t: "Aksiyon listesi", m: "5 dk", d: "\"Daha iyi olabilirdi\" kartlarını tek tek okuyun. Her biri için sorumlu ve tarih belirleyin.",
          ask: ["Bunlardan hangisini önümüzdeki 2 hafta içinde yapabilirsiniz?"] },
        { t: "Upsell simülasyonu", m: "10 dk", d: "PWF simülatörünü açın; paket yükseltmenin görünürlüğe etkisini gösterin. Profil iyileştirmenin etkisini de ayrı gösterin.",
          ask: ["Görünürlüğünüzü artırırsak bu talebi karşılayabilir misiniz?"] },
        { t: "Yenileme teklifi", m: "10 dk", d: "Yeni dönem paketini ve ödeme planını yazın. Geçen dönemin talep başına maliyetini yeni teklifle karşılaştırın.",
          ask: ["Yeni dönemi hangi paketle açalım?"] }
      ]
    }
  },

  /* -------------------------------------------------- objection quick tips */
  tips: [
    "İtiraz reddedilmez, <b>köprü kurulur</b>: önce onaylayın, sonra çevirin.",
    "Rakamı siz söylemeyin — ekran söylesin. Simülatör tarafsız bir üçüncü kişidir.",
    "İndirim son karttır. Önce süre, ödeme planı ve ek kategori.",
    "Her itirazdan sonra <b>tekrar kapanışa gidin</b>. Cevaplayıp susmak satışı bitirir.",
    "\"Size dönerim\" bir cevap değildir. Tarih ve saat alın.",
    "Çift 4-6 mekana birden yazıyor; dönüş hızı en ucuz rekabet avantajıdır.",
    "Sunum Modu'nu müşterinin yanına oturmadan önce açın."
  ]
};
