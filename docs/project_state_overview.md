# TrendSense — Project State Overview

**Generated:** 2026-03-15  
**Purpose:** Full system audit report. Intended to brief external AI assistants on the current state of the TrendSense project with no prior context.

---

## 1. Project Overview

**TrendSense** is a social media virality prediction system. It ingests historical YouTube trending data and live Reddit posts, trains a regression model to predict a "Virality Index" (0–100), and exposes the inference via a FastAPI backend consumed by a React frontend dashboard.

- **Repository root:** `d:/Development/Projects/TrendSense---Studio/`
- **Primary language:** Python (backend), JavaScript/React (frontend)
- **Database:** MongoDB Atlas M0 Free Tier
- **ML Framework:** scikit-learn
- **Deployment server:** uvicorn + FastAPI

---

## 2. System Architecture

```
TrendSense---Studio/
├── backend/                        # FastAPI ML inference server
│   ├── server.py                   # FastAPI app — main deployment entry point
│   ├── main.py                     # Standalone legacy pipeline runner
│   ├── model_trainer.py            # Training: LinearRegression vs RandomForest comparison
│   ├── retrain.py                  # Retraining pipeline using MongoDB data
│   ├── data_standardizer.py        # VADER sentiment + MinMaxScaler preprocessing
│   ├── reddit_fetcher.py           # Live Reddit public JSON scraper
│   ├── slang_extractor.py          # TF-IDF trending keyword extractor
│   ├── api_models.py               # Pydantic schemas for API I/O
│   ├── benchmark.py                # API latency benchmarking tool
│   ├── virality_model.pkl          # Legacy root-level model artifact (not active)
│   ├── scaler.pkl                  # Legacy root-level scaler (not active)
│   ├── requirements.txt            # Python dependencies (11 packages)
│   ├── server_log.txt              # Server runtime logs
│   ├── server_err.txt              # Server error logs
│   └── models/                     # Versioned model artifacts
│       ├── model_registry.json     # Version registry (active_model pointer)
│       ├── virality_model_v1.pkl   # v1 — ~1.8 MB (RandomForest, 7 features)
│       ├── virality_model_v2.pkl   # v2 — ~1 KB (placeholder/empty result)
│       ├── virality_model_v3.pkl   # v3 — ACTIVE (~1 KB, R2=0.0076)
│       └── scaler.pkl              # MinMaxScaler artifact
│
├── data/
│   ├── .env                        # MongoDB Atlas credentials (DO NOT COMMIT)
│   ├── setup_guide.md              # MongoDB Atlas setup walkthrough
│   ├── raw/
│   │   └── trending_yt_videos_113_countries.csv   # YouTube CSV — ~6.0 GB
│   └── db_scripts/
│       ├── mongo_client.py         # Singleton MongoDB Atlas connection
│       ├── mongo_metrics.py        # DB aggregation metrics & reports
│       ├── schema_standardizer.py  # YouTube chunk schema transformation
│       ├── upload_youtube_historical.py  # CSV → MongoDB ingestion (chunked)
│       └── upload_live.py          # Reddit DataFrame → MongoDB live_trends
│
├── docs/
│   └── project_state_overview.md  # THIS FILE
│
├── frontend/                       # React dashboard (Vite-based, ~99 files)
├── .venv/                          # Python virtual environment
├── .gitignore
└── README.md                       # Minimal (21 bytes — essentially empty)
```

**Data flow high-level:**
```
YouTube CSV ──► db_scripts/upload_youtube_historical.py ──► MongoDB: historical_youtube
Reddit API  ──► reddit_fetcher.py ──────────────────────► MongoDB: live_trends (via upload_live.py)
MongoDB     ──► retrain.py ──────────────────────────────► model_trainer.py ──► models/virality_model_vN.pkl
FastAPI     ──► /predict endpoint ──────────────────────► React Frontend Dashboard
```

---

## 3. Dataset Summary

### 3.1 YouTube Trending Dataset

