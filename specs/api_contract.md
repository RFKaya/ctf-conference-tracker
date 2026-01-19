# API Specifications

Bu döküman, projenin hem sunduğu (Internal) hem de tükettiği (External) API servislerini tanımlar.

## A. Internal APIs (Kendi Servislerimiz)

### 1. Webhook Aboneliği

Kullanıcının sisteme yeni bir Discord Webhook'u kaydetmesini sağlar.

- **Endpoint:** `POST /api/subscribe`
- **Content-Type:** `application/json`

#### İstek (Request) Body

    {
      "webhookUrl": "https://discord.com/api/webhooks/..."
    }

#### Başarılı Yanıt (Success Response)
- **Status:** `200 OK`

    {
      "success": true,
      "message": "Başarıyla kaydedildi!"
    }

#### Hata Yanıtları (Error Responses)
- **400 Bad Request:** Geçersiz URL formatı.
- **409 Conflict:** Bu URL zaten kayıtlı.

---

## B. External APIs & Sources (Veri Kaynakları)

Proje, etkinlik verilerini toplamak için aşağıdaki dış kaynakları kullanır.

### 1. CTFTime API (CTF Yarışmaları)
Dünya genelindeki CTF yarışmalarını çekmek için kullanılır.

- **Base URL:** `https://ctftime.org/api/v1`
- **Method:** `GET`
- **Endpoint:** `/events/`

#### Parametreler
| Parametre | Tip     | Açıklama                                      | Örnek Değer   |
|-----------|---------|-----------------------------------------------|---------------|
| `limit`   | Integer | Çekilecek maksimum etkinlik sayısı.           | `100`         |
| `start`   | Unix TS | Başlangıç zamanı (Timestamp).                 | `1706745600`  |
| `finish`  | Unix TS | Bitiş zamanı (Timestamp).                     | `1709164800`  |

#### Örnek İstek URL

    https://ctftime.org/api/v1/events/?limit=100&start=1706745600&finish=1709164800

#### Beklenen Yanıt Formatı (JSON)

    [
      {
        "title": "DefCon CTF Quals",
        "description": "...",
        "start": "2026-05-15T00:00:00+00:00",
        "url": "https://ctftime.org/event/2000",
        "format": "Jeopardy"
      }
    ]

### 2. Infosec Conferences (Konferanslar)
Bu kaynağın halka açık bir JSON API'si yoktur. Veriler HTML Scraping yöntemi ile elde edilir.

- **Hedef URL:** `https://infosec-conferences.com/`
- **Kütüphaneler:** `Axios` (HTML İndirme) + `Cheerio` (HTML Parse Etme)
- **Hedef Elementler:**
    - Kart Yapısı: `div` veya `article`
    - Başlık: `h3` veya `h4`
    - Tarih: Regex ile ayrıştırılır `(\d{1,2}(?:st|nd|rd|th)?\s+[A-Za-z]+\s+\d{4})`