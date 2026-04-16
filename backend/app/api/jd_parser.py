import json
import logging

from fastapi import APIRouter, HTTPException

from app.models.schemas import JDParserRequest, JDParserResponse
from app.services.llm_service import chat_json

logger = logging.getLogger(__name__)

router = APIRouter()

SYSTEM_PROMPT = """你是一位拥有10年经验的资深猎头，擅长深度解读职位描述（JD），帮助求职者真正理解岗位需求。

## 你的任务
根据用户提供的 JD 原文，深度解析该岗位的：
1. **真实日常工作内容**（不是 JD 里写的那些虚的，而是实际入职后每天真正在做的事）
2. **能力要求**（技术栈、软技能、工具等，标注熟练度要求和重要程度）
3. **薪资区间**（根据岗位级别和城市给出合理区间）
4. **职业发展路径**（这个岗位未来可以往哪些方向发展）
5. **适配度自评问题**（帮助求职者判断自己是否适合这个岗位的问题）

## 输出格式要求
你必须严格以 JSON 格式返回，不要添加任何其他文字说明。JSON 结构如下：
```json
{
  "daily_tasks": ["任务1", "任务2", "任务3", "任务4", "任务5"],
  "skills": [
    {"name": "技能名", "level": "初级/中级/高级", "importance": "必备/加分/可后期补"}
  ],
  "salary_range": "薪资区间描述",
  "career_path": "职业发展路径描述",
  "fit_questions": ["自评问题1", "自评问题2", "自评问题3", "自评问题4", "自评问题5"]
}
```

## 注意事项
- daily_tasks 至少 5 项，要具体、真实、接地气
- skills 至少 5 项，level 只能是"初级/中级/高级"之一，importance 只能是"必备/加分/可后期补"之一
- salary_range 要给出具体数字范围
- fit_questions 至少 5 个，帮助求职者判断适配度
- 所有内容用中文"""


@router.post("/parse", response_model=JDParserResponse)
async def parse_jd(request: JDParserRequest):
    """解析职位描述（JD），提取真实岗位信息。"""
    try:
        # 构建用户提示词
        user_prompt = f"请解析以下职位描述（JD）：\n\n"
        if request.job_title:
            user_prompt += f"职位名称：{request.job_title}\n"
        if request.company:
            user_prompt += f"公司：{request.company}\n"
        user_prompt += f"\nJD 原文：\n{request.jd_text}"

        # 调用 LLM
        result = await chat_json(SYSTEM_PROMPT, user_prompt, temperature=0.5)

        # 验证并返回
        return JDParserResponse(**result)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"JD 解析失败: {e}")
        raise HTTPException(status_code=500, detail=f"JD 解析服务异常：{str(e)}")
