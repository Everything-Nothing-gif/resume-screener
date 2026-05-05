# AI-Based Resume Screening System
### B.Tech Project — Computer Science & Engineering | 2025-2026
**Authors:** Aditya Raj Singh (2401030332) · Harsh Bhardwaj (2401030333)  
**Submitted To:** Mr. Prateek Soni

---

## 📋 Project Overview

An intelligent web-based recruitment support system that automates resume screening using **Natural Language Processing** and **Machine Learning** techniques. The system parses resumes, extracts skills, computes semantic similarity against job descriptions, and ranks candidates.

---

## 🏗️ Architecture

```
resume-screener/
├── backend/
│   └── main.py          ← FastAPI server (NLP engine)
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   └── components/
│   │       ├── Header.jsx
│   │       ├── ScreeningForm.jsx
│   │       └── Results.jsx
│   └── package.json
├── start.sh             ← Start both servers
└── README.md
```

The system follows the **Pipe-and-Filter Architecture** described in the synopsis:

```
Upload → Text Extraction → NLP Processing → TF-IDF Vectorization → Cosine Similarity → Ranked Results
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React.js, Recharts, Lucide Icons |
| **Backend** | Python 3, FastAPI |
| **NLP/AI** | scikit-learn (TF-IDF), pdfminer.six |
| **Algorithms** | TF-IDF Vectorization, Cosine Similarity |
| **Dev Tools** | Vite, npm, uvicorn |

---

## ⚙️ Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 18+
- npm

### Backend Setup

```bash
cd backend
pip install fastapi uvicorn python-multipart pdfminer.six scikit-learn numpy
python3 -m uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`  
Interactive API docs: `http://localhost:8000/docs`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`

### Quick Start (Both at once)

```bash
chmod +x start.sh
./start.sh
```

---

## 🔬 How the NLP Works

### 1. Text Extraction
- PDF files: parsed using `pdfminer.six`
- TXT files: direct UTF-8 decoding
- Sections identified: name, email, phone, education signals, experience signals

### 2. Skill Detection
- Regex matching against a curated list of 50+ technical skills (Python, ML, React, Docker, etc.)
- Soft skills detection (communication, leadership, problem solving, etc.)

### 3. TF-IDF Vectorization
```python
vectorizer = TfidfVectorizer(stop_words=STOPWORDS, ngram_range=(1, 2))
tfidf_matrix = vectorizer.fit_transform([job_description, resume])
```
- Converts text to numerical vectors
- N-gram range (1,2) captures phrases like "machine learning"

### 4. Cosine Similarity
```python
cosine_sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])
```
- Measures angle between JD vector and resume vector
- Range: 0 (no similarity) to 1 (identical)

### 5. Weighted Scoring
```
Final Score = (Cosine Similarity × 0.50) + (Skill Match × 0.30) + (Keyword Overlap × 0.20)
```

---

## 📡 API Endpoints

### `POST /screen`
Screen multiple resumes against a job description.

**Request:** `multipart/form-data`
- `job_description` (string)
- `resumes` (files, multiple)

**Response:**
```json
{
  "total": 3,
  "candidates": [
    {
      "rank": 1,
      "filename": "resume.pdf",
      "name": "John Doe",
      "final_score": 78.5,
      "cosine_similarity": 82.1,
      "skill_match": 90.0,
      "keyword_match": 61.2,
      "matched_skills": ["python", "fastapi", "nlp"],
      "missing_skills": ["docker"],
      "all_skills": { "technical": [...], "soft": [...] }
    }
  ]
}
```

### `POST /parse`
Parse a single resume and extract structured information.

---

## 🧪 Testing

Test the API directly via FastAPI's built-in Swagger UI at:
```
http://localhost:8000/docs
```

### Manual Test with curl
```bash
curl -X POST "http://localhost:8000/screen" \
  -F "job_description=Python developer with ML and FastAPI experience" \
  -F "resumes=@path/to/resume.pdf"
```

---

## 📊 Software Engineering Methodology

As per the synopsis, this project follows the **Agile Incremental Process Model**:

- **Phase 1 (Done):** Requirements & SRS → This README + synopsis
- **Phase 2 (Done):** System Design → Pipe-and-Filter architecture, REST API design
- **Phase 3 (Done):** Implementation → Full working system
- **Phase 4 (Ongoing):** Testing → Manual testing via Swagger UI + frontend

---

## 🎯 Future Enhancements

- [ ] Add word embeddings (Word2Vec / BERT) for deeper semantic matching
- [ ] PostgreSQL database to store historical screening results
- [ ] Docker containerization for easy deployment
- [ ] Bias detection module
- [ ] Export results to CSV/Excel
- [ ] Email shortlisted candidates directly from the dashboard

---

## 📚 References

1. Roger S. Pressman, *Software Engineering: A Practitioner's Approach*, McGraw-Hill, 2014.
2. Ian Sommerville, *Software Engineering*, 10th Edition, Pearson, 2015.
3. scikit-learn Official Documentation — https://scikit-learn.org
4. NLTK Documentation — https://www.nltk.org
5. FastAPI Documentation — https://fastapi.tiangolo.com
