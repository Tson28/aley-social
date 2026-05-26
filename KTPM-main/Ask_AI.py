import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from groq import Groq
from typing import Optional
from fastapi.middleware.cors import CORSMiddleware
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="LLAMA API",
    description="API for interacting with LLAMA model",
    version="1.0.0"
)

# CORS middleware - Fixed: Remove allow_credentials when using allow_origins=["*"
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

API_KEY = os.getenv("GROQ_API_KEY", "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")
client = Groq(api_key=API_KEY)

class ChatRequest(BaseModel):
    message: str
    temperature: Optional[float] = 1.0
    max_tokens: Optional[int] = 1024
    top_p: Optional[float] = 1.0
    stream: Optional[bool] = False

class ChatResponse(BaseModel):
    response: str

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    logger.info(f"Received chat request: {request.message[:50]}...")

    try:
        if not API_KEY:
            logger.error("GROQ API key is missing")
            raise HTTPException(status_code=500, detail="GROQ API key is not configured")

        logger.info("Calling Groq API...")
        completion = client.chat.completions.create(
            model="llama3-70b-8192",
            messages=[
                {"role": "user", "content": request.message}
            ],
            temperature=request.temperature,
            max_tokens=request.max_tokens,
            top_p=request.top_p,
            stream=request.stream
        )

        if request.stream:
            response_text = ""
            for chunk in completion:
                response_text += chunk.choices[0].delta.content or ""
            logger.info("Streaming response complete")
            return ChatResponse(response=response_text)
        else:
            response = completion.choices[0].message.content
            logger.info(f"Got response: {response[:50]}...")
            return ChatResponse(response=response)

    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000) 