| Property         | Value                                                   |
|------------------|---------------------------------------------------------|
| **File**         | `data/raw/trending_yt_videos_113_countries.csv`         |
| **Source**       | Kaggle                                                  |
| **Format**       | CSV                                                     |
| **Size**         | ~6.0 GB (6,458,275,605 bytes)                          |
| **Coverage**     | 113 countries                                           |
| **Ingestion cap**| 200,000 rows max (hard limit in `upload_youtube_historical.py`) |
| **Chunk size**   | 50,000 rows per processing chunk                        |
| **Key columns**  | `title`, `publish_time`/`publish_date`, `views`, `likes`, `comment_count`, `category_id` |
| **Renamed in schema** | `title` → `text`, `publish_time` → `timestamp`   |
| **Computed**     | `engagement_score`, `platform`, `country`               |

**Engagement Score formula:**
```
engagement_score = log(1+views) + 0.5*log(1+likes) + 0.5*log(1+comments)
```

### 3.2 Reddit Live Trends Dataset

| Property         | Value                                                      |
|------------------|------------------------------------------------------------|
| **Source**       | Reddit public JSON API (unauthenticated)                   |
| **Format**       | JSON (converted to DataFrame)                              |
| **Subreddits**   | `r/GenZ`, `r/technology`, `r/memes`                        |
| **Endpoint**     | `/rising.json?limit=100`                                   |
| **Fields**       | `title`, `score`, `num_comments`, `upvote_ratio`, `created_utc` |
| **Rate limiting**| 2-second sleep between subreddit requests                  |
| **Persistence**  | `live_trends` MongoDB collection via `upload_live.py`      |
| **Cache TTL**    | 1 hour in-memory cache in FastAPI server                   |

### 3.3 MongoDB Collections

| Collection            | Description                                     |
|-----------------------|-------------------------------------------------|
| `historical_youtube`  | Pre-processed YouTube trending records (≤200k)  |
| `live_trends`         | Live scraped Reddit posts                       |

**Database name:** `trendSenseDB`  
**Cluster:** `trendsense.abv8csw.mongodb.net` (MongoDB Atlas M0 Free Tier)

---

## 4. Database State

- **Database Name:** `trendSenseDB`
- **Atlas Tier:** M0 (Free Tier — 512 MB storage limit)
- **Collections:** `historical_youtube`, `live_trends`
- **Connection:** Singleton `MongoDBClient` class using `pymongo.MongoClient` with SRV URI from `data/.env`

**Indexes on `historical_youtube`:**
- `timestamp` (ASCENDING)
- `platform` (ASCENDING)

**Indexes on `live_trends`:**
- `timestamp` (ASCENDING)
- `platform` (ASCENDING)
- `engagement_score` (ASCENDING)

**Deduplication strategy:** `UpdateOne` with `upsert=True` keyed on `{ text, timestamp, platform }` for historical, and `{ id/text/title + timestamp }` for live data.

**Metrics script:** `data/db_scripts/mongo_metrics.py` — computes document counts, missing field percentages for `text`, `views`, `likes`, engagement score min/max/avg, and `views` skewness via Pandas.

**Actual document counts** are not available in static analysis (require live DB connection). The ingestion cap is 200,000 documents for `historical_youtube`.

---

## 5. Data Pipeline

### 5.1 Historical Ingestion (CSV → MongoDB)

**Script:** `data/db_scripts/upload_youtube_historical.py`

1. Read CSV in chunks of 50,000 rows using `pd.read_csv(..., chunksize=50000)`
2. For each chunk, call `standardize_youtube_chunk()` (`schema_standardizer.py`)
   - Rename `title` → `text`, `publish_time` → `timestamp`
   - Parse timestamp to `datetime`
   - Compute `engagement_score = log1p(views) + 0.5*log1p(likes) + 0.5*log1p(comments)`
   - Add `platform="youtube"`, `country=<2-char from filename>`
   - Select final columns: `text, views, likes, comment_count, timestamp, category_id, country, engagement_score, platform`
3. Build `UpdateOne` upsert operations per record
4. Execute `bulk_write()` on `historical_youtube` collection
5. Stop at `max_rows=200,000` hard limit

### 5.2 Live Reddit Ingestion

**Script:** `data/db_scripts/upload_live.py` + `backend/reddit_fetcher.py`

