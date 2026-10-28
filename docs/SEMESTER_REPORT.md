# TrendSense semester report notes

## Verified environment

| Item | Verified result |
| --- | --- |
| Python | 3.11.9 in `backend/.venv` |
| PyTorch | 2.11.0+cu130; CUDA runtime 13.0 |
| GPU | NVIDIA GeForce RTX 4050 Laptop GPU; CUDA available |
| Python packages | `pip check` reported no broken requirements |
| API path | Sample multipart `/analyze` request returned HTTP 200 with a score, CLIP cohesion, LLaVA description, and Qwen advice |
| Ollama models | API models `llava:7b-v1.6-mistral-q2_K` and `qwen2.5:3b` pulled and called successfully; `llama3.2:3b-instruct-q4_K_M` checked with helper |
| Spark | PySpark 4.1.1 created a local session and counted 3 rows with Temurin Java 17 |

The sample API result proves the software path runs. It does not measure prediction accuracy because the sample has no verified ground-truth label.

## Accuracy report: fill after restoring the dataset

The source files needed to build the training data were absent during this setup: `data/checkpoints/`, `data/thumbnails/`, and `data/trendsense_v8_master.parquet`. The earlier README's claimed 3,200+ rows and MAE 21.01 could not be reproduced from the available files. Keep the table below blank until a training run produces held-out metrics.

| Version | Dataset and split | Test MAE (0–100 points; lower is better) | Within ±10 points | Within ±20 points | Notes |
| --- | --- | ---: | ---: | ---: | --- |
| Previous model | Verify the old checkpoint's original dataset and split | Not available in this checkout | Not available | Not available | Do not copy the old README's unverified MAE claim. |
| Updated MLP | v8 dataset; seeded 70/15/15 split | Pending training data | Pending | Pending | `train_trendsense.py` writes these results after training. |

Run from `backend` after restoring source files and activating `.venv`:

```powershell
$env:PYTHONUTF8 = '1'
python -X utf8 v2_engine/build_v5_dataset.py
python -X utf8 v2_engine/train_trendsense.py
```

The trainer saves `training_history.csv`, `test_predictions.csv`, `evaluation_results.json`, and interactive `training_curves.html` / `test_predictions.html` under `docs/training_results/`. The held-out test set is not used to pick the best epoch; validation MAE controls early stopping and checkpoint selection.

For a fair before/after claim, evaluate both old and updated checkpoints on the same untouched test rows, with the same feature generation and label definition. Report the exact row counts, random seed, target definition, and test MAE. Do not compare scores from different data splits or targets as if they were directly equivalent. The numeric model score should be evaluated before the optional entity multiplier, and any final API score should be evaluated separately.

## Improvement options considered

| Option | Why it fits | Expected gain | Difficulty / time | Hardware |
| --- | --- | --- | --- | --- |
| Clean labels, deduplicate videos, and split by channel or upload time | Reduces label noise and leakage; directly targets the weakest evidence in the current pipeline | Potentially high, but must be measured | Medium; depends on source data | CPU/GPU; Spark helps for large input |
| Keep the 385-feature MLP and add reproducible validation, early stopping, weight decay, and error analysis | Appropriate for the current tabular vector input; exposes overfitting and improves model selection | Moderate and measurable; no gain is guaranteed | Low to medium; hours once data exists | Existing RTX 4050 is sufficient |
| Fine-tune SBERT or CLIP end to end | Could adapt representations to creator/video language and thumbnail semantics | Uncertain; often limited by labeled data size | High; days and careful tuning | More VRAM preferred; 6 GB is restrictive |
| Add an LSTM/Transformer over transcripts or LoRA for Ollama models | Models sequence/context or improves generated advice | Does not automatically improve the scalar predictor; advice quality needs a separate evaluation | High; days | More VRAM or cloud GPU recommended |

**Recommended:** first recover and validate the dataset, then use the current MLP with channel/time-aware splits and the improved training/evaluation artifacts. This choice fits the current 385-dimensional feature set and 6 GB GPU. Only fine-tune encoders after the dataset is available and a held-out baseline is recorded. LLM coaching should remain a separate qualitative feature unless it is given its own measured target and evaluation.

## What the model learns (viva explanation)

The trainer concatenates a 384-number SBERT embedding of the title and hook with one CLIP title-thumbnail cohesion value. Its MLP maps the 385 inputs through 256, 128, and 64 hidden units to one regression score. ReLU adds nonlinearity; batch normalization stabilizes hidden activations; dropout randomly disables some units during training to reduce memorization. MAE is the average absolute distance from the target score. Adam updates weights using backpropagation; weight decay penalizes overly large weights; gradient clipping limits unusually large updates. The scheduler lowers the learning rate after validation stalls, and early stopping restores the checkpoint with the best validation MAE.

The v8 builder creates its target by ranking engagement rate as a percentile. That target is relative to the collected dataset. It does not mean a video has that probability of going viral, nor does it predict an absolute view count. The API's fixed entity multipliers are hand-coded rules and are not learned by the MLP.

## Viva questions and short answers

1. **What problem does TrendSense solve?** It gives creators an early estimate and feedback for a title, hook, and thumbnail before publishing.
2. **What are the model inputs?** A 384-dimensional SBERT embedding for title plus hook, and one CLIP title-thumbnail cohesion value, giving 385 numeric features.
3. **Why use SBERT?** It turns sentence meaning into a compact vector that the MLP can use as numeric input.
4. **Why use CLIP?** It compares text and image representations to estimate whether the thumbnail matches the title.
5. **Where is deep learning used?** In the PyTorch MLP, and inside pretrained SBERT, CLIP, LLaVA, and Qwen models.
6. **Why use MAE?** The output is a continuous 0–100 score, and MAE is easy to explain as average error in score points.
7. **What do dropout and weight decay do?** They discourage the network from memorizing training examples, which can improve performance on unseen examples.
8. **What is early stopping?** Training stops when validation error no longer improves, and the best validation checkpoint is kept.
9. **What is the Big Data component?** PySpark transforms transcript and thumbnail data into Parquet features. Spark is used in offline preparation, not for each prediction request.
10. **How do you know accuracy improved?** Compare both versions on the same held-out examples and label definition; report MAE and error-within-tolerance rates. No improvement claim is valid until this comparison is run.

## Limitations to state clearly

- The training source dataset is missing from the current checkout, so updated test metrics and accuracy graphs are pending.
- The existing `.pt` checkpoint can run the API but cannot establish how it was trained or prove its accuracy.
- The optional trend multiplier is a manually chosen heuristic and can inflate scores independently of the learned model.
- LLaVA descriptions and Qwen coaching are generated text; they can be wrong and are not part of the measured regression target.
