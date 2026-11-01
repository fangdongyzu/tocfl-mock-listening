# TOCFL listening lookup

One static page for all 250 listening questions in mocks 1–5. Enter `1 05` or `3 07`, then press Enter or 查詢. Spaces, commas, hyphens, slashes, and full-width numbers are supported. Browse buttons, previous/next, playback speed, looping, and a transcript toggle are included. Hash URLs such as `#3-07` open a specific question and work with browser Back/Forward.

## Files and sources

`dist/` contains the complete website and can be served on GitHub Pages without dependencies or a build step. Audio streams from the existing public GitHub repositories. Transcripts are bundled locally, so searching does not depend on GitHub's API or an API key. Source text is inserted as text, never HTML.

`source-data/mock1.js` through `mock5.js` preserve the original `data.js` from `https://github.com/fangdongyzu/tocfl-mock{n}-listening`. `audio-files.json` records the corresponding `sounds/` directory listings. `build.mjs` validates all question IDs, transcripts, and audio filenames, then regenerates `dist/catalog.js`:

```sh
node build.mjs
python3 -m http.server 8765 --bind 127.0.0.1 --directory dist
```

Open `http://127.0.0.1:8765/`.

The original mock 4 question 30 has the path `sounds3-30.mp3`; the builder corrects this to the verified existing file `sounds/3-30.mp3`. Original transcript wording is preserved.

## GitHub Pages

The four files in `dist/` are published in the `fangdongyzu/tocfl-mock-listening` repository's `lookup/` folder. Lookup URL: `https://fangdongyzu.github.io/tocfl-mock-listening/lookup/`. Transcript text uses 26px on desktop and 22px on mobile.

The former `tocfl-mock1-listening/lookup/` address redirects here while preserving the selected question. Original audio remains in the five original repositories. The mock 1 quiz stays at its existing URL.

To update, rebuild the catalog if sources changed, then replace those four files in `lookup/`. The existing Pages deployment publishes them automatically.
