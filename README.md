# Animaerd

Animaerd 是一款用于 AI 艺术品生成和管理的现代 Web 应用程序，使用 Go（Fiber）和前端堆栈构建。它与 ComfyUI 集成以用于 AI 图像生成，并为艺术品管理、用户交互和管理控制提供了一个全面的平台。

## 功能

- **AI 作品生成**：与 ComfyUI 集成以生成 AI 图像
- **用户管理**：
- OAuth2 身份验证支持（Google、GitHub、Microsoft）
- 用户角色（管理员/普通用户）
- 带头像的个人资料管理
- **作品管理**：
- 上传和管理作品
- 评论和回复系统
- 点赞/点赞功能
- 媒体上传支持
- **风格管理**：
- 可自定义的艺术风格
- 风格图标和元数据
- **工作流管理**：
- 创建和管理 ComfyUI 工作流
- 节点管理系统
- **管理员仪表板**：
- 用户管理
- 风格管理
- 工作流控制
- 系统指标监控

## 技术堆栈

### 后端
- **框架**：Go Fiber v2
- **数据库**：带 Ent ORM 的 PostgreSQL
- **缓存**：Redis
- **存储**：兼容 R2/S3 的存储
- **身份验证**： JWT + OAuth2
- **监控**：内置指标端点

### 前端
- 两个独立的前端应用程序：
- 用户应用程序（`/frontend/app`）
- 管理仪表板（`/frontend/dashboard`）

## 先决条件

- Go 1.23.3 或更高版本
- PostgreSQL
- Redis
- Node.js（用于前端开发）

## 配置

在根目录中创建一个 `config.yml` 文件，其结构如下：

```yaml
port：8000
jwt_secret：your_jwt_secret
jwt_access_expire：86400
database_source_url：postgres://user:password@host:5432/dbname?sslmode=disable
redis_host：localhost
redis_port：6379
redis_password： your_redis_password
dashboard_url：http://localhost:3001

# R2/S3 配置
r2s3_account_id：your_account_id
r2s3_access_key_id：your_access_key
r2s3_access_secret_key：your_secret_key
r2s3_bucket：your_bucket
r2s3_host：your_host

# OAuth 配置
oauth_google_client_id：your_google_client_id
oauth_google_client_secret：your_google_client_secret
oauth_google_redirect_url：http://localhost:3000/auth/google/callback

oauth_github_client_id：your_github_client_id
oauth_github_client_secret：your_github_client_secret
oauth_github_redirect_url： http://localhost:3000/auth/github/callback

oauth_microsoft_client_id：your_microsoft_client_id
oauth_microsoft_client_secret：your_microsoft_client_secret
oauth_microsoft_redirect_url：http://localhost:3000/auth/microsoft/callback
```

## API 端点

### 身份验证
- `GET /auth/admin` - 仪表板登录
- `GET /auth/:provider` - OAuth 提供商身份验证
- `GET /auth/:provider/callback` - OAuth 回调

### 艺术品
- `GET /artwork` - 列出艺术品
- `GET /artwork/:id` - 获取艺术品详情
- `POST /artwork` - 创建艺术品
- `POST /artwork/media` - 上传媒体
- `GET /artwork/:id/comments` - 获取艺术品评论
- `POST /artwork/:id/comment` - 创建评论
- `POST /artwork/:id/like` - 喜欢艺术品
- `DELETE /artwork/:id/like` - 不喜欢艺术品

### 用户管理
- `GET /user` - 获取当前用户
- `GET /user/:id` - 通过 ID 获取用户
- `PUT /user` - 更新用户
- `PUT /user/avatar` - 更新头像

### 管理路线
- 用户管理
- ComfyUI 节点管理
- 样式管理
- 工作流管理
- 纵横比管理

## 开发

1. 克隆存储库：
```bash
git clone https://github.com/MiaoMint/animaerd.git
cd animaerd
```

2. 安装依赖项：
```bash
go mod download
```

3. 设置配置文件（`config.yml`）

4. 运行开发服务器：
```bash
go run app.go
```

对于开发期间的热重载，您可以使用 Air：
```bash
air
```

## 前端开发

1. 导航到前端目录：
```bash
cd frontend/app # 或 frontend/dashboard
```

2. 安装依赖项并启动开发服务器（遵循前端特定的 README）


## 指标和监控

访问 `/metrics` 处的指标仪表板以监控系统性能和使用情况统计信息。
