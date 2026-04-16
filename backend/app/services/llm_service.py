import json
import logging

import httpx

from app.config import settings

logger = logging.getLogger(__name__)


async def chat(system_prompt: str, user_prompt: str, temperature: float = 0.7) -> str:
    """调用 DeepSeek API 进行对话。

    Args:
        system_prompt: 系统提示词
        user_prompt: 用户提示词
        temperature: 生成温度，默认 0.7

    Returns:
        模型返回的文本内容

    Raises:
        Exception: API 调用失败时抛出异常
    """
    url = f"{settings.DEEPSEEK_BASE_URL}/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {settings.DEEPSEEK_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": settings.DEEPSEEK_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "temperature": temperature,
    }

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(url, headers=headers, json=payload)
            response.raise_for_status()
            data = response.json()
            content = data["choices"][0]["message"]["content"]
            return content
    except httpx.HTTPStatusError as e:
        logger.error(f"DeepSeek API HTTP 错误: {e.response.status_code} - {e.response.text}")
        raise Exception(f"AI 服务调用失败 (HTTP {e.response.status_code})，请稍后重试")
    except httpx.RequestError as e:
        logger.error(f"DeepSeek API 请求错误: {e}")
        raise Exception("AI 服务网络异常，请检查网络连接后重试")
    except (KeyError, IndexError) as e:
        logger.error(f"DeepSeek API 响应解析错误: {e}")
        raise Exception("AI 服务返回数据格式异常，请稍后重试")


async def chat_json(system_prompt: str, user_prompt: str, temperature: float = 0.7) -> dict:
    """调用 DeepSeek API 并解析返回的 JSON。

    Args:
        system_prompt: 系统提示词（应包含要求返回 JSON 的指令）
        user_prompt: 用户提示词
        temperature: 生成温度，默认 0.7

    Returns:
        解析后的字典

    Raises:
        Exception: API 调用或 JSON 解析失败时抛出异常
    """
    content = await chat(system_prompt, user_prompt, temperature)

    # 尝试提取 JSON 内容（可能被 markdown 代码块包裹）
    json_str = content.strip()
    if json_str.startswith("```"):
        # 移除 markdown 代码块标记
        lines = json_str.split("\n")
        lines = [l for l in lines if not l.strip().startswith("```")]
        json_str = "\n".join(lines).strip()

    try:
        return json.loads(json_str)
    except json.JSONDecodeError as e:
        logger.error(f"JSON 解析失败: {e}\n原始内容: {content[:500]}")
        raise Exception("AI 返回的数据格式异常，请稍后重试")
