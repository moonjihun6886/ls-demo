from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# ===== Existing Demo Models =====
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str


# ===== Site Content Models =====
class CTA(BaseModel):
    dexUrl: Optional[str] = "#"
    telegram: Optional[str] = "#"
    twitter: Optional[str] = "#"

class Hero(BaseModel):
    title: str
    ticker: str
    subtitle: str
    ctas: CTA

class TokenomicsItem(BaseModel):
    label: str
    value: int
    note: str

class HowToBuyStep(BaseModel):
    step: int
    title: str
    detail: str

class RoadmapSection(BaseModel):
    title: str
    points: List[str]

class FAQItem(BaseModel):
    q: str
    a: str

class PublicConfig(BaseModel):
    contractAddress: Optional[str] = ""

class SiteContent(BaseModel):
    hero: Hero
    tokenomics: List[TokenomicsItem]
    howToBuy: List[HowToBuyStep]
    roadmap: List[RoadmapSection]
    faqs: List[FAQItem]
    config: PublicConfig


# ===== Defaults seeded on first run =====
DEFAULT_CONTENT: SiteContent = SiteContent(
    hero=Hero(
        title="KING OF GAMBLER",
        ticker="$KOG",
        subtitle=(
            "From cell to casino — the legendary Long Si is back to reclaim his throne. "
            "Dark. Rebellious. Unstoppable."
        ),
        ctas=CTA(dexUrl="#", telegram="#", twitter="#"),
    ),
    tokenomics=[
        TokenomicsItem(label="Liquidity", value=50, note="Locked at launch"),
        TokenomicsItem(label="Community & Airdrops", value=25, note="For real degens"),
        TokenomicsItem(label="Marketing", value=15, note="Partnerships & PR"),
        TokenomicsItem(label="CEX/Reserve", value=10, note="Strategic listings"),
    ],
    howToBuy=[
        HowToBuyStep(step=1, title="Get a Wallet", detail="Use MetaMask or any EVM-compatible wallet."),
        HowToBuyStep(step=2, title="Fund with ETH", detail="Transfer ETH to your wallet for gas and swaps."),
        HowToBuyStep(step=3, title="Go to DEX", detail="Use our DEX link and paste the $KOG contract."),
        HowToBuyStep(step=4, title="Swap & Hold", detail="Set slippage if needed. Welcome to the high-rollers club."),
    ],
    roadmap=[
        RoadmapSection(title="Phase I — Breakout", points=["Contract deploy", "Stealth + fair launch", "Community ignition"]),
        RoadmapSection(title="Phase II — Back to the Table", points=["DEX pools + liquidity", "Marketing waves", "Meme ops & partnerships"]),
        RoadmapSection(title="Phase III — Crown the King", points=["CEX outreach", "On-chain mini-games", "DAO vibes & community events"]),
    ],
    faqs=[
        FAQItem(q="What chain is $KOG on?", a="$KOG launches on Ethereum. Bridge/multichain decisions will be driven by the community."),
        FAQItem(q="When is DEX live?", a="DEX listing drops soon. Stay tuned on Telegram/Twitter for the exact time."),
        FAQItem(q="Is liquidity locked?", a="Yes. We lock liquidity at launch to protect holders."),
        FAQItem(q="What makes $KOG different?", a="A cinematic meme coin built on grit, risk, and comeback energy — with a bold dark-neo aesthetic."),
    ],
    config=PublicConfig(contractAddress=""),
)


async def get_or_seed_content() -> SiteContent:
    doc = await db.site_content.find_one({"_id": "kog_site"})
    if not doc:
        await db.site_content.update_one(
            {"_id": "kog_site"},
            {"$set": DEFAULT_CONTENT.model_dump()},
            upsert=True,
        )
        return DEFAULT_CONTENT
    # Remove Mongo _id if present and validate against model
    doc.pop("_id", None)
    return SiteContent(**doc)


# ===== Routes =====
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.model_dump())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**{k: v for k, v in status_check.items() if k != "_id"}) for status_check in status_checks]

# Public content fetch
@api_router.get("/content", response_model=SiteContent)
async def fetch_content():
    content = await get_or_seed_content()
    return content

# Admin update content (simple full replace). In future, protect via auth.
class SiteContentUpdate(SiteContent):
    pass

@api_router.put("/content", response_model=SiteContent)
async def update_content(payload: SiteContentUpdate):
    await db.site_content.update_one({"_id": "kog_site"}, {"$set": payload.model_dump()}, upsert=True)
    return payload

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()