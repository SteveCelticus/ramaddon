const puppeteer = require('puppeteer');
const cheerio = require("cheerio");
const logger = require('./logger');

// Percorso base per gli stream MP4
const BASE_STREAM_URL = 'https://server1.streamingrof.online/02-DRAMACOREANI/';

// Funzione per recuperare gli stream usando Puppeteer
async function getStreams(seriesName) {
    const url = `https://ramaorientalfansub.tv/watch/${seriesName}/`;
    logger.info(`Recupero stream per la serie: ${seriesName}`);

    const streams = [];
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    try {
        // Vai all'URL della serie e aspetta che la pagina sia completamente caricata
        const response = await page.goto(url, { waitUntil: 'networkidle2' });
        if (!response.ok()) {
            throw new Error(`Errore nel caricamento della pagina: ${response.status()} ${response.statusText()}`);
        }

        // Estrai il contenuto HTML della pagina dopo il rendering
        const html = await page.content();
        const $ = cheerio.load(html);

        // Seleziona gli episodi
        const episodeElements = $('div.episode-list-display-box.episode-list-item');

        for (let i = 0; i < episodeElements.length; i++) {
            const element = episodeElements[i];
            const title = $(element).find('a').text().trim();
            const episodeLink = $(element).find('a').attr('href');

            if (title && episodeLink.includes('/watch/')) {
                logger.info(`Visita la pagina dell'episodio: ${episodeLink}`);
                // Visita la pagina dell'episodio per recuperare il link dello stream MP4
                await page.goto(episodeLink, { waitUntil: 'networkidle2' });
                const episodeHtml = await page.content();
                const $$ = cheerio.load(episodeHtml);

                // Seleziona l'iframe e ottieni il link MP4
                const iframeSrc = $$('iframe').attr('src');
                if (iframeSrc) {
                    // Controlla se il link è già un URL completo o se deve essere modificato
                    let mp4Link;
                    if (iframeSrc.startsWith('http')) {
                        mp4Link = iframeSrc; // Link completo
                    } else {
                        mp4Link = `${BASE_STREAM_URL}${iframeSrc}`; // Percorso relativo
                    }

                    streams.push({ title, stream: mp4Link });
                    logger.info(`Trovato stream MP4: ${mp4Link}`);
                } else {
                    logger.warn(`Nessun link MP4 trovato per l'episodio: ${title}`);
                }
            }
        }

        await browser.close(); // Chiudi il browser dopo il completamento
        return streams;
    } catch (err) {
        logger.error(`Errore durante il recupero degli stream: ${err}`);
        await browser.close(); // Assicurati di chiudere il browser anche in caso di errore
        return [];
    }
}

module.exports = { getStreams };

