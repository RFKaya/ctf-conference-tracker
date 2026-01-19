# Deployment Guide (Kurulum Rehberi)

Bu projeyi bir sunucuda (VPS, Heroku, DigitalOcean vb.) 7/24 çalıştırmak için aşağıdaki adımları izleyin.

## Gereksinimler
- Node.js (v16 veya üzeri)
- NPM

## Kurulum

1. Bağımlılıkları yükleyin:

    npm install

2. `database` klasörünün yazma iznine sahip olduğundan emin olun.

## Production (Canlı) Ortamda Çalıştırma

Uygulamanın terminal kapansa bile çalışmaya devam etmesi için **PM2** kullanılması önerilir.

1. PM2 Yükle:

    npm install -g pm2

2. Uygulamayı Başlat:

    pm2 start client.js --name "ctf-conference-tracker"

3. Logları İzle:

    pm2 logs ctf-conference-tracker

4. Sunucu yeniden başlarsa otomatik açılması için:

    pm2 startup
    pm2 save