from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import List
import re
import io
import math
from pdfminer.high_level import extract_text
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

app = FastAPI(title="AI Resume Screener API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# NLP  

STOPWORDS = {
    "a","an","the","and","or","but","in","on","at","to","for","of","with",
    "is","was","are","were","be","been","being","have","has","had","do","does",
    "did","will","would","could","should","may","might","shall","can","need",
    "this","that","these","those","i","we","you","he","she","they","it","my",
    "our","your","his","her","their","its","me","us","him","them","who","what",
    "which","when","where","how","from","by","about","as","into","through",
    "during","before","after","above","below","between","each","than","so",
    "if","then","else","while","not","no","nor","yet","both","either","each",
}

TECH_SKILLS = [
    "python","java","javascript","typescript","c++","c#","go","rust","swift",
    "react","angular","vue","nodejs","django","flask","fastapi","spring",
    "machine learning","deep learning","nlp","natural language processing",
    "tensorflow","pytorch","keras","scikit-learn","pandas","numpy",
    "sql","mysql","postgresql","mongodb","redis","elasticsearch",
    "aws","azure","gcp","docker","kubernetes","ci/cd","git","github",
    "html","css","bootstrap","tailwind","rest api","graphql","microservices",
    "data analysis","data science","computer vision","reinforcement learning",
    "agile","scrum","devops","linux","bash","shell scripting",
    "object oriented","oop","algorithms","data structures","system design",
    "excel","power bi","tableau","spark","hadoop","kafka",
    "android","ios","flutter","react native","mobile development",
]

SOFT_SKILLS = [
    "communication","leadership","teamwork","problem solving","critical thinking",
    "time management","adaptability","creativity","collaboration","presentation",
    "analytical","detail oriented","self motivated","organized","proactive",
]

EDUCATION_KEYWORDS = [
    "b.tech","m.tech","btech","mtech","bachelor","master","phd","mba",
    "b.sc","m.sc","degree","engineering","computer science","information technology",
    "cgpa","gpa","percentage",
]

EXPERIENCE_KEYWORDS = [
    "internship","intern","experience","project","worked","developed",
    "implemented","designed","built","created","led","managed","maintained",
    "deployed","integrated","collaborated",
]


def clean_text(text: str) -> str:
    text = text.lower()
    text = re.sub(r'[^\w\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def extract_skills(text: str):
    text_lower = text.lower()
    tech = [s for s in TECH_SKILLS if s in text_lower]
    soft = [s for s in SOFT_SKILLS if s in text_lower]
    return {"technical": tech, "soft": soft}


def extract_sections(text: str) -> dict:
    text_lower = text.lower()
    sections = {}

    # Education
    edu_matches = [kw for kw in EDUCATION_KEYWORDS if kw in text_lower]
    sections["education"] = len(edu_matches)

    # Experience
    exp_matches = [kw for kw in EXPERIENCE_KEYWORDS if kw in text_lower]
    sections["experience"] = len(exp_matches)

    # Contact info
    email = re.findall(r'\b[\w._%+-]+@[\w.-]+\.\w{2,}\b', text)
    phone = re.findall(r'\b[\d\s\-\+\(\)]{10,15}\b', text)
    sections["email"] = email[0] if email else None
    sections["phone"] = phone[0].strip() if phone else None

    # Name heuristic: first non-empty line
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    sections["name"] = lines[0] if lines else "Unknown"

    return sections


def score_resume(resume_text: str, jd_text: str) -> dict:
    clean_resume = clean_text(resume_text)
    clean_jd = clean_text(jd_text)

    # TF-IDF cosine similarity
    try:
        vectorizer = TfidfVectorizer(stop_words=list(STOPWORDS), ngram_range=(1, 2))
        tfidf_matrix = vectorizer.fit_transform([clean_jd, clean_resume])
        cosine_sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
    except Exception:
        cosine_sim = 0.0

    # Skill overlap score
    jd_skills = extract_skills(jd_text)
    resume_skills = extract_skills(resume_text)

    jd_tech_set = set(jd_skills["technical"])
    resume_tech_set = set(resume_skills["technical"])

    if jd_tech_set:
        tech_overlap = len(jd_tech_set & resume_tech_set) / len(jd_tech_set)
    else:
        tech_overlap = len(resume_tech_set) / max(len(TECH_SKILLS), 1) * 0.5

    # Keyword frequency score
    jd_words = set(clean_jd.split()) - STOPWORDS
    resume_words = set(clean_resume.split()) - STOPWORDS
    if jd_words:
        keyword_overlap = len(jd_words & resume_words) / len(jd_words)
    else:
        keyword_overlap = 0.0

    # Weighted final score
    final_score = (
        cosine_sim * 0.50 +
        tech_overlap * 0.30 +
        keyword_overlap * 0.20
    )

    return {
        "cosine_similarity": round(float(cosine_sim) * 100, 1),
        "skill_match": round(float(tech_overlap) * 100, 1),
        "keyword_match": round(float(keyword_overlap) * 100, 1),
        "final_score": round(float(final_score) * 100, 1),
        "matched_skills": list(jd_tech_set & resume_tech_set),
        "missing_skills": list(jd_tech_set - resume_tech_set),
        "all_skills": resume_skills,
    }


def extract_text_from_pdf(file_bytes: bytes) -> str:
    try:
        text = extract_text(io.BytesIO(file_bytes))
        return text.strip()
    except Exception as e:
        return ""


# Routes 

@app.get("/")
def root():
    return {"status": "AI Resume Screener API running"}


@app.post("/screen")
async def screen_resumes(
    job_description: str = Form(...),
    resumes: List[UploadFile] = File(...),
):
    if not job_description.strip():
        raise HTTPException(400, "Job description is required")
    if not resumes:
        raise HTTPException(400, "At least one resume is required")

    results = []
    for resume_file in resumes:
        content = await resume_file.read()

        filename = resume_file.filename or "resume"
        if filename.lower().endswith(".pdf"):
            text = extract_text_from_pdf(content)
        else:
            try:
                text = content.decode("utf-8", errors="ignore")
            except Exception:
                text = ""

        if not text.strip():
            results.append({
                "filename": filename,
                "error": "Could not extract text from file",
                "final_score": 0,
            })
            continue

        sections = extract_sections(text)
        scores = score_resume(text, job_description)

        results.append({
            "filename": filename,
            "name": sections["name"],
            "email": sections["email"],
            "phone": sections["phone"],
            "education_indicators": sections["education"],
            "experience_indicators": sections["experience"],
            **scores,
        })

    results.sort(key=lambda x: x.get("final_score", 0), reverse=True)

    for i, r in enumerate(results):
        r["rank"] = i + 1

    return {
        "total": len(results),
        "job_description_preview": job_description[:200] + "..." if len(job_description) > 200 else job_description,
        "candidates": results,
    }


@app.post("/parse")
async def parse_resume(file: UploadFile = File(...)):
    content = await file.read()
    filename = file.filename or "resume"

    if filename.lower().endswith(".pdf"):
        text = extract_text_from_pdf(content)
    else:
        text = content.decode("utf-8", errors="ignore")

    if not text.strip():
        raise HTTPException(400, "Could not extract text from file")

    sections = extract_sections(text)
    skills = extract_skills(text)

    return {
        "filename": filename,
        "name": sections["name"],
        "email": sections["email"],
        "phone": sections["phone"],
        "technical_skills": skills["technical"],
        "soft_skills": skills["soft"],
        "text_preview": text[:500],
        "word_count": len(text.split()),
    }