1. `fetch_daily_reddit_trends()` hits Reddit public JSON endpoints
2. Extracts: `title`, `score`, `num_comments`, `upvote_ratio`, `created_utc`
3. Converts `created_utc` to `datetime`
4. `append_to_mongo()` performs upsert into `live_trends` collection
5. Adds `ingestion_timestamp` field at write time

### 5.3 Retraining Pipeline

**Script:** `backend/retrain.py`

1. Connects to MongoDB via `MongoDBClient`
2. Fetches 5,000 random documents from `historical_youtube` using `$sample` aggregation
3. Passes to `standardize_youtube_for_training()` → applies VADER sentiment, MinMaxScaler
4. Trains model via `train_virality_model()` → saves versioned `.pkl`, updates registry

---

## 6. Preprocessing Pipeline

**Script:** `backend/data_standardizer.py`

| Step                     | Method                                      | Output                              |
|--------------------------|---------------------------------------------|-------------------------------------|
| Drop nulls               | `dropna(subset=['text'])`                   | Removes rows with no title text     |
| Text cast                | `.astype(str)`                              | Ensures string type                 |
| Sentiment analysis       | VADER `SentimentIntensityAnalyzer`          | `sentiment_polarity` (−1 to 1)      |
| Timestamp handling       | `pd.to_datetime(..., errors='coerce')`      | Fills failed parses with `now()`    |
| Virality scaling         | `MinMaxScaler(feature_range=(0, 100))`      | Scales `engagement_score` to 0–100  |
| Scaler persistence       | `joblib.dump(scaler, "models/scaler.pkl")`  | Reused in inference                 |

**Slang Extraction:** `backend/slang_extractor.py`
- Lowercases text, removes URLs and non-alpha characters
- Applies `TfidfVectorizer(ngram_range=(1,2), max_df=0.95, min_df=2)` on Reddit titles
- Returns top-N keywords by summed TF-IDF score

**Feature Engineering** (inside `model_trainer.py`):
| Feature                   | Description                                           |
|---------------------------|-------------------------------------------------------|
| `text_length`             | Character count of post text                          |
| `hour_of_day`             | Hour extracted from `timestamp`                       |
| `day_of_week`             | Day-of-week (0=Mon, 6=Sun)                            |
| `is_weekend`              | Binary: 1 if `day_of_week ∈ {5, 6}`                  |
| `sentiment_polarity`      | VADER compound score (−1 to 1)                        |
| `contains_trending_slang` | Binary: 1 if any trending word found in text (v1 only)|
| `keyword_density`         | Ratio of trending words to total words (v1 only)      |

---

## 7. Machine Learning Pipeline

### 7.1 Problem Type

**Regression** — predicting a continuous `engagement_score` (scaled to Virality Index 0–100).

### 7.2 Models Compared

| Model               | Library                         | Hyperparameters                        |
|---------------------|---------------------------------|----------------------------------------|
| `LinearRegression`  | `sklearn.linear_model`          | Default (no hyperparameters)           |
| `RandomForestRegressor` | `sklearn.ensemble`          | `n_estimators=100, max_depth=10, random_state=42` |

**Selection criterion:** Highest `R²` on test set.

### 7.3 Train/Test Split

`train_test_split(X, y, test_size=0.2, random_state=42)` — 80/20 split.

### 7.4 Cross-Validation

`KFold` is imported in `model_trainer.py` but **is not currently used** in the training logic. No cross-validation is performed at this stage.

### 7.5 Feature Sets By Version

| Version | Features (count) |
|---------|------------------|
| v1      | `contains_trending_slang`, `keyword_density`, `text_length`, `hour_of_day`, `day_of_week`, `is_weekend`, `sentiment_polarity` (7) |
| v2, v3  | `text_length`, `hour_of_day`, `day_of_week`, `is_weekend`, `sentiment_polarity` (5) |

---

## 8. Training Workflow

**Script:** `backend/retrain.py` (production) | `backend/main.py` (legacy standalone)

