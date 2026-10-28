# TrendSense: Multimodal YouTube Virality Prediction

TrendSense is a local full-stack app that scores a proposed YouTube video from its title, script hook, and thumbnail. It combines a trained PyTorch regression model with text and image models, then uses local Ollama models to describe the thumbnail and write coaching suggestions.

## What runs where

1. The Next.js dashboard collects a title, hook, thumbnail, and optional creator or trend entities.
2. FastAPI encodes title + hook with `all-MiniLM-L6-v2` (384 values), computes title-thumbnail cohesion with CLIP, and passes the resulting 385 values to the saved PyTorch MLP.
3. If entities were supplied, Qwen classifies their trend tier and the API applies a fixed multiplier. This multiplier is a heuristic, not a learned model output.
4. LLaVA describes the thumbnail. Qwen writes the final coaching report. These generated responses do not train or validate the numeric predictor.
5. The dashboard displays the score, cohesion, thumbnail description, and advice.

The score is an estimate based on the training labels. It is not a measured probability that a video will go viral.

## Project files

| File/folder | Purpose |
| --- | --- |
| `backend/v2_engine/api.py` | FastAPI `/analyze` endpoint; loads SBERT, CLIP, PyTorch checkpoint, and calls Ollama. |
| `backend/v2_engine/trendsense_core_v5.pt` | Saved state dictionary used by the API. |
| `backend/v2_engine/build_v5_dataset.py` | Reads transcript checkpoint chunks and thumbnails; builds the v8 Parquet feature dataset. |
| `backend/v2_engine/train_trendsense.py` | Trains the MLP and evaluates a held-out test split. |
| `backend/v2_engine/zeitgeist_engine.py` | Standalone local entity classification helper. |
| `backend/v2_engine/local_llm_reasoner.py` | Standalone local text reasoning helper. |
| `backend/v2_engine/vision_test.py` | Standalone LLaVA thumbnail test. |
| `backend/requirements.txt` | Pinned Python dependencies. |
| `data/spark_jobs/multimodal_etl.py` | Spark-based data processing pipeline. This is an offline data-preparation component, not the live API request path. |
| `frontend/` | Next.js dashboard. |
| `docs/SEMESTER_REPORT.md` | Accuracy report template, comparison options, and viva practice answers. |

## Requirements

- Windows 10/11, Python 3.11, and Node.js 20.9 or newer.
- NVIDIA GPU with a CUDA-capable driver recommended. This project currently requires CUDA in `api.py` and stops at startup if CUDA is unavailable.
- Ollama for local LLaVA and Qwen model calls.
- Java 17 or 21 only when running the PySpark data pipeline.
- A training dataset is needed to rebuild the predictor. The current checkout does not include the required transcript chunks, thumbnail collection, or `data/trendsense_v8_master.parquet`.

The tested machine used Python 3.11.9, PyTorch 2.11.0+cu130, an RTX 4050 Laptop GPU with 6 GB VRAM, Node 24.15.0, and npm 11.12.1. Ollama models use quantized variants to fit the available GPU memory.

## Windows setup in VS Code

Open the project folder in VS Code. In **Terminal → New Terminal**, choose PowerShell. Commands below assume the terminal starts at the project root.

### 1. Backend environment

```powershell
cd backend
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
```

