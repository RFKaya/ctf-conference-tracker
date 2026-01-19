const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { logger } = require('./loggerService'); // Logger servisini import ettiğinizden emin olun

// Webhooks dosyasının yolu (services klasöründen bir üst dizine, oradan database klasörüne)
const WEBHOOKS_FILE = path.join(__dirname, '../database/webhooks.json');

// Yardımcı: Renk Seçici
function getColorByType(type) {
  if (type === 'CTF') return 0xdc2626;        // Kırmızı
  if (type === 'CONFERENCE') return 0x2563eb; // Mavi
  if (type === 'Physical') return 0x059669;   // Yeşil
  return 0x020617;                            // Varsayılan Koyu
}

// Yardımcı: Metin Kısaltma
function truncate(str, maxLength) {
  if (!str) return "Açıklama yok.";
  return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
}

// Yardımcı: Webhook Listesini Dosyadan Oku
function getWebhooks() {
  try {
    if (!fs.existsSync(WEBHOOKS_FILE)) {
      logger("error", "Webhooks dosyası bulunamadı! Lütfen database/webhooks.json oluşturun.");
      return [];
    }
    const rawData = fs.readFileSync(WEBHOOKS_FILE, 'utf-8');
    const webhooks = JSON.parse(rawData);

    if (!Array.isArray(webhooks)) {
      logger("error", "Webhooks dosyası bir dizi (array) formatında olmalı.");
      return [];
    }
    return webhooks;
  } catch (error) {
    logger("error", `Webhook okuma hatası: ${error.message}`);
    return [];
  }
}

async function notification(newItems) {
  // 1. Yeni etkinlik var mı kontrol et
  if (!Array.isArray(newItems) || newItems.length === 0) {
    return; // Sessizce çık
  }

  // 2. Webhook listesini çek
  const webhookUrls = getWebhooks();
  if (webhookUrls.length === 0) {
    logger("notification", "Hiçbir webhook adresi tanımlı değil, bildirim gönderilmiyor.");
    return;
  }

  logger("notification", `${webhookUrls.length} kanala ${newItems.length} yeni etkinlik bildirilecek...`);

  // 3. Veriyi 10'arlı gruplara böl (Discord Embed Limiti)
  const chunkSize = 10;

  for (let i = 0; i < newItems.length; i += chunkSize) {
    const chunk = newItems.slice(i, i + chunkSize);

    // A. Embedleri Hazırla (Payload oluştur)
    // Bu işlemi döngü dışında yapıyoruz ki her webhook için tekrar tekrar hesaplamayalım.
    const embeds = chunk.map(item => ({
      title: item.title,
      url: item.url,
      description: truncate(item.description, 200),
      color: getColorByType(item.type),
      fields: [
        {
          name: '📅 Tarih',
          // item.date sayısal timestamp ise Date nesnesine çeviriyoruz
          value: new Date(Number(item.date) || item.date).toLocaleDateString('tr-TR') || 'Belirsiz',
          inline: true
        },
        {
          name: '🏷️ Tür',
          value: item.type || 'Diğer',
          inline: true
        }
      ]
    }));

    const payload = {
      content: i === 0 ? `🚨 **${newItems.length} Yeni Siber Güvenlik Etkinliği Tespit Edildi!**` : null,
      username: 'ctf-conference-tracker',
      avatar_url: 'https://cdn-icons-png.flaticon.com/512/4712/4712035.png',
      embeds: embeds
    };

    // B. Her Webhook Adresine Gönder
    // Promise.all kullanarak tüm webhooklara aynı anda (paralel) istek atıyoruz
    const sendPromises = webhookUrls.map(async (url) => {
      try {
        await axios.post(url, payload);
        return { status: 'success', url };
      } catch (error) {
        // Bir webhook patlarsa diğerleri etkilenmesin diye hatayı yakalıyoruz
        logger("error", `Webhook gönderim hatası (${url.slice(0, 20)}...): ${error.message}`);
        return { status: 'error', url };
      }
    });

    await Promise.all(sendPromises);

    logger("notification", `${chunk.length} adetlik paket tüm kanallara işlendi.`);

    // Rate limit önlemi (1 saniye bekle)
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

module.exports = { notification };