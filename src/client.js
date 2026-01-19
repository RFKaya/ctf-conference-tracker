const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');

const { getCTFData } = require('./services/ctfService');
const { getConferenceData } = require('./services/conferenceService');
const { logger } = require('./services/loggerService');
const { notification } = require('./services/notificationService');

// Ayarlar
const DB_FILE = path.join(__dirname, './database/events_database.json'); // Veritabanı dosya yolu
const CHECK_INTERVAL = 60 * 1000; // 1 Dakika (Milisaniye cinsinden)

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json()); // Gelen JSON verisini okumak için şart

// --- YARDIMCI FONKSİYONLAR ---

// 1. Tüm Verileri Çeken Fonksiyon
async function getEvents() {
  try {
    const [ctfs, conferences] = await Promise.all([
      getCTFData(),
      getConferenceData()
    ]);
    return [...ctfs, ...conferences];
  } catch (error) {
    logger("system", "Veri çekme hatası:", error.message);
    return [];
  }
}

// 2. Arka Plan Takip Sistemi (CRON benzeri yapı)
async function startBackgroundWorker() {
  logger("notification", "Arka plan takip sistemi başlatıldı.");

  // İlk açılışta bir kez çalıştır
  await checkAndNotify();

  // Belirli aralıklarla tekrar et
  setInterval(async () => {
    await checkAndNotify();
  }, CHECK_INTERVAL);
}

// 3. Karşılaştırma ve Kayıt Mantığı
async function checkAndNotify() {
  logger("notification", "Yeni etkinlikler kontrol ediliyor...");

  // A. Güncel veriyi internetten çek
  const currentEvents = await getEvents();
  if (currentEvents.length === 0) return; // Veri çekilemediyse dur

  // B. Eski veriyi dosyadan oku
  let savedEvents = [];
  if (fs.existsSync(DB_FILE)) {
    try {
      const rawData = fs.readFileSync(DB_FILE, 'utf-8');
      savedEvents = JSON.parse(rawData);
    } catch (e) {
      logger("notification", "Database okuma hatası, boş kabul ediliyor.");
    }
  }

  // C. YENİ VERİ TESPİTİ
  // Mantık: Şu anki listede olup, kayıtlı listede OLMAYANLARI bul.
  // Karşılaştırma kriteri olarak Title ve Date kullanıyoruz (Benzersizlik için)
  const newItems = currentEvents.filter(current => {
    return !savedEvents.some(saved =>
      saved.title === current.title && saved.date === current.date
    );
  });

  // D. Yeni veri varsa bildir ve kaydet
  if (newItems.length > 0) {
    logger("notification", `⚠️ ${newItems.length} ADET YENİ ETKİNLİK BULUNDU!`);

    // 1. Bildirim servisine gönder
    // notification servisine array olarak gönderiyoruz
    try {
      await notification(newItems);
    } catch (err) {
      console.error(err.message);
    }

  } else {
    logger("notification", "Yeni etkinlik bulunamadı.");
  }

  // E. Veritabanını Güncelle (Her zaman en güncel halini yazıyoruz)
  // Böylece silinen etkinlikler db'den de silinir, yeniler eklenir.
  fs.writeFileSync(DB_FILE, JSON.stringify(currentEvents, null, 2));
  logger("notification", "Veritabanı güncellendi.");
}

// --- ROTA ---
app.get('/', async (req, res) => {
  logger("client", "Ana sayfa isteği alındı.");

  try {
    // İPUCU: Artık veriyi her seferinde internetten çekmek yerine
    // dilersen db dosyasından da okuyabilirsin. Ama şimdilik canlı çekiyoruz.
    const allEvents = await getEvents();

    logger("client", `Toplam ${allEvents.length} etkinlik render ediliyor...`);

    const availableTypes = ['ALL', ...new Set(allEvents.map(e => e.type))];

    res.render('index', {
      events: allEvents,
      types: availableTypes
    });

  } catch (error) {
    console.error("Ana sayfa yükleme hatası:", error.message);
    res.status(500).send("Sunucu hatası oluştu.");
  }
});

// Webhook dosyasının yolu
const WEBHOOKS_FILE = path.join(__dirname, 'database/webhooks.json');

// --- ROTA KISMININ HEMEN ÜSTÜNE ŞU API ENDPOINT'İ EKLE ---

// Yeni Webhook Kayıt Endpoint'i
app.post('/api/subscribe', (req, res) => {
  const { webhookUrl } = req.body;

  // 1. Basit Doğrulama
  if (!webhookUrl || !webhookUrl.startsWith('https://discord.com/api/webhooks/')) {
    return res.status(400).json({ success: false, message: 'Geçersiz Discord Webhook Linki.' });
  }

  try {
    // 2. Dosyayı Oku (Yoksa oluştur)
    let webhooks = [];
    if (fs.existsSync(WEBHOOKS_FILE)) {
      const rawData = fs.readFileSync(WEBHOOKS_FILE, 'utf-8');
      webhooks = JSON.parse(rawData);
    }

    // 3. Tekrar Kontrolü (Aynı linki 2 kere eklemesin)
    if (webhooks.includes(webhookUrl)) {
      return res.status(409).json({ success: false, message: 'Bu webhook zaten kayıtlı.' });
    }

    // 4. Ekle ve Kaydet
    webhooks.push(webhookUrl);

    // Klasör yoksa oluştur (database klasörü silinirse hata vermesin diye)
    const dir = path.dirname(WEBHOOKS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    fs.writeFileSync(WEBHOOKS_FILE, JSON.stringify(webhooks, null, 2));

    logger("client", "Yeni bir webhook abonesi eklendi.");
    return res.json({ success: true, message: 'Başarıyla kaydedildi!' });

  } catch (error) {
    console.error("Webhook kayıt hatası:", error);
    return res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

// Sunucuyu Başlat
const PORT = 3000;
app.listen(PORT, () => {
  console.log("------------------------------------------");
  console.log(`🛡️  Cyber Tracker: http://localhost:${PORT}`);
  console.log("------------------------------------------");

  // Sunucu ayağa kalkınca takip sistemini de başlat
  startBackgroundWorker();
});