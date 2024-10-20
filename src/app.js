const express = require("express");
const { getCatalog } = require("./catalog.js");
const { getStreams } = require("./streams.js");
const { getEpisodes } = require("./episodes.js"); // Importa getEpisodes
const addonSDK = require("stremio-addon-sdk");

const app = express();
const port = 2000;

const manifest = {
    "id": "stremio_ramaorientalfansub",
    "version": "1.0.0",
    "name": "RamaOrientalFansub Addon",
    "description": "Addon per catalogare e fornire stream di serie coreane da RamaOrientalFansub",
    "resources": ["catalog", "stream"],
    "types": ["series"],
    "catalogs": [
        {
            "type": "series",
            "id": "ramaoriental-catalog"
        }
    ],
    "idPrefixes": ["ramaoriental_"],
    "logo": "https://ramaorientalfansub.tv/wp-content/uploads/2023/10/cropped-Logo-1.png",
    "background": "https://ramaorientalfansub.tv/wp-content/uploads/2023/10/2860055-e1696595653601.jpg"
};

// Catalogo endpoint
app.get("/catalog/series.json", async (req, res) => {
    try {
        const catalog = await getCatalog();
        res.json({ metas: catalog });
    } catch (err) {
        console.error("[ERRORE] Impossibile recuperare il catalogo", err);
        res.status(500).send("Errore nel recupero del catalogo");
    }
});

// Episodes endpoint
app.get("/episodes/:seriesId.json", async (req, res) => {
    const seriesId = req.params.seriesId;
    const episodeLink = `https://ramaorientalfansub.tv/drama/${seriesId.replace("ramaoriental_", "").replace(/_/g, "-")}/`; // Costruisce il link per la serie

    try {
        const episodes = await getEpisodes(episodeLink);
        res.json({ episodes });
    } catch (err) {
        console.error("[ERRORE] Impossibile recuperare gli episodi", err);
        res.status(500).send("Errore nel recupero degli episodi");
    }
});

// Streams endpoint - nuovo endpoint per gli stream degli episodi
app.get("/streams/:seriesId.json", async (req, res) => {
    const seriesId = req.params.seriesId;
    const seriesName = seriesId.replace("ramaoriental_", "").replace(/_/g, "-"); // Trasforma l'ID della serie

    try {
        const streams = await getStreams(seriesName);
        if (streams.length === 0) {
            res.status(404).send('Stream non trovati per questa serie');
        } else {
            res.json(streams);
        }
    } catch (err) {
        res.status(500).send(`Errore durante il recupero degli stream per la serie: ${seriesId}`);
    }
});
// Manifest endpoint
app.get("/manifest.json", (req, res) => {
    res.json(manifest);
});

// Avvia il server
app.listen(port, () => {
    console.log(`[INFO] Addon in ascolto su porta ${port}`);
});

