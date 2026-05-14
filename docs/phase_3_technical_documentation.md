# TrendSense Phase 3 - Technical Architecture & Specification

**Document Status:** Final (Verified from Codebase)
**Target Audience:** Technical Evaluators, System Architects, Data Engineers
**Confidence Level:** HIGH (100% verified via static code analysis, `package.json`, `requirements.txt`, and active Python modules)

---

## 1. System Architecture Overview

TrendSense Phase 3 operates on a decoupled monorepo architecture. The system is designed to predict YouTube video virality before publication by analyzing multimodal inputs (Text + Vision + Tabular) and combining them with local Large Language/Vision Models (LLMs/VLMs) to provide actionable strategy reports.

### 1.1 Core Stack (Verified)
*   **Frontend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4.
*   **Backend:** Python 3, FastAPI, Uvicorn.
*   **Machine Learning:** PyTorch (Inference/Training), SentenceTransformers (SBERT), Transformers (Hugging Face), BERTopic.
*   **Local AI Inference:** Ollama (`llama3`, `llava`).
*   **Data Processing:** Apache Spark (PySpark), Pandas, Parquet (Snappy compression).
*   **Database:** MongoDB Atlas (via `pymongo`).

---

## 2. Machine Learning & AI Pipeline (Phase 3 Active)

The Phase 3 AI pipeline is heavily optimized for consumer GPUs, utilizing a composite architecture of embedding models, a dense neural network, and locally hosted generative AI.

### 2.1 The Virality Predictor (Neural Network)
*   **Architecture:** 4-layer Multilayer Perceptron (MLP) defined in `ViralityPredictor` (`backend/v2_engine/api.py` and `train_trendsense.py`).
*   **Topology:** `385 → 256 (BatchNorm + ReLU + Dropout 0.3) → 128 (BatchNorm + ReLU + Dropout 0.3) → 64 (BatchNorm + ReLU + Dropout 0.2) → 1 (Output)`.
*   **Input Vector (385 Dimensions):**
    *   `[0:384]`: SBERT text embeddings generated from `"TITLE: {title} | SCRIPT HOOK: {hook}"`.
    *   `[384]`: CLIP Cohesion Score (Logit diagonal matching the image and title).
*   **Current Weights:** `trendsense_core_v4.pt`.
*   **Training Paradigm:** Trained using Mean Absolute Error (MAE) loss, Adam optimizer with weight decay, ReduceLROnPlateau scheduler, and strict early stopping based on a held-out 15% validation set. 

### 2.2 Embedding & Vision Models
*   **Text Embedding:** `all-MiniLM-L6-v2` (SentenceTransformers). Extremely lightweight, generating 384-dimensional semantic vectors.
*   **Vision/Cohesion Scoring:** `openai/clip-vit-base-patch32`. CLIP is used exclusively to generate a "Cohesion Score" between the proposed title and the letterboxed thumbnail.
*   **Image Processing:** Custom `letterbox_image` function pads thumbnails to a 1:1 aspect ratio (224x224) to prevent CLIP from squashing 16:9 images and corrupting cohesion signals.

### 2.3 Generative Consultants (Ollama Integration)
The system leverages local LLMs via the `ollama` Python package to bypass cloud API costs and rate limits.
1.  **Vision Engine (`llava`):** Acts as a literal image describer. Extracts a 2-sentence description of the uploaded thumbnail.
2.  **Culture/Zeitgeist Engine (`llama3`):** Evaluates user-provided "entities" (e.g., influencers, brands) and ranks them into tiers (S, A, B, None). This tier applies a mathematical multiplier (up to 1.8x) to the base PyTorch prediction.
3.  **Strategic Reasoner (`llama3`):** Ingests the base score, cohesion score, vision description, and entity boost to generate a strict, 3-bullet-point strategic report (Score Analysis, Cohesion Fixes, Hook Rewrite).

### 2.4 Live Pulse Trend Discovery
*   **Engine:** BERTopic (`trend_discovery.py`).
*   **Components:** `all-MiniLM-L6-v2` (Embeddings), `KeyBERTInspired` (Representation), CountVectorizer (Stop-word removal).
*   **Clustering Pipeline:** HDBSCAN + UMAP.
*   **Velocity Math:** Calculates a dynamic velocity score using `(avg_score) * (sqrt(cluster_size + 1))` to float high-engagement, fast-moving niches.

---

## 3. Data Engineering & ETL Pipeline

The project utilizes a hybrid Out-of-Core and distributed Big Data approach to process millions of YouTube/Reddit records into highly compressed `.parquet` formats.

### 3.1 Historical Data Lake (YouTube)
*   **Spark ETL (`multimodal_etl.py`):** Apache Spark processes the 6.01 GB raw YouTube corpus. Applies a custom Python UDF (`clean_and_demojize`) across distributed CPU cores. Outputs to `v2_cleaned_trends.parquet`.
*   **Feature Extraction (`build_v5_dataset.py`):** An advanced GPU-batched script that iterates over the cleaned Parquet files.
    *   Generates batched SBERT embeddings.
    *   Generates batched CLIP cohesion scores.
    *   **Crucial Update:** Implements *Percentile Rank Scoring* (`engagement_rate.rank(pct=True) * 100`) to properly distribute target virality scores from 0-100, fixing severe skew from previous iterations. Output: `trendsense_v7_master.parquet`.

