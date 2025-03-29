# DiskPrices - Hard Drive Price Comparison

硬盘价格对比网站，展示来自 Amazon 的 SSD 和 HDD 价格信息。

## 技术架构

- 前端：HTML5 + CSS3 + JavaScript
- 后端：Cloudflare Workers
- 数据存储：Cloudflare KV
- 定时任务：Cloudflare Cron Triggers
- API：Amazon Product Advertising API

## 项目结构

```
/
├── src/
│   ├── frontend/           # 前端代码
│   │   ├── index.html
│   │   ├── styles.css
│   │   ├── script.js
│   │   └── data/
│   │       ├── products.json
│   │       └── languages.json
│   └── worker/            # Cloudflare Worker 代码
│       ├── index.ts      # Worker 入口文件
│       ├── api.ts        # Amazon API 处理
│       └── types.ts      # 类型定义
├── dist/                 # 构建输出目录
├── .gitignore
├── package.json
├── wrangler.toml
├── tsconfig.json
└── README.md
```

## 部署步骤

1. 配置 Cloudflare
   ```bash
   # 安装 Wrangler CLI
   npm install -g wrangler
   
   # 登录 Cloudflare
   wrangler login
   
   # 创建 KV namespace
   wrangler kv:namespace create DISK_PRICES
   ```

2. 配置环境变量
   - 在 Cloudflare Dashboard 中设置以下环境变量：
     - AMAZON_ACCESS_KEY_ID
     - AMAZON_SECRET_ACCESS_KEY

3. 部署前端
   ```bash
   # 安装依赖
   npm install
   
   # 构建前端
   npm run build:frontend
   ```

4. 部署 Worker
   ```bash
   # 构建并部署 Worker
   npm run deploy
   ```

## 开发

1. 本地开发
   ```bash
   # 启动开发服务器
   npm run dev
   ```

2. 测试定时任务
   ```bash
   # 手动触发定时任务
   curl "http://localhost:8787/__scheduled?cron=*+*+*+*+*"
   ```

## 环境变量

- `ENVIRONMENT`: 运行环境 (development/production)
- `AMAZON_ACCESS_KEY_ID`: Amazon API 访问密钥
- `AMAZON_SECRET_ACCESS_KEY`: Amazon API 密钥
- `DISK_PRICES`: Cloudflare KV namespace 绑定

## 注意事项

1. 确保已经在 Cloudflare 中设置了正确的环境变量
2. Amazon API 调用频率限制为每小时 8640 次
3. 产品数据每 6 小时更新一次
4. 请替换 `wrangler.toml` 中的 KV namespace ID

## 许可证

MIT 