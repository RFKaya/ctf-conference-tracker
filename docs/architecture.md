# System Architecture

Bu proje, siber güvenlik etkinliklerini (CTF, Konferans) takip eden, filtreleyen ve Discord üzerinden bildiren bir otomasyon sistemidir.

## Sistem Akışı (Workflow)

1. **Scraper (Veri Toplayıcı):**
   - `services/ctfService.js` ve `conferenceService.js` belirli aralıklarla hedef sitelere gider.
   - Axios ile HTML çeker, Cheerio ile parse eder.
   - Ham veriyi temizler (Tarih formatlama, boşluk silme).

2. **Data Processor (Veri İşleyici - `client.js`):**
   - `setInterval` ile her 30 dakikada bir çalışır.
   - Yeni çekilen veriyi, `events_database.json` ile karşılaştırır.
   - **Unique Key:** `Title` + `Date` kombinasyonu benzersiz kimlik kabul edilir.
   - Eğer yeni veri varsa, bunu `newItems` dizisine ekler.

3. **Notification Service (Bildirim Servisi):**
   - `services/notificationService.js` devreye girer.
   - `webhooks.json` dosyasındaki tüm URL'leri okur.
   - Yeni etkinlikleri 10'arlı paketlere (chunk) böler (Discord Embed limiti).
   - `Promise.all` ile tüm kanallara aynı anda bildirim gönderir.

4. **Frontend (Kullanıcı Arayüzü):**
   - **Express & EJS:** Sunucu taraflı render (SSR) yapar.
   - **Client-Side:** Filtreleme, Sıralama ve Arama işlemleri tarayıcıda JavaScript ile yapılır (Sunucuyu yormaz).
   - **Abonelik:** Kullanıcı arayüzden webhook ekleyebilir.

## Dosya Yapısı

- `client.js`: Ana sunucu ve Cron job mantığı.
- `services/`: İş mantığını tutan servisler.
- `views/`: EJS şablon dosyaları.
- `database/`: JSON veri dosyaları.