from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import jd_parser, ability, roadmap, resume, interview

app = FastAPI(title="职途罗盘 API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(jd_parser.router, prefix="/api/jd", tags=["岗位解析"])
app.include_router(ability.router, prefix="/api/ability", tags=["能力诊断"])
app.include_router(roadmap.router, prefix="/api/roadmap", tags=["行动规划"])
app.include_router(resume.router, prefix="/api/resume", tags=["简历优化"])
app.include_router(interview.router, prefix="/api/interview", tags=["模拟面试"])


@app.get("/api/health")
async def health():
    return {"status": "ok"}
