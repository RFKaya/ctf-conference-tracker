const axios = require('axios');
const cheerio = require('cheerio');
const { logger } = require('./loggerService');

async function getConferenceData() {
  const url = 'https://infosec-conferences.com/';

  try {
    const { data: html } = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36' }
    });

    const $ = cheerio.load(html);
    const events = [];

    $("a:contains('Visit Event')").each((i, el) => {
      const card = $(el).closest('div').parent();

      // Satırları ayırıp temizliyoruz
      const rawLines = card.text().split('\n');
      const cleanLines = rawLines.map(line => line.trim()).filter(line => line.length > 0);

      // Başlık satırının index numarasını buluyoruz (İçinde | ve yıl geçen satır)
      const headerIndex = cleanLines.findIndex(line => line.includes('|') && line.match(/\d{4}/));

      if (headerIndex !== -1) {
        const headerLine = cleanLines[headerIndex];
        const parts = headerLine.split('|');

        const date = parts[0].trim();
        const title = parts.slice(1).join('|').trim();

        // Açıklama: Başlık satırından sonra gelen ve buton metinlerinden (Visit Event vb.) 
        // hemen öncesine kadar olan tüm satırları birleştiriyoruz.
        const descriptionLines = cleanLines.slice(headerIndex + 1).filter(line =>
          !line.includes('Visit Event') &&
          !line.includes('Get Alerts') &&
          !line.includes('See More') &&
          !line.includes('See Less')
        );

        const description = descriptionLines.join(' ').trim();

        const fullText = card.text();
        const type = fullText.includes('Online') ? 'Online' : (fullText.includes('Physical') ? 'Physical' : 'Other');

        events.push({
          title: title,
          date: new Date(date.replace(/(\d+)(st|nd|rd|th)/, '$1')).getTime(),
          description: description,
          url: $(el).attr('href'),
          type: "CONFERENCE",
          location: type
        });

      }
    });

    //logger('ConferenceService', `\n${output}`);
    logger('ConferenceService', `Toplam ${events.length} etkinlik bulundu.`);

    return events;

  } catch (error) {
    console.error("Hata:", error.message);
  }
}

module.exports = { getConferenceData };