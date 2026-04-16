import logging

from fastapi import APIRouter, HTTPException

from app.models.schemas import AbilityRequest, AbilityResponse
from app.services.llm_service import chat_json

logger = logging.getLogger(__name__)

router = APIRouter()

SYSTEM_PROMPT = """你是一位资深的职业规划师，拥有丰富的互联网行业人才评估经验。你擅长通过分析求职者的背景信息，精准评估其能力水平，并给出有针对性的提升建议。

## 你的任务
根据用户提供的个人背景信息，进行全方位的能力诊断：
1. **能力雷达图**（6个维度的评分和评语）
2. **能力差距分析**（与目标岗位的差距）
3. **优先行动建议**
4. **学习资源推荐**

## 输出格式要求
你必须严格以 JSON 格式返回，不要添加任何其他文字说明。JSON 结构如下：
```json
{
  "radar": [
    {"name": "专业技能", "score": 3, "comment": "评语"},
    {"name": "项目经验", "score": 2, "comment": "评语"},
    {"name": "实习经历", "score": 1, "comment": "评语"},
    {"name": "学习能力", "score": 4, "comment": "评语"},
    {"name": "沟通协作", "score": 3, "comment": "评语"},
    {"name": "行业认知", "score": 2, "comment": "评语"}
  ],
  "gaps": [
    {"skill": "技能名", "status": "已具备/部分具备/缺失", "suggestion": "建议"}
  ],
  "priority_actions": ["行动建议1", "行动建议2", "行动建议3"],
  "learning_resources": ["资源1", "资源2", "资源3"]
}
```

## 注意事项
- radar 必须包含 6 个维度：专业技能、项目经验、实习经历、学习能力、沟通协作、行业认知
- score 范围为 1-5 的整数，1 表示最低，5 表示最高
- gaps 至少 5 项，status 只能是"已具备/部分具备/缺失"之一
- priority_actions 至少 3 项，按优先级排序
- learning_resources 至少 3 项，要具体（书名、课程名、网站等）
- 所有内容用中文"""


@router.post("/analyze", response_model=AbilityResponse)
async def analyze_ability(request: AbilityRequest):
    """分析用户能力，生成能力诊断报告。"""
    try:
        user_prompt = f"""请根据以下信息进行能力诊断：

- 专业：{request.major}
- 年级：{request.grade}
- 已掌握技能：{', '.join(request.skills_known) if request.skills_known else '暂无'}
- 实习经历：{request.internship if request.internship else '暂无'}
- 项目经验：{request.projects if request.projects else '暂无'}
- 目标岗位：{request.target_job}

请全面分析该同学与目标岗位之间的能力差距，并给出提升建议。"""

        result = await chat_json(SYSTEM_PROMPT, user_prompt, temperature=0.5)
        return AbilityResponse(**result)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"能力诊断失败: {e}")
        raise HTTPException(status_code=500, detail=f"能力诊断服务异常：{str(e)}")