If PowerShell blocks activation, run this once in the current terminal, then activate again:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1
```

Install the CUDA 13.0 PyTorch wheels first, then the rest of the pinned dependencies:

```powershell
python -m pip install torch==2.11.0 torchvision==0.26.0 torchaudio==2.11.0 --index-url https://download.pytorch.org/whl/cu130
python -m pip install -r requirements.txt
```

The requirements include the Ollama Python SDK, YouTube transcript client, and translator required by helper scripts. To check the environment:

```powershell
python -c "import torch; print('torch:', torch.__version__); print('CUDA:', torch.version.cuda); print('available:', torch.cuda.is_available()); print('GPU:', torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'not detected')"
python -m pip check
```

Expected on a compatible NVIDIA setup: `CUDA: 13.0`, `available: True`, and your GPU name. The installed driver should support the CUDA runtime bundled with the PyTorch wheel; a separate CUDA Toolkit is not required for normal PyTorch inference.

### 2. Install and start Ollama

Install Ollama for Windows from [ollama.com/download/windows](https://ollama.com/download/windows), then open a new PowerShell terminal and pull the model tags used by the app:

```powershell
ollama pull llava:7b-v1.6-mistral-q2_K
ollama pull qwen2.5:3b
```

For the standalone helper scripts, also pull:

```powershell
ollama pull llama3.2:3b-instruct-q4_K_M
```

Verify the models and service:

```powershell
ollama list
ollama run qwen2.5:3b "Reply with READY only."
```

Ollama stores models in `%USERPROFILE%\.ollama\models` by default. Hugging Face downloads for SBERT and CLIP are cached under the project root at `ml_cache\hub` by the API. The cache is ignored by Git.

### 3. Downloaded Hugging Face models and checkpoint

The first API launch downloads `sentence-transformers/all-MiniLM-L6-v2` and `openai/clip-vit-base-patch32` automatically into `ml_cache\hub`. The PyTorch checkpoint is loaded from `backend\v2_engine\trendsense_core_v5.pt`; it exists in this workspace and is now allowed by `.gitignore` so it can be included when you submit the project. The API does not use a separate Llama model for its numeric score.

| Model or file | Official source / command | Approx. size | Where stored and used |
| --- | --- | ---: | --- |
| SBERT `all-MiniLM-L6-v2` | [Hugging Face model card](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2); downloaded automatically | 90 MB | `ml_cache\hub`; loaded in `api.py` with `SentenceTransformer('all-MiniLM-L6-v2')` |
| CLIP `clip-vit-base-patch32` | [Hugging Face model card](https://huggingface.co/openai/clip-vit-base-patch32); downloaded automatically | 600 MB | `ml_cache\hub`; loaded in `api.py` through `CLIPModel` and `CLIPProcessor` |
| LLaVA `llava:7b-v1.6-mistral-q2_K` | [Ollama model page](https://ollama.com/library/llava/tags); `ollama pull llava:7b-v1.6-mistral-q2_K` | 3.3 GB | `%USERPROFILE%\.ollama\models`; API `model=` call in `api.py` |
| Qwen `qwen2.5:3b` | [Ollama model page](https://ollama.com/library/qwen2.5/tags); `ollama pull qwen2.5:3b` | 1.9 GB | `%USERPROFILE%\.ollama\models`; API `model=` calls in `api.py` |
| Llama `llama3.2:3b-instruct-q4_K_M` | [Ollama model page](https://ollama.com/library/llama3.2/tags); `ollama pull llama3.2:3b-instruct-q4_K_M` | 2.0 GB | `%USERPROFILE%\.ollama\models`; standalone helper scripts only |
| TrendSense MLP checkpoint | Included at `backend/v2_engine/trendsense_core_v5.pt` | About 0.6 MB | Loaded by `api.py`; replaced by trainer after a successful run |
| Training Parquet | Built by `build_v5_dataset.py` from source data | Depends on dataset | Expected at `data/trendsense_v8_master.parquet`; not included in this checkout |

Check installed Ollama tags with `ollama list`. The tested setup stores Ollama models in its default `%USERPROFILE%\.ollama\models` directory. Hugging Face model files go in `ml_cache\hub`.

### 4. Run the backend

The API prints an emoji during startup, so set UTF-8 mode in PowerShell before launch to avoid Windows console encoding errors:

```powershell
$env:PYTHONUTF8 = '1'
python -X utf8 -m uvicorn v2_engine.api:app --host 127.0.0.1 --port 8000
```

Keep this terminal open. API docs are at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

### 5. Run the frontend

Open a second VS Code terminal from the project root:

```powershell
cd frontend
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The frontend expects the API at `http://localhost:8000`.

## Spark setup (only for rebuilding data)

The ETL scripts use PySpark 4.1.1, which needs Java 17 or 21. Install Temurin JDK 17 from [Adoptium](https://adoptium.net/installation/), or use `winget install EclipseAdoptium.Temurin.17.JDK`. Restart VS Code after installing so `PATH` updates. Check Java:

```powershell
java -version
$env:JAVA_HOME
```

If Java is installed but `JAVA_HOME` is not set, set it in the current terminal to the actual JDK directory, for example:

```powershell
$env:JAVA_HOME = 'C:\Program Files\Eclipse Adoptium\jdk-17.0.x.x-hotspot'
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
```

Use the real folder name shown on your computer in place of `jdk-17.0.x.x-hotspot`. Spark can be checked with:

```powershell
python -c "from pyspark.sql import SparkSession; s=SparkSession.builder.master('local[1]').appName('TrendSenseCheck').getOrCreate(); print(s.version, s.range(3).count()); s.stop()"
```

Spark is for dataset preparation. It is not required to run the frontend or `/analyze` API.

## Rebuild and train (requires the source data)

The current dataset builder expects:

- transcript checkpoint Parquet files under `data/checkpoints/`
- matching thumbnail image files under `data/thumbnails/`
- output at `data/trendsense_v8_master.parquet`

These source files are not included in this checkout. Do not run the builder or training script until you have them. Once present, from `backend` with `.venv` active:

```powershell
$env:PYTHONUTF8 = '1'
python -X utf8 v2_engine/build_v5_dataset.py
python -X utf8 v2_engine/train_trendsense.py
```

The training script uses a seeded 70% train / 15% validation / 15% test split, an MLP (385 → 256 → 128 → 64 → 1), MAE loss, Adam with weight decay, dropout, batch normalization, gradient clipping, learning-rate reduction, and early stopping. The held-out test set is used once for final reporting. Outputs and exact metrics are described in `docs/SEMESTER_REPORT.md`.

## Important interpretation notes

- The dataset builder creates percentile labels from engagement rate. The result is a relative ranking score for the dataset, not a guaranteed future view count.
- The entity tier multiplier is hand-set in the API and can raise the final score. Evaluate the base MLP separately from the post-processing multiplier.
- The old README's `3,200+ videos` and `Test MAE ~21.01` statements were not verifiable from the files in this checkout, so they are not reported as measured results here.
- Missing training data means no honest before/after accuracy claim or training graph can be generated yet. See `docs/SEMESTER_REPORT.md` for the report layout and required next step.

## License

Distributed under the MIT License.