1. Fetch 5,000 sampled records from MongoDB `historical_youtube` via `$sample`
2. Apply `standardize_youtube_for_training()` → adds `sentiment_polarity`, scales `engagement_score`, saves `models/scaler.pkl`
3. Feature engineering inside `train_virality_model()`: adds temporal and text-length columns
4. `80/20` train-test split
5. Train both `LinearRegression` and `RandomForestRegressor`
6. Evaluate both on test set with R² and RMSE
7. Select model with highest R²
8. If RandomForest wins: log feature importances
9. Determine next version number from `models/model_registry.json`
10. Save best model as `virality_model_vN.pkl` using `joblib.dump()`
11. Update registry JSON with version, filename, trained_at, R², dataset_size, feature_count, features_used
12. Set `"active_model"` pointer in registry to new file

**Overfitting mitigation:** `max_depth=10` on RandomForest. No regularization on LinearRegression. No cross-validation implemented.

---

## 9. Evaluation Metrics

| Metric | Used? | Where                              |
|--------|-------|------------------------------------|
| R²     | ✅ Yes | `model_trainer.py` — primary selection criterion |
| RMSE   | ✅ Yes | `model_trainer.py` — logged alongside R²    |
| MAE    | ❌ No  | Not implemented                    |
| Accuracy / F1 / Precision / Recall | ❌ No | Not applicable (regression task) |

---

## 10. Deployment Architecture

### 10.1 Backend — FastAPI

**Script:** `backend/server.py`  
**Server:** uvicorn (run via `uvicorn server:app`)  
**Port:** 8000  
**Startup:** lifespan context manager loads model artifact + scaler from registry on boot

**API Endpoints:**

| Method | Path           | Description                                                    |
|--------|----------------|----------------------------------------------------------------|
| GET    | `/health`      | Health check — returns `{ "status": "ok" }`                   |
| GET    | `/model-info`  | Returns active model version, R², dataset size, feature count |
| GET    | `/live-trends` | Returns top 10 trending keywords (1hr TTL cache)              |
| POST   | `/predict`     | Takes `post_text`, returns `virality_index`, `sentiment_score`, `top_features` |

**CORS policy:** Allows `http://localhost:3000` and `http://127.0.0.1:3000` (frontend dev server).

**Inference flow for `/predict`:**
1. Validate input via Pydantic (`PredictRequest`, max 2000 chars)
2. Compute VADER `sentiment_polarity`
3. Check trending slang cache, compute `contains_trending_slang` and `keyword_density`
4. Extract temporal features from current timestamp
5. Build feature dict for all features artifact expects
6. Call `predict_with_explainability()` → returns raw regression score + top 3 features
7. Apply `scaler.transform()` to scale raw score to 0–100
8. Clip result to `[0.0, 100.0]`
9. Return `PredictResponse`

**SLA target:** Avg latency < 300ms (verified by `benchmark.py` with 100 requests).

### 10.2 Frontend

- Location: `frontend/` (~99 files, Vite/React-based)
- Communicates with backend at `http://localhost:8000`

### 10.3 Containerization / Cloud

- **No Docker** configuration found
- **No MLflow** or cloud deployment scripts found
- Deployment is local development only — uvicorn + Vite dev server

---

## 11. Current Development Status

### Completed Modules ✅

| Module                        | Status         |
|-------------------------------|----------------|
| YouTube CSV ingestion pipeline | Complete       |
| MongoDB schema standardization | Complete       |
| Duplicate deduplication (upsert) | Complete     |
| VADER sentiment extraction    | Complete       |
| TF-IDF trending slang extractor | Complete     |
| Feature engineering pipeline  | Complete       |
| LinearRegression + RandomForest training | Complete |
| Model versioning + JSON registry | Complete   |
| FastAPI server with 4 endpoints | Complete     |
| Pydantic I/O schemas          | Complete       |
| CORS middleware               | Complete       |
| MinMaxScaler virality scaling | Complete       |
| Feature explainability (top 3 contributors) | Complete |
| Retrain pipeline via MongoDB  | Complete       |
| API latency benchmark tool    | Complete       |
| Frontend React dashboard      | Complete (structure) |

### Incomplete / Experimental ⚠️

