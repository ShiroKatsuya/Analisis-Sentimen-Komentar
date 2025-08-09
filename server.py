import pickle
import sys

from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()  # <-- ini HARUS ada

# Load model dan vectorizer
with open('data_models/naive_bayes_model.pkl', 'rb') as f:
    model = pickle.load(f)
with open('data_models/tfidf_vectorizer.pkl', 'rb') as f:
    tfidf = pickle.load(f)

# Define a Pydantic model for the request body
class SentimentRequest(BaseModel):
    teks_baru: str

@app.post("/predict_sentiment/")
async def predict_sentiment(request_body: SentimentRequest):
    teks_baru = request_body.teks_baru
    fitur_baru = tfidf.transform([teks_baru])
    prediksi = model.predict(fitur_baru)
    sentiment = prediksi[0]

    # Calculate confidence score
    prediksi_proba = model.predict_proba(fitur_baru)
    confidence = float(prediksi_proba.max()) # Get the highest probability as confidence
    print("data confidence : ", confidence, flush=True)  # Ensure output is flushed to terminal

    return {"sentiment": sentiment, "confidence": confidence}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8888)