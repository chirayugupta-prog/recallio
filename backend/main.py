from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# These imports link your folders together
from app.api import gmail, chat, search 

app = FastAPI(title="Recallio API")

# Add CORS so your Next.js frontend can talk to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000",
    "https://recallio-sooty.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connect the routers
app.include_router(gmail.router)
app.include_router(chat.router)
app.include_router(search.router)

@app.get("/")
def root():
    return {"status": "Recallio API is Modular and Running"}