### 3.2 Live Velocity Stream (Reddit/MongoDB)
*   **Reddit Harvester (`reddit_fetcher.py`):** Scrapes top daily posts from 22 curated cultural epicenters (e.g., `r/youtube`, `r/LivestreamFail`, `r/MemeEconomy`).
*   **MongoDB Atlas (`mongo_client.py`):** The harvester acts idempotently, upserting data into the `live_trends` collection. This prevents Reddit API rate limits from breaking the dashboard.

### 3.3 Static Telemetry (`generate_static_analytics.py`)
To prevent heavy I/O operations at runtime, a static generator script precomputes metrics (medians, distributions, quartiles, Pearson correlation matrices) from the massive Parquet files and exports them to `static_analytics.json`. The FastAPI server serves this JSON directly to the frontend.

---

## 4. Frontend Architecture & Interface

The frontend (`frontend/src/app`) serves as the "Studio" interface, prioritizing high-fidelity data visualization and responsive feedback.

### 4.1 Key Technologies
*   **Framework:** Next.js 15 (React 19).
*   **Styling:** Tailwind CSS, utilizing a premium light-theme palette (`bg-cream`, `text-emerald`, `burgundy` accents).
*   **3D Elements:** `@react-three/fiber` and `@react-three/drei` render the dynamic `ScoreOrb` in the dashboard, visually reacting to the final virality score.
*   **Animations:** GSAP (ScrollTrigger) for landing page parallax effects; Framer Motion for component mounting and KPI card staggering.
*   **Analytics Charts:** `recharts` for rendering complex data telemetry.

### 4.2 Application Routes
*   `/` (Landing Page): Features GSAP scroll animations and marketing copy.
*   `/dashboard` (Virality Engine): The primary user input form. Collects Title, Hook, Thumbnail, and Entities. Interacts via FormData with the FastAPI `/analyze` endpoint.
*   `/analytics` (Telemetry Dashboard): Server Component that fetches `static_analytics.json` data and hydrates client-side KPI cards, a Virality Histogram, Correlation Heatmaps, and Phase 2 visualizations (Two-Stream Radar, Cluster Bubbles).
*   `/architecture` (Topology Map): Interactive Framer Motion visualizer of the system's pipeline.

---

## 5. Backend API Layer (`api.py`)

*   **Framework:** FastAPI with Uvicorn.
*   **Endpoints:**
    *   `POST /analyze`: The core multimodal inference endpoint. Executes the PyTorch math engine -> LLaVA vision engine -> Llama 3 Zeitgeist engine -> Llama 3 Strategic Consultant.
    *   `GET /api/analytics/summary` & `GET /api/analytics/distributions` (Referenced in `actions.ts` / `server.py`): Serves the cached Parquet metrics.
*   **Hardware Acceleration:** Heavily dictates environment variables (`CUDA_VISIBLE_DEVICES`, `OLLAMA_NUM_GPU`, `OLLAMA_GPU_DEVICE_IDS`) to tightly manage VRAM limits between PyTorch tensors and Ollama weights.

---

## 6. Deprecation & Component Status Matrix

To avoid confusion during evaluation, the following systems have been audited and verified regarding their active status:

| Component / File | Status | Replacement / Reasoning |
| :--- | :--- | :--- |
| `backend/v2_engine/api.py` | **ACTIVE** | The primary production API server for Phase 3. |
| `backend/server.py` | **PARTIAL/LEGACY** | Contains older `/api/predict` logic referencing `v2_multimodal_weights.pt` and Gemini. Superseded by `api.py` (which uses Llama 3 and `trendsense_core_v4.pt`). |
| `backend/v2_engine/multimodal_nn.py` | **DEPRECATED** | Old 1155-dimensional architecture. Replaced by `ViralityPredictor` class inside `train_trendsense.py` and `api.py`. |
| `backend/v2_engine/vision_vit.py` | **DEPRECATED** | Old Google ViT image processor. Replaced by OpenAI CLIP for direct cohesion scoring. |
| `data/legacy_v1/massive_etl.py` | **DEPRECATED** | Chunked Pandas Out-of-Core ETL. Kept for academic proof-of-concept, but physically replaced by `spark_jobs/multimodal_etl.py`. |
| `backend/v2_engine/local_llm_reasoner.py` | **INTEGRATED** | Experimental script directly integrated into `api.py`'s `/analyze` endpoint. |
| `backend/v2_engine/nightly_harvester.py` | **EXPERIMENTAL** | Translates foreign language YouTube transcripts to build larger hook datasets. Currently marked as a test script. |
| Gemini API Integrations | **DEPRECATED** | Completely replaced by 100% local, free, open-weights models via Ollama (`llama3`, `llava`) to prevent API costs. |

---
*Generated for Technical Review.*
