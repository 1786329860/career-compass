# 职途罗盘 (Career Compass)

基于 DeepSeek 大模型的智能职业发展助手，提供从岗位解析到模拟面试的全链路职业规划服务。

## 功能模块

| 模块 | 说明 |
|------|------|
| 岗位解析 | 上传职位描述（JD），AI 自动提取关键信息并结构化展示 |
| 能力诊断 | 根据目标岗位要求，评估当前能力差距并给出改进建议 |
| 行动规划 | 生成个性化的学习路线图和职业发展计划 |
| 简历优化 | AI 驱动的简历内容优化与岗位匹配度分析 |
| 模拟面试 | 基于目标岗位生成面试问题，提供智能评分与反馈 |

## 技术栈

**后端**
- Python 3.11 + FastAPI
- Uvicorn（ASGI 服务器）
- aiosqlite（异步数据库）
- httpx（HTTP 客户端，调用 DeepSeek API）

**前端**
- React 19 + TypeScript
- Vite（构建工具）
- Tailwind CSS 4（样式框架）
- ECharts（数据可视化）
- React Router（路由管理）
- Axios（HTTP 请求）

**部署**
- Docker + Docker Compose
- Nginx（前端静态托管 + API 反向代理）

## 快速开始

### 方式一：本地开发

**后端**

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**前端**

```bash
cd frontend
npm install
npm run dev
```

前端开发服务器默认运行在 `http://localhost:5173`，会自动代理 API 请求到后端。

### 方式二：Docker 部署

1. 克隆项目并进入目录：

```bash
cd career-compass
```

2. 配置环境变量：

```bash
cp .env.example .env
# 编辑 .env，填入你的 DeepSeek API Key
```

3. 一键启动：

```bash
docker compose up -d --build
```

4. 访问服务：

- 前端页面：`http://localhost`
- 后端 API：`http://localhost:8000`
- API 文档：`http://localhost:8000/docs`

5. 停止服务：

```bash
docker compose down
```

## 环境变量说明

| 变量名 | 必填 | 默认值 | 说明 |
|--------|------|--------|------|
| `DEEPSEEK_API_KEY` | 是 | - | DeepSeek API 密钥 |
| `DEEPSEEK_BASE_URL` | 否 | `https://api.deepseek.com` | DeepSeek API 地址 |
| `DEEPSEEK_MODEL` | 否 | `deepseek-chat` | 使用的模型名称 |

## 项目结构

```
career-compass/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py          # 配置管理
│   │   ├── main.py            # FastAPI 应用入口
│   │   └── api/
│   │       ├── jd_parser.py   # 岗位解析接口
│   │       ├── ability.py     # 能力诊断接口
│   │       ├── roadmap.py     # 行动规划接口
│   │       ├── resume.py      # 简历优化接口
│   │       └── interview.py   # 模拟面试接口
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/                   # React 源码
│   ├── index.html
│   ├── package.json
│   ├── nginx.conf
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
├── .env
├── .gitignore
└── README.md
```

## License

MIT
