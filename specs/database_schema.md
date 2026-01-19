# Database Schema Specifications

Bu proje veritabanı olarak yerel JSON dosyalarını kullanır.

## 1. Events Database (`database/events_database.json`)
Siteden çekilen ve işlenen etkinlik verilerini tutar.

**Format:** Array of Objects `Event[]`

| Alan (Field) | Tip     | Zorunlu | Açıklama                                      |
|--------------|---------|---------|-----------------------------------------------|
| `title`      | String  | Evet    | Etkinliğin başlığı.                           |
| `description`| String  | Hayır   | Etkinlik detayları (max 200 char kesilir).    |
| `date`       | String  | Evet    | Orijinal metin veya Timestamp.                |
| `url`        | String  | Evet    | Etkinliğin detay linki.                       |
| `type`       | String  | Evet    | Enum: `CTF`, `CONFERENCE`, `Physical`, `Online`|

**Örnek JSON Yapısı:**

    [
      {
        "title": "Global Cyber CTF",
        "description": "Capture the Flag yarışması...",
        "date": "1738450000000",
        "url": "[https://example.com](https://example.com)",
        "type": "CTF"
      }
    ]

## 2. Webhooks Database (`database/webhooks.json`)
Kullanıcıların abone olduğu Discord Webhook URL'lerini tutar.

**Format:** Array of Strings `String[]`

**Örnek JSON Yapısı:**

    [
      "[https://discord.com/api/webhooks/12345/abcde](https://discord.com/api/webhooks/12345/abcde)...",
      "[https://discord.com/api/webhooks/67890/fghij](https://discord.com/api/webhooks/67890/fghij)..."
    ]