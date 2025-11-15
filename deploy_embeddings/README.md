# Deployable Embeddings for Netlify Tutor

This folder contains a Python script that scans `sample_training_data`,
converts supported files to text, chunks them, builds embeddings using a
CPU-friendly model, and writes a single `embeddings.json` file that can be
shipped to Netlify and GitHub.

## 1. Requirements

From the project root (`h:/Exam-AI-Mw Schools`):

```bash
python -m venv venv
venv\Scripts\activate
pip install --upgrade pip
pip install sentence-transformers pypdf python-docx textract
```

> These dependencies are similar to those used by the local tutor project.

## 2. Build `embeddings.json`

Run:

```bash
venv\Scripts\activate
python deploy_embeddings/build_embeddings.py
```

This will:

- Scan `sample_training_data/` for TXT, PDF, DOCX, DOC files.
- Convert each supported file to text.
- Chunk the text into ~500-word segments with overlap.
- Select at most a limited number of chunks per document and a global
  maximum number of chunks (configurable in the script) to keep the
  JSON small enough for GitHub/Netlify.
- Generate embeddings using `sentence-transformers/all-MiniLM-L6-v2`
  on CPU.
- Write `deploy_embeddings/embeddings.json` with:
  - `chunks`: `{ id, source_file, chunk_index, text, embedding }`.
  - `unsupported_files`: list of skipped files with reasons.

You can commit `deploy_embeddings/embeddings.json` to GitHub so that
Netlify Functions can load it at runtime.

## 3. Netlify & Groq

- Set the `GROQ_API_KEY` environment variable in your Netlify site
  settings (do **not** commit it to Git).
- The Netlify Function `netlify/functions/ask.js` loads
  `deploy_embeddings/embeddings.json`, retrieves the most relevant
  chunks for a question, sends them as context to the Groq Llama 3.1
  API, and returns an answer.

The static frontend page `public/tutor.html` calls this function at
`/.netlify/functions/ask` and provides a simple chat-like UI.

## 4. Rebuilding embeddings after adding textbooks

- Place new or updated textbooks in `sample_training_data/`.
- Re-run:

  ```bash
  venv\Scripts\activate
  python deploy_embeddings/build_embeddings.py
  ```

- This regenerates `deploy_embeddings/embeddings.json` with updated
  chunks and embeddings (respecting the size limits in the script).
- For public GitHub repositories, keep `sample_training_data/`
  **uncommitted** (or in a private repo) to avoid pushing raw
  textbooks; only commit the optimized `embeddings.json`.

## 5. GitHub + Netlify deployment flow

1. Build `embeddings.json` locally as above.
2. Commit at least the following to GitHub:
   - `deploy_embeddings/embeddings.json`
   - `netlify/functions/ask.js`
   - the React frontend (including `src/components/AIAssistant.js` and
     `src/services/aiService.js`)
   - `netlify.toml` with `directory = "netlify/functions"`.
3. In Netlify, connect the GitHub repo and set:
   - **Build command:** `npm run build`
   - **Publish directory:** `build`
   - **Environment variable:** `GROQ_API_KEY`.
4. After deploy, the tutor is accessible via your existing frontend
   design (AI Assistant chat) which now calls
   `/.netlify/functions/ask`, using only the optimized
   `embeddings.json` for textbook content.
