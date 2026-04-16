import logging

from fastapi import APIRouter, HTTPException

from app.models.schemas import RoadmapRequest, RoadmapResponse
from app.services.llm_service import chat_json

logger = logging.getLogger(__name__)

router = APIRouter()

SYSTEM_PROMPT = """你是一位资深的职业规划教练，擅长为求职者制定科学、可执行的行动计划。你制定的计划总是具体到每周任务，让求职者清楚知道每周该做什么。

## 你的任务
根据用户的目标岗位、当前状态和可用时间，制定一份详细的周行动计划：
1. **总周数**（根据可用时间和目标合理规划）
2. **每周任务**（具体到每周要做什么）
3. **里程碑节点**（关键检查点）
4. **实用建议**

## 输出格式要求
你必须严格以 JSON 格式返回，不要添加任何其他文字说明。JSON 结构如下：
```json
{
  "total_weeks": 12,
  "tasks": [
    {"week": 1, "title": "任务标题", "description": "具体任务描述", "milestone": false},
    {"week": 2, "title": "任务标题", "description": "具体任务描述", "milestone": false},
    {"week": 4, "title": "里程碑：XXX", "description": "里程碑描述", "milestone": true}
  ],
  "milestones": ["里程碑1", "里程碑2", "里程碑3"],
  "tips": ["建议1", "建议2", "建议3"]
}
```

## 注意事项
- total_weeks 根据可用时间合理计算（如"3个月"约12周）
- tasks 每周至少 1 项任务，任务要具体可执行
- milestone=true 的任务表示关键里程碑，至少设置 3 个里程碑
- milestones 列表从 tasks 中提取所有 milestone=true 的任务标题
- tips 至少 3 条实用建议
- 任务安排要循序渐进，从基础到进阶
- 所有内容用中文"""


@router.post("/generate", response_model=RoadmapResponse)
async def generate_roadmap(request: RoadmapRequest):
    """生成求职行动规划周计划。"""
    try:
        user_prompt = f"""请为以下情况制定行动规划：

- 目标岗位：{request.target_job}
- 当前状态：{request.current_status}
- 可用时间：{request.available_time}"""

        if request.ability_result:
            user_prompt += f"\n\n能力诊断结果（供参考）：\n{request.ability_result}"

        user_prompt += "\n\n请制定一份详细的周行动计划，确保每周任务具体可执行。"

        result = await chat_json(SYSTEM_PROMPT, user_prompt, temperature=0.5)
        return RoadmapResponse(**result)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"行动规划生成失败: {e}")
        raise HTTPException(status_code=500, detail=f"行动规划服务异常：{str(e)}")