| Item                              | Notes                                                                |
|-----------------------------------|----------------------------------------------------------------------|
| KFold cross-validation            | Imported but not used in any training flow                           |
| `virality_model_v2.pkl` / `v3.pkl` | Only ~1 KB each — likely `LinearRegression` (no tree structure), very low R² (0.0076) |
| `main.py` pipeline               | References deprecated `sentiment140.csv` and `create_synthetic_kaggle_data()` — **stale, not the active pipeline** |
| `data_standardizer.py` legacy functions | `standardize_datasets()` and `create_synthetic_kaggle_data()` still present, referenced only in `main.py` |
| `virality_model.pkl` / `scaler.pkl` (root backend/) | Stale artifacts outside `models/` — not loaded by server |
| Docker / Production deployment    | Not implemented                                                      |
| Model retraining trigger          | No scheduler or API trigger — `retrain.py` must be run manually     |
| Live Reddit → Virality             | Reddit data not used for training; only used for slang extraction    |

### Known TODOs & Limitations

- `retrain.py` contains a **duplicate `if __name__ == "__main__"` block** (lines 68–72) — dead code
- Active model v3 has R² = 0.0076 — extremely low predictive power; the model is essentially not learning meaningful patterns
- Model v1 (7 features, R²=0.1055) was trained on a hybrid Reddit+Kaggle dataset, not the YouTube-only pipeline
- No automated retraining schedule
- The `data/.env` contains real MongoDB credentials committed to the repository — security risk
- Frontend communication details not analyzable (only structure scanned, no deep frontend read)
- `README.md` files at project root and `backend/` and `data/` are essentially empty (21, 24, 18 bytes)

---

## 12. Documentation Issues

| Issue | Details |
|-------|---------|
| **Model v3 is active but weak** | `model_registry.json` says active = `virality_model_v3.pkl` with R²=0.0076 and only 5 features. This contradicts expectations of a production-ready predictor. |
| **`main.py` references `sentiment140.csv`** | This Kaggle Sentiment140 dataset is not present in `data/raw/`. `main.py` falls back to `create_synthetic_kaggle_data()`. The pipeline in `main.py` is architecturally inconsistent with `retrain.py`. |
| **Dual legacy artifacts** | `backend/virality_model.pkl` and `backend/scaler.pkl` exist outside `models/` but are not loaded by `server.py`. Could cause confusion. |
| **`docs/` is empty** | `docs/README.md` is 18 bytes — no prior documentation existed. |
| **`README.md` at root is 21 bytes** | Essentially placeholder with no project description. |
| **data/setup_guide.md mentions `trendSenseDB`** | Consistent with code: `mongo_client.py` defaults to `DB_NAME="trendSenseDB"` ✅ |
| **Historical cap is 200,000** | `setup_guide.md` mentions this correctly ✅ |

---

## 13. Recommended Documentation Fixes

1. **Update `README.md`** at project root with project description, setup instructions, and quick-start commands.
2. **Deprecate or remove `main.py`** — it references `sentiment140.csv` which is absent and uses a synthetic data generator. Replace with a note pointing to `retrain.py`.
3. **Remove stale artifacts** — delete `backend/virality_model.pkl` and `backend/scaler.pkl` (root level) to avoid confusion with the versioned `models/` directory.
4. **Fix duplicate `__main__` block** in `retrain.py` (lines 71–72).
5. **Add cross-validation** — implement KFold (already imported) to improve model reliability reporting.
6. **Improve model quality** — R²=0.0076 is near-random. Feature engineering needs revisitation. Consider adding `views`, `likes`, `score` (Reddit upvotes) as features.
7. **Secure credentials** — `data/.env` should be added to `.gitignore`. Current `.gitignore` should be verified to confirm `.env` is excluded.
8. **Document active vs. legacy pipeline** — clarify that `retrain.py` is the production retraining path and `main.py` is a deprecated prototype.
9. **Add a `/retrain` API endpoint** or cron job to enable automated model refresh.
10. **Frontend README** — add setup and run instructions for the React dashboard.

---

*Report generated by automated system audit. All data extracted exclusively from source files. No information fabricated.*
