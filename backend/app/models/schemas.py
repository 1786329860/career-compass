from pydantic import BaseModel


# ============================================================
# 模块1：JD解析
# ============================================================

class JDParserRequest(BaseModel):
    jd_text: str  # JD 原文
    job_title: str = ""  # 可选，职位名
    company: str = ""  # 可选，公司名


class SkillItem(BaseModel):
    name: str
    level: str  # 初级/中级/高级
    importance: str  # 必备/加分/可后期补


class JDParserResponse(BaseModel):
    daily_tasks: list[str]  # 真实日常工作内容
    skills: list[SkillItem]  # 能力要求
    salary_range: str  # 薪资区间
    career_path: str  # 职业发展路径
    fit_questions: list[str]  # 适配度自评问题


# ============================================================
# 模块2：能力诊断
# ============================================================

class AbilityRequest(BaseModel):
    major: str
    grade: str  # 大三/大四/已毕业
    skills_known: list[str]
    internship: str
    projects: str
    target_job: str


class AbilityDimension(BaseModel):
    name: str
    score: int  # 1-5
    comment: str


class GapItem(BaseModel):
    skill: str
    status: str  # 已具备/部分具备/缺失
    suggestion: str


class AbilityResponse(BaseModel):
    radar: list[AbilityDimension]  # 6个维度
    gaps: list[GapItem]
    priority_actions: list[str]
    learning_resources: list[str]


# ============================================================
# 模块3：行动规划
# ============================================================

class RoadmapRequest(BaseModel):
    target_job: str
    current_status: str  # 大三/大四/已毕业
    available_time: str  # 如"3个月"
    ability_result: dict = {}  # 可选，模块2的结果


class TaskItem(BaseModel):
    week: int
    title: str
    description: str
    milestone: bool = False


class RoadmapResponse(BaseModel):
    total_weeks: int
    tasks: list[TaskItem]
    milestones: list[str]
    tips: list[str]


# ============================================================
# 模块4：简历优化
# ============================================================

class ResumeRequest(BaseModel):
    resume_text: str
    target_job: str
    jd_text: str = ""


class ResumeScore(BaseModel):
    dimension: str
    score: int  # 0-20
    comment: str


class ResumeSuggestion(BaseModel):
    original: str
    improved: str
    reason: str


class ResumeResponse(BaseModel):
    total_score: int  # 0-100
    scores: list[ResumeScore]
    suggestions: list[ResumeSuggestion]
    missing_keywords: list[str]
    optimized_resume: str


# ============================================================
# 模块5：模拟面试
# ============================================================

class InterviewStartRequest(BaseModel):
    job_type: str  # 技术面/HR面/行为面
    target_job: str
    difficulty: str = "基础"  # 基础/进阶


class InterviewMessage(BaseModel):
    session_id: str
    role: str  # user/assistant
    content: str


class InterviewStartResponse(BaseModel):
    session_id: str
    first_question: str


class InterviewChatRequest(BaseModel):
    session_id: str
    user_answer: str


class InterviewReportRequest(BaseModel):
    session_id: str


class InterviewChatResponse(BaseModel):
    ai_reply: str
    is_finished: bool
    question_count: int


class InterviewReportItem(BaseModel):
    question: str
    user_answer: str
    score: int  # 1-10
    feedback: str
    reference_answer: str


class InterviewReportResponse(BaseModel):
    total_score: int  # 1-10
    dimension_scores: list[AbilityDimension]
    details: list[InterviewReportItem]
    top_improvements: list[str]
