const axios = require('axios');
const cheerio = require('cheerio');
const logger = require('./logger');

// Funzione per recuperare gli episodi di una serie
async function getEpisodes(seriesLink) {
    try {
        const response = await axios.get(seriesLink);
        const html = response.data;
        const $ = cheerio.load(html);

        const episodes = [];
        const episodeElements = $(' div.swiper-slide');

        episodeElements.each((index, element) => {
            const title = $(element).find('a').text().trim();
            const link = $(element).find('a').attr('href');

            // Controlla se il link contiene '/watch/'
            if (title && link && link.includes('/watch/')) {
                episodes.push({
                    title,
                    link,
                });
            }
        });
        
        logger.info(`Recuperati ${episodes.length} episodi per la serie.`);
        return episodes;
    } catch (err) {
        logger.error(`Errore durante il recupero degli episodi: ${err}`);
        return [];
    }
}

module.exports = { getEpisodes };

