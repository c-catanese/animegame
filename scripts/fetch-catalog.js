import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = path.join(__dirname, '..', 'src', 'catalog.json');

const API_BASE = 'https://api.animethemes.moe';
const DELAY_MS = 700;
const HEADERS = { 'User-Agent': 'Weeble/1.0 (anime guessing game)' };

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchPage(page) {
  const url = `${API_BASE}/anime?include=animethemes.animethemeentries.videos,animesynonyms&page%5Bsize%5D=100&page%5Bnumber%5D=${page}`;
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`API error ${res.status}: ${res.statusText}`);
  return res.json();
}

function getEnglishName(anime) {
  const synonyms = anime.animesynonyms || [];
  const english = synonyms.find(s => s.type === 'English');
  return english ? english.text : null;
}

function extractFirstOP(anime) {
  const themes = anime.animethemes || [];

  for (const theme of themes) {
    if (theme.type !== 'OP') continue;
    const entries = theme.animethemeentries || [];
    for (const entry of entries) {
      const videos = entry.videos || [];
      for (const video of videos) {
        if (video.link) {
          const englishName = getEnglishName(anime);
          return {
            name: anime.name.toLowerCase(),
            englishName: englishName ? englishName.toLowerCase() : null,
            videoUrl: video.link,
            year: anime.year || null,
          };
        }
      }
    }
  }
  return null;
}

async function fetchAllAnime() {
  let page = 1;
  let allAnime = [];
  let hasMore = true;

  console.log('Fetching anime catalog from animethemes.moe...');

  while (hasMore) {
    console.log(`  Fetching page ${page}... (${allAnime.length} entries so far)`);

    let data;
    try {
      data = await fetchPage(page);
    } catch (err) {
      console.error(`  Error on page ${page}: ${err.message}. Retrying...`);
      await sleep(2000);
      try {
        data = await fetchPage(page);
      } catch (retryErr) {
        console.error(`  Retry failed. Stopping pagination.`);
        break;
      }
    }

    const animeList = data.anime || [];
    if (animeList.length === 0) break;

    for (const anime of animeList) {
      const op = extractFirstOP(anime);
      if (op) allAnime.push(op);
    }

    const links = data.links || {};
    if (!links.next) hasMore = false;

    page++;
    await sleep(DELAY_MS);

    if (page > 50) {
      console.log('  Reached page limit, stopping.');
      break;
    }
  }

  return allAnime;
}

function deduplicateByName(catalog) {
  const seen = new Set();
  return catalog.filter(entry => {
    if (seen.has(entry.name)) return false;
    seen.add(entry.name);
    return true;
  });
}

async function main() {
  try {
    const allAnime = await fetchAllAnime();
    console.log(`\nFetched ${allAnime.length} anime with OPs total.`);

    const catalog = deduplicateByName(allAnime);
    console.log(`After deduplication: ${catalog.length} unique anime.`);

    // Sort catalog alphabetically by name for consistency
    catalog.sort((a, b) => a.name.localeCompare(b.name));

    const withEnglish = catalog.filter(e => e.englishName).length;
    console.log(`Entries with English names: ${withEnglish}/${catalog.length}`);

    const output = { catalog };

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));
    console.log(`\nCatalog written to ${OUTPUT_PATH} (${catalog.length} entries)`);
  } catch (err) {
    console.error('Failed to fetch catalog:', err.message);
    process.exit(1);
  }
}

main();
