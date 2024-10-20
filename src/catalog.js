const axios = require('axios');
const cheerio = require('cheerio');
const logger = require('./logger');

// URL di base per il catalogo
const BASE_URL = 'https://ramaorientalfansub.tv/paese/corea-del-sud/';
const MAX_PAGES = 5; // Limite massimo di pagine da recuperare

// Funzione per raccogliere il catalogo da più pagine
async function getCatalog() {
    let catalogItems = [];
    let currentPage = 1;
    let hasMorePages = true;

    while (hasMorePages && currentPage <= MAX_PAGES) {
        try {
            const pageUrl = `${BASE_URL}page/${currentPage}/`;
            logger.info(`Recupero pagina ${currentPage} del catalogo: ${pageUrl}`);
            const response = await axios.get(pageUrl);
            const html = response.data;

            // Log dell'HTML per il debug
            logger.debug(`HTML della pagina ${currentPage}: ${html.substring(0, 500)}`);

            const $ = cheerio.load(html);

            // Raccogli gli elementi della serie
            const pageItems = $('div.w-full.bg-gradient-to-t.from-primary');
            if (pageItems.length === 0) {
                logger.warn(`Nessun elemento trovato nella pagina ${currentPage}.`);
                hasMorePages = false;
                break;
            }

            pageItems.each((index, element) => {
                const titleElement = $(element).find('a.text-sm.line-clamp-2.font-medium.leading-snug.lg\\:leading-normal');
                const title = titleElement.text().trim();
                const link = titleElement.attr('href');
                const poster = $(element).find('img').attr('src');
               // const episodeLink = `https://ramaorientalfansub.tv/drama/${title.replace(/\s+/g, "_").toLowerCase()}/`;

                if (title && link) {
                    catalogItems.push({
                        id: `ramaoriental_${title.replace(/\s+/g, "_").toLowerCase()}`,
                        title,
                        link,
                        // episodeLink,
                        poster,
                        type: "series",
                        description: title,
                        imdbRating: "N/A",
                        runtime: "N/A",
                        released: 2024,
                    });
                }
            });

            // Controlla se ci sono altre pagine usando ul.page-numbers
            const nextPageLink = $('ul.page-numbers > li:nth-last-child(1) > a');
            if (nextPageLink.length > 0) {
                const nextPageUrl = nextPageLink.attr('href');
                logger.info(`Trovato link alla pagina successiva: ${nextPageUrl}`);
                currentPage++;
            } else {
                logger.info(`Nessun link alla pagina successiva trovato.`);
                hasMorePages = false;
            }

        } catch (err) {
            logger.error(`Errore durante il recupero della pagina ${currentPage}:`, err);
            hasMorePages = false;
        }
    }

    logger.info(`Recuperate ${catalogItems.length} serie dal catalogo.`);
    return catalogItems;
}

module.exports = {
    getCatalog
};

