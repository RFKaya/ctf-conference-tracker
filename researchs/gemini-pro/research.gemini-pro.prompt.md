Veri Çekme (Scraping): infosec-conferences.com adresinden etkinlik verilerini (Başlık, Tarih, Açıklama, Tür) Node.js, Axios ve Cheerio kullanarak çekme ve JSON formatına çevirme isteği. Hatalı seçicilerin debug edilmesi ve düzeltilmesi.

Web Arayüzü (Frontend): Çekilen verilerin listelendiği, Bootstrap 5 tabanlı, filtreleme (CTF/Konferans), arama ve sıralama özelliklerine sahip bir Express.js uygulaması isteği. "Client-side" filtreleme ile sayfa yenilenmeden işlem yapılması talebi.

Tasarım ve UX: Özel renk paleti (0f172a) ile karanlık tema (Dark Mode) tasarımı, CTF etkinlikleri için özel kırmızı tema, tıklanabilir kartlar ve detay popup (modal) penceresi eklenmesi. "Geçmişi Gizle" butonu talebi.

Backend ve Otomasyon: Verilerin yerel bir JSON veritabanına kaydedilmesi, periyodik olarak yeni veri kontrolü yapılması ve sadece yeni etkinliklerin tespit edilmesi.

Bildirim Sistemi: Tespit edilen yeni etkinliklerin Discord Webhook aracılığıyla (Embed formatında ve 10'lu paketler halinde) kanallara bildirilmesi.

Abonelik Sistemi: Arayüze "Gelişmeleri Takip Et" butonu eklenmesi ve kullanıcıların kendi Webhook adreslerini sisteme kaydedebilmesi (API Endpoint ve Frontend entegrasyonu).

Dökümantasyon: Proje için specs (Database şeması, API kontratı), docs (Mimari, Kurulum) klasörlerinin oluşturulması, package.json düzenlemesi ve detaylı bir README.md dosyasının yazılması.