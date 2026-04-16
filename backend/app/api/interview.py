import json
import logging
import uuid

from fastapi import APIRouter, HTTPException

from app.models.schemas import (
    InterviewChatRequest,
    InterviewChatResponse,
    InterviewReportResponse,
    InterviewStartRequest,
    InterviewStartResponse,
)
from app.services.llm_service import chat, chat_json

logger = logging.getLogger(__name__)

router = APIRouter()

# 内存存储面试会话
# session_id -> {messages, question_count, job_type, target_job, difficulty, questions, answers}
sessions: dict = {}

MAX_QUESTIONS = 5


def _build_interviewer_prompt(job_type: str, target_job: str, difficulty: str) -> str:
    """构建面试官 system prompt。"""
    difficulty_desc = {
        "基础": "基础难度，问题相对简单，适合初学者",
        "中等": "中等难度，问题有一定深度，适合有一定经验的求职者",
        "困难": "困难难度，问题深入且具有挑战性，适合经验丰富的求职者",
        "进阶": "进阶难度，问题更有深度，适合有一定经验的求职者",
    }
    return f"""你是一位经验丰富的面试官，正在进行一场{job_type}面试。

## 面试信息
- 目标岗位：{target_job}
- 面试类型：{job_type}
- 难度级别：{difficulty_desc.get(difficulty, "基础难度")}

## 面试规则
1. 每次只问一个问题，等待候选人回答后再继续
2. 总共问 {MAX_QUESTIONS} 个问题
3. 问题要围绕目标岗位的{job_type}展开
4. 根据候选人的回答情况调整后续问题的难度和方向
5. 语言要专业但不失亲和力
6. 不要在回答中透露你总共要问几个问题

## 面试流程
- 第1个问题：开场问题，了解基本情况
- 第2-4个问题：针对专业能力/综合素质深入提问
- 第5个问题：收尾问题，给候选人总结反馈的机会

请直接提出第一个问题，不要添加任何额外说明。"""


def _build_report_prompt(job_type: str, target_job: str, qa_list: list) -> str:
    """构建面试报告生成的 system prompt。"""
    qa_text = ""
    for i, qa in enumerate(qa_list, 1):
        qa_text += f"\n问题{i}：{qa['question']}\n回答：{qa['answer']}\n"

    return f"""你是一位资深的面试评估专家，请根据以下面试记录生成评估报告。

## 面试信息
- 目标岗位：{target_job}
- 面试类型：{job_type}

## 面试记录
{qa_text}

## 输出格式要求
你必须严格以 JSON 格式返回，不要添加任何其他文字说明。JSON 结构如下：
```json
{{
  "total_score": 7,
  "dimension_scores": [
    {{"name": "专业能力", "score": 7, "comment": "评语"}},
    {{"name": "表达能力", "score": 8, "comment": "评语"}},
    {{"name": "逻辑思维", "score": 7, "comment": "评语"}},
    {{"name": "岗位匹配", "score": 6, "comment": "评语"}},
    {{"name": "综合素质", "score": 7, "comment": "评语"}}
  ],
  "details": [
    {{
      "question": "面试问题",
      "user_answer": "用户回答",
      "score": 7,
      "feedback": "评价反馈",
      "reference_answer": "参考答案"
    }}
  ],
  "top_improvements": ["改进建议1", "改进建议2", "改进建议3"]
}}
```

## 注意事项
- total_score 范围 1-10，是所有问题得分的综合评分
- dimension_scores 包含 5 个维度：专业能力、表达能力、逻辑思维、岗位匹配、综合素质
- 每个维度 score 范围 1-10
- details 对应每一道面试题的评估
- 每道题 score 范围 1-10
- top_improvements 至少 3 条改进建议
- 所有内容用中文"""


@router.post("/start", response_model=InterviewStartResponse)
async def start_interview(request: InterviewStartRequest):
    """创建面试会话，返回第一个问题。"""
    try:
        session_id = str(uuid.uuid4())

        system_prompt = _build_interviewer_prompt(
            request.job_type, request.target_job, request.difficulty
        )

        # 获取第一个问题
        first_question = await chat(system_prompt, "请开始面试，提出第一个问题。", temperature=0.7)

        # 初始化会话
        sessions[session_id] = {
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "assistant", "content": first_question},
            ],
            "question_count": 1,
            "job_type": request.job_type,
            "target_job": request.target_job,
            "difficulty": request.difficulty,
            "questions": [first_question],
            "answers": [],
        }

        return InterviewStartResponse(
            session_id=session_id,
            first_question=first_question,
        )

    except Exception as e:
        logger.error(f"面试启动失败: {e}")
        raise HTTPException(status_code=500, detail=f"面试服务异常：{str(e)}")


@router.post("/chat", response_model=InterviewChatResponse)
async def interview_chat(request: InterviewChatRequest):
    """用户回答问题，AI 追问或结束面试。"""
    try:
        session = sessions.get(request.session_id)
        if not session:
            raise HTTPException(status_code=404, detail="面试会话不存在或已过期")

        # 记录用户回答
        session["messages"].append({"role": "user", "content": request.user_answer})
        session["answers"].append(request.user_answer)

        # 第5题回答后结束面试
        is_finished = session["question_count"] >= MAX_QUESTIONS

        if is_finished:
            # 面试结束，给出总结
            end_prompt = (
                "这是最后一道题的回答。请对候选人的整体表现做一个简短的总结评价，"
                "感谢候选人的参与，并告知面试结束。"
            )
            ai_reply = await chat(session["messages"][0]["content"], end_prompt, temperature=0.7)
            session["messages"].append({"role": "assistant", "content": ai_reply})
        else:
            # 继续追问
            # 构建对话历史（不含 system prompt，因为 chat 函数会自动添加）
            conversation = "\n".join(
                f"{'面试官' if msg['role'] == 'assistant' else '候选人'}：{msg['content']}"
                for msg in session["messages"][1:]  # 跳过 system prompt
            )
            conversation += f"\n候选人：{request.user_answer}"

            ai_reply = await chat(
                session["messages"][0]["content"],
                f"对话记录：\n{conversation}\n\n请根据候选人的回答继续提问。",
                temperature=0.7,
            )
            session["messages"].append({"role": "assistant", "content": ai_reply})
            session["question_count"] += 1
            session["questions"].append(ai_reply)

        return InterviewChatResponse(
            ai_reply=ai_reply,
            is_finished=is_finished,
            question_count=session["question_count"],
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"面试对话失败: {e}")
        raise HTTPException(status_code=500, detail=f"面试服务异常：{str(e)}")


@router.post("/report", response_model=InterviewReportResponse)
async def generate_report(request: InterviewChatRequest):
    """生成面试评估报告。"""
    try:
        session = sessions.get(request.session_id)
        if not session:
            raise HTTPException(status_code=404, detail="面试会话不存在或已过期")

        # 构建问答列表
        qa_list = []
        for q, a in zip(session["questions"], session["answers"]):
            qa_list.append({"question": q, "answer": a})

        if not qa_list:
            raise HTTPException(status_code=400, detail="暂无面试记录，无法生成报告")

        # 生成报告
        report_prompt = _build_report_prompt(
            session["job_type"], session["target_job"], qa_list
        )

        # 使用 chat_json 获取结构化报告
        result = await chat_json(report_prompt, "请生成面试评估报告。", temperature=0.5)

        return InterviewReportResponse(**result)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"面试报告生成失败: {e}")
        raise HTTPException(status_code=500, detail=f"面试报告生成异常：{str(e)}")
