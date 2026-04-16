import logging

from fastapi import APIRouter, HTTPException

from app.models.schemas import ResumeRequest, ResumeResponse
from app.services.llm_service import chat_json

logger = logging.getLogger(__name__)

router = APIRouter()

SYSTEM_PROMPT = """你是一位拥有15年经验的资深 HR，曾在多家互联网大厂负责校招和社招。你阅简历无数，对什么样的简历能通过筛选了如指掌。

## 你的任务
根据用户提供的简历内容和目标岗位信息，对简历进行全面评估和优化：
1. **总评分**（0-100分）
2. **分维度评分**（5个维度，每个维度 0-20 分）
3. **具体优化建议**（逐条对比原文和修改建议）
4. **缺失关键词**（简历中缺少但 JD 中要求的关键词）
5. **优化后的简历全文**

## 输出格式要求
你必须严格以 JSON 格式返回，不要添加任何其他文字说明。JSON 结构如下：
```json
{
  "total_score": 75,
  "scores": [
    {"dimension": "内容完整度", "score": 16, "comment": "评语"},
    {"dimension": "岗位匹配度", "score": 14, "comment": "评语"},
    {"dimension": "量化成果", "score": 12, "comment": "评语"},
    {"dimension": "排版结构", "score": 17, "comment": "评语"},
    {"dimension": "亮点突出", "score": 16, "comment": "评语"}
  ],
  "suggestions": [
    {"original": "原文内容", "improved": "修改建议", "reason": "修改原因"}
  ],
  "missing_keywords": ["关键词1", "关键词2"],
  "optimized_resume": "优化后的完整简历文本"
}
```

## 注意事项
- total_score 为 5 个维度分数之和（0-100）
- scores 必须包含 5 个维度：内容完整度、岗位匹配度、量化成果、排版结构、亮点突出
- 每个维度 score 范围 0-20
- suggestions 至少 3 条，original 要引用简历原文
- missing_keywords 至少 2 个（如果没有 JD 则可以为空数组）
- optimized_resume 要输出完整的优化后简历文本
- 所有内容用中文"""


@router.post("/optimize", response_model=ResumeResponse)
async def optimize_resume(request: ResumeRequest):
    """优化简历，提供评分和改进建议。"""
    try:
        user_prompt = f"请优化以下简历：\n\n"
        user_prompt += f"目标岗位：{request.target_job}\n\n"
        if request.jd_text:
            user_prompt += f"目标岗位 JD：\n{request.jd_text}\n\n"
        user_prompt += f"简历原文：\n{request.resume_text}"

        result = await chat_json(SYSTEM_PROMPT, user_prompt, temperature=0.5)
        return ResumeResponse(**result)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"简历优化失败: {e}")
        raise HTTPException(status_code=500, detail=f"简历优化服务异常：{str(e)}")
