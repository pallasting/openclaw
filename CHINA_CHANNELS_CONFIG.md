# OpenClaw 中国渠道配置指南

## 已安装渠道

- 钉钉 (dingtalk)
- 飞书 (feishu-china)
- QQ Bot (qqbot)
- 企业微信-机器人 (wecom)
- 企业微信-自建应用 (wecom-app)

---

## 1. 钉钉配置

### 1.1 获取凭证

1. 访问 [钉钉开放平台](https://open.dingtalk.com)
2. 登录后进入「应用开发」→「企业内部应用」
3. 点击「创建应用」
4. 填写应用名称、图标等信息
5. 创建后在「基础信息」页面获取：
   - **Client ID** (原 AppKey)
   - **Client Secret** (原 AppSecret)

### 1.2 配置机器人

1. 进入应用详情页 →「机器人」
2. 点击「添加机器人」→「自定义机器人」
3. 开启机器人能力
4. 设置机器人名称和头像

### 1.3 发布应用

1. 进入「版本管理与发布」
2. 点击「确认发布」
3. 发布后机器人才能被添加到群聊

### 1.4 OpenClaw 配置

**使用 CLI：**

```bash
openclaw config set channels.dingtalk.enabled true
openclaw config set channels.dingtalk.clientId "dingxxxxxxxxxxxx"
openclaw config set channels.dingtalk.clientSecret "your-client-secret"
openclaw config set channels.dingtalk.enableAICard false
```

**或在 ~/.openclaw/openclaw.json 中添加：**

```json
{
  "channels": {
    "dingtalk": {
      "enabled": true,
      "clientId": "dingxxxxxxxxxxxx",
      "clientSecret": "your-client-secret",
      "enableAICard": false,
      "dmPolicy": "open",
      "groupPolicy": "open",
      "requireMention": true,
      "allowFrom": [],
      "groupAllowFrom": []
    }
  }
}
```

### 1.5 测试

1. 在钉钉群聊中添加机器人
2. @机器人发送消息测试

---

## 2. QQ Bot 配置

### 2.1 注册开发者账号

1. 访问 [QQ 开放平台](https://q.qq.com)
2. 点击「注册」，使用手机号注册新账号
   - **注意**：不能直接用个人 QQ 登录
3. 完成实名认证（需要身份证 + 人脸识别）

### 2.2 创建 QQ Bot

1. 登录后进入「QQ Bot」页面
2. 点击「创建 Bot」
3. 填写 Bot 名称、头像等信息
4. 创建后记录：
   - **AppID**
   - **AppSecret**（首次查看需要生成，请妥善保存）

### 2.3 配置沙箱

1. 进入 Bot 管理页面 →「开发管理」→「沙箱配置」
2. 私聊配置：选择「在消息列表中配置」
3. 点击「添加成员」，输入你的 QQ 号
4. 使用手机 QQ 扫码添加 Bot 为好友

### 2.4 OpenClaw 配置

**使用 CLI：**

```bash
openclaw config set channels.qqbot.enabled true
openclaw config set channels.qqbot.appId "your-app-id"
openclaw config set channels.qqbot.clientSecret "your-app-secret"
openclaw config set channels.qqbot.markdownSupport false
```

**或在 ~/.openclaw/openclaw.json 中添加：**

```json
{
  "channels": {
    "qqbot": {
      "enabled": true,
      "appId": "your-app-id",
      "clientSecret": "your-app-secret",
      "markdownSupport": false,
      "dmPolicy": "open",
      "groupPolicy": "disabled",
      "requireMention": false
    }
  }
}
```

### 2.5 测试

1. 在手机 QQ 中找到 Bot
2. 发送消息测试
3. 注意：沙箱模式下只能和配置的测试账号对话

---

## 3. 飞书配置

### 3.1 创建应用

1. 访问 [飞书开放平台](https://open.feishu.cn)
2. 登录后点击「开发者后台」
3. 点击「创建企业自建应用」
4. 填写应用名称、描述、图标

### 3.2 获取凭证

1. 进入应用详情页 →「凭证与基础信息」
2. 复制：
   - **App ID** (格式: cli_xxxxxx)
   - **App Secret**

### 3.3 配置机器人

1. 进入「机器人」菜单
2. 打开「启用机器人」开关
3. 设置机器人名称和头像
4. 在「权限管理」中申请以下权限：
   - `im:chat:readonly` (读取群信息)
   - `im:message:send` (发送消息)
   - `im:message:readonly` (读取消息)

### 3.4 发布应用

1. 进入「版本管理与发布」
2. 点击「创建版本」
3. 填写版本号、更新说明
4. 点击「申请发布」
5. 等待管理员审批（如果是你自己的企业，直接通过）

### 3.5 OpenClaw 配置

**使用 CLI：**

```bash
openclaw config set channels.feishu-china.enabled true
openclaw config set channels.feishu-china.appId "cli_xxxxxxxxx"
openclaw config set channels.feishu-china.appSecret "your-app-secret"
openclaw config set channels.feishu-china.sendMarkdownAsCard true
```

**或在 ~/.openclaw/openclaw.json 中添加：**

```json
{
  "channels": {
    "feishu-china": {
      "enabled": true,
      "appId": "cli_xxxxxxxxx",
      "appSecret": "your-app-secret",
      "sendMarkdownAsCard": true,
      "dmPolicy": "open",
      "groupPolicy": "open"
    }
  }
}
```

### 3.6 测试

1. 在飞书群聊中添加机器人
2. @机器人发送消息测试

---

## 4. 企业微信-机器人配置

### 4.1 创建机器人

1. 在企业微信群聊中，点击右上角「...」→「添加群机器人」
2. 点击「新创建一个机器人」
3. 设置机器人名称和头像
4. 复制 **Webhook 地址**

### 4.2 获取凭证

从 Webhook 地址中提取：

- **Token**: URL 中的 key 参数
- **EncodingAESKey**: 需要在机器人详情页开启「加密」后生成

### 4.3 OpenClaw 配置

**注意**：企业微信机器人仅支持被动回复，需要公网 HTTPS 回调地址

```json
{
  "channels": {
    "wecom": {
      "enabled": true,
      "webhookPath": "/wecom",
      "token": "your-token",
      "encodingAESKey": "your-43-char-encoding-aes-key"
    }
  }
}
```

---

## 5. 企业微信-自建应用配置

### 5.1 创建应用

1. 访问 [企业微信管理后台](https://work.weixin.qq.com)
2. 进入「应用管理」→「自建」→「创建应用」
3. 填写应用名称、描述、图标
4. 选择可见成员

### 5.2 获取凭证

1. 在应用详情页获取：
   - **AgentId**
2. 进入「我的企业」页面，获取：
   - **CorpID** (企业ID)
3. 在应用详情页点击「查看」获取：
   - **Secret** (应用凭证)

### 5.3 配置接收消息

1. 在应用详情页 →「接收消息」→「设置 API」
2. 填写回调 URL：`https://your-domain/wecom-app`
3. 生成 **Token** 和 **EncodingAESKey**
4. 保存后企业微信会发送验证请求

### 5.4 配置 IP 白名单

1. 在应用详情页 →「企业可信 IP」
2. 添加你的服务器公网 IP

### 5.5 OpenClaw 配置

```json
{
  "channels": {
    "wecom-app": {
      "enabled": true,
      "webhookPath": "/wecom-app",
      "token": "your-token",
      "encodingAESKey": "your-43-char-encoding-aes-key",
      "corpId": "your-corp-id",
      "corpSecret": "your-app-secret",
      "agentId": 1000002
    }
  }
}
```

---

## 通用配置说明

### 会话隔离策略 (session.dmScope)

```json
{
  "session": {
    "dmScope": "per-peer"
  }
}
```

- `main`: 所有用户共享同一会话（不推荐）
- `per-peer`: 按用户 ID 隔离（推荐）
- `per-channel-peer`: 按渠道 + 用户隔离

### 私聊策略 (dmPolicy)

- `open`: 任何人都可以私聊
- `pairing`: 需要配对后才能私聊
- `allowlist`: 只有白名单用户可以私聊
- `disabled`: 禁用私聊

### 群聊策略 (groupPolicy)

- `open`: 任何群都可以使用
- `allowlist`: 只有白名单群可以使用
- `disabled`: 禁用群聊

---

## 重启网关

配置完成后重启网关：

```bash
# 方式1：使用 systemctl
systemctl --user restart openclaw-gateway

# 方式2：手动重启
pkill -f openclaw-gateway
openclaw gateway run --port 18789
```

---

## 故障排查

### 查看日志

```bash
# 实时查看日志
tail -f /tmp/openclaw/openclaw-*.log

# 查看渠道相关日志
tail -f /tmp/openclaw/openclaw-*.log | grep -E "dingtalk|qqbot|feishu|wecom"
```

### 验证渠道状态

```bash
openclaw channels status
```

### 常见问题

1. **渠道显示未连接**
   - 检查凭证是否正确
   - 检查网络连接
   - 查看日志中的错误信息

2. **收不到消息**
   - 检查回调地址是否正确（需要公网 HTTPS）
   - 检查防火墙设置
   - 检查 IP 白名单

3. **发送消息失败**
   - 检查机器人是否被禁言
   - 检查是否超出频率限制
   - 检查消息内容是否违规

---

## 参考链接

- [钉钉开放平台文档](https://open.dingtalk.com/document)
- [QQ 开放平台文档](https://q.qq.com/wiki)
- [飞书开放平台文档](https://open.feishu.cn/document)
- [企业微信开发者文档](https://developer.work.weixin.qq.com/document)
- [OpenClaw China 插件 GitHub](https://github.com/BytePioneer-AI/openclaw-china)
