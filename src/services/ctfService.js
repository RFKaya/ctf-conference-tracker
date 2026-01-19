const axios = require('axios');
const { logger } = require('./loggerService');

async function getCTFData() {
  try {

    const response = await axios.get(`https://ctftime.org/api/v1/events/?limit=30&start=${Math.floor(new Date(new Date().setDate(new Date().getDate() - 15)) / 1000)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    logger('ctfService', `Toplam ${response.data.length} etkinlik bulundu.`);

    return response.data.map(event => ({
      title: event.title,
      date: new Date(event.start).getTime(),
      description: event.description,
      url: event.url,
      type: 'CTF',
      location: event.onsite ? 'Yerinde' : 'Online'
    }));

  } catch (error) {
    console.error("!!! CTF Çekme Hatası:", error.message);
    return [];
  }
}

module.exports = { getCTFData };