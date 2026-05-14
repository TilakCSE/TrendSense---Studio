# 📈 TrendSense: Multi-Modal Virality Prediction Engine

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.11-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![PyTorch](https://img.shields.io/badge/PyTorch-Deep_Learning-EE4C2C.svg)

> **TrendSense** is a full-stack, multi-modal Machine Learning application designed to predict a YouTube video's organic reach *before* it is published. By combining semantic text analysis, computer vision, and locally-hosted generative AI, it acts as an autonomous AI Creator Assistant.

---

## 🧠 What is TrendSense?

TrendSense eliminates the "post-and-pray" guesswork of content creation. Instead of relying on traditional analytics, it uses a custom-trained **Two-Stream Ensemble PyTorch Neural Network** to evaluate a proposed Video Title, Script Hook, and Thumbnail.

It calculates a **Percentile Virality Index (0-100)** based on patterns learned from thousands of viral videos and uses local LLMs (Llama 3 & LLaVA) to generate actionable creator insights for improving retention and click-through rates.

---

## ✨ Key Features

- **Multi-Modal Prediction Engine**  
  Combines Text (SBERT) and Vision (CLIP) embeddings for virality prediction.

- **Thumbnail-Title Cohesion Scoring**  
  Uses CLIP with custom image preprocessing to verify if thumbnails fulfill title promises.

- **Local Generative AI Coach**  
  Uses LLaVA and Llama 3 locally via Ollama for hook rewrites and thumbnail critiques.

- **Dynamic Trend Multipliers**  
  Detects internet entities and trending topics to amplify prediction weighting.

- **Cinematic Next.js Dashboard**  
  Premium UI built with React, Three.js, Framer Motion, and modern animations.

- **100% Local Inference**  
  Runs fully offline with zero cloud API dependency.

---

## 🛠 Technical Stack

### Frontend
- React 19
- Next.js 15 (App Router)
- Tailwind CSS v4
- Three.js / React Three Fiber
- Framer Motion
- GSAP
- Recharts

### Backend
- Python 3.11
- FastAPI
- Uvicorn
- PyTorch
- SentenceTransformers (SBERT)
- OpenAI CLIP
- Ollama (`llama3`, `llava`)

### Data Engineering
- Apache Spark (PySpark)
- YouTube Transcript API
- Parquet datasets
- Kaggle Cloud Compute

---

## ⚙️ System Architecture

TrendSense operates using a 4-stage inference pipeline:

### 1. Math Engine
Encodes title and hook text into semantic vectors while analyzing thumbnail cohesion using CLIP.

### 2. Vision Engine
LLaVA extracts semantic visual meaning from the uploaded thumbnail.

### 3. Culture Engine
Llama 3 evaluates current internet trends and entity popularity.

### 4. Strategic Reasoner
Generates a final AI coaching report with optimization suggestions.

---

## 📊 Dataset & Training

The model was trained on a curated dataset of **3,200+ viral YouTube videos**.

### Training Highlights
- Custom percentile-based engagement scoring
- Weighted virality metrics
- SBERT + CLIP tensor fusion
- PyTorch MLP architecture

### Model Performance
- Test MAE: ~21.01
- Percentile prediction range: 0–100

---

## 🚀 Installation & Setup

## Prerequisites

- Python 3.11+
- Node.js v18+
- NVIDIA GPU recommended
- Ollama installed locally

---

## 1. Clone Repository

```bash
git clone https://github.com/YourUsername/TrendSense.git
cd TrendSense
```

---

## 2. Pull Local Models

```bash
ollama pull llama3
ollama pull llava
```

---

## 3. Backend Setup

```bash
cd backend

python -m venv .venv

# Windows
source .venv/Scripts/activate

# Linux / Mac
# source .venv/bin/activate

pip install -r requirements.txt

python v2_engine/api.py
```

Backend runs on:

```text
http://localhost:8000
```

---

## 4. Frontend Setup

Open another terminal:

```bash
cd frontend

npm install
npm run dev
```

Frontend runs on:

```text
http://localhost:3000
```

---

# 📁 Project Structure

```text
TrendSense/
├── backend/
│   ├── v2_engine/
│   │   ├── api.py
│   │   ├── train_trendsense.py
│   │   └── build_v5_dataset.py
│   ├── models/
│   └── requirements.txt
│
├── frontend/
│   ├── src/app/
│   ├── src/components/
│   └── tailwind.config.ts
│
└── data/
    ├── spark_jobs/
    └── trendsense_v7_master.parquet
```

---

# 📸 Screenshots


- Landing Page
  <img width="1902" height="1075" alt="image" src="https://github.com/user-attachments/assets/3ac3c92b-33ea-4e1a-bc83-346887cbed67" />
- Dashboard
  <img width="1902" height="1079" alt="image" src="https://github.com/user-attachments/assets/529ad7b0-d187-470d-a99c-8a562b8b381b" />
- Prediction Results
  <img width="1435" height="886" alt="Screenshot 2026-05-10 174323" src="https://github.com/user-attachments/assets/d461f220-179e-441c-9015-0c7c396a0dc9" />
- AI Coaching Report
  <img width="1503" height="863" alt="Screenshot 2026-05-10 174438" src="https://github.com/user-attachments/assets/5bdf0b9e-ec18-47ef-8db3-d2243c02c1d7" />


---

# 🧪 Future Improvements

- Real-time trend scraping
- YouTube API integration
- Multi-platform prediction (TikTok/Reels)
- Fine-tuned proprietary LLM
- Cloud deployment support

---

# 📜 License

Distributed under the MIT License.

---

# 👨‍💻 Author

Built as an AI + Big Data + Machine Learning project focused on multi-modal virality prediction and local AI inference.

---

# ⭐ Support

If you like the project, consider starring the repository.
