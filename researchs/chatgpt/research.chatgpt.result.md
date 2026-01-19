infosec-conferences.com bir dizin sitesi ve Black Hat ile DEF CON gibi büyük siber güvenlik konferanslarını listeliyor

Black Hat: profesyonel, kurumsal, teknik derinliği yüksek bir siber güvenlik konferansı

DEF CON: topluluk ve hacker kültürü odaklı, yarışmalar ve village’larla öne çıkan konferans

Takvim sistemleri için timestamp kullanmak doğru, ama timezone bilgisini ayrı tutmak şart

En sağlam mimari: UTC timestamp + IANA timezone (Europe/Istanbul gibi)

ISO 8601 (2026-01-22T22:00:00+00:00) makine dostu ve güvenli, ana veri olarak kullanılmalı

“19th January 2026” gibi formatlar sadece gösterim (UI) için uygun, veri olarak riskli

Tarih/saat sıralaması string ile değil sayı (timestamp) ile yapılmalı

Node.js’te ISO tarihleri Date → getTime() ile timestamp’a çevirip sıralamak en güvenlisi

ISO string ile doğrudan string sıralama sadece tüm veriler strict ISO ise çalışır, prod için önerilmez

Sıralama her zaman UTC’ye göre, gösterim kullanıcı lokal saatine göre yapılmalı

Uzun vadede recurring event, DST ve timezone sorunlarını önlemenin tek yolu bu yapı