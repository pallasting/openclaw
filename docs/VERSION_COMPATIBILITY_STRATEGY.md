# OpenClaw 版本兼容与插件化策略

## 文档信息

- **创建日期**: 2026-02-09
- **版本**: v1.0
- **目标**: 应对 OpenClaw 快速更新，确保改进代码的可维护性

---

## 📋 目录

1. [问题分析](#问题分析)
2. [核心策略](#核心策略)
3. [插件化方案](#插件化方案)
4. [技能扩展方案](#技能扩展方案)
5. [版本追踪机制](#版本追踪机制)
6. [贡献回馈策略](#贡献回馈策略)
7. [实施指南](#实施指南)

---

## 问题分析

### 挑战

OpenClaw 作为活跃的开源项目，面临以下挑战：

```
问题 1: 快速迭代
  - 主分支频繁更新（每周多次提交）
  - API 可能发生变化
  - 配置 schema 可能演进

问题 2: 合并冲突风险
  - 我们的改进代码可能与上游冲突
  - 手动合并成本高昂
  - 测试覆盖不完整可能导致回归

问题 3: 维护成本
  - 需要持续跟进上游更新
  - 重新测试所有功能
  - 文档需要同步更新
```

### 目标

设计一套策略，确保：

- ✅ **最小化合并冲突**
- ✅ **降低维护成本**
- ✅ **保持功能独立性**
- ✅ **便于社区贡献**
- ✅ **支持快速回退**

---

## 核心策略

### 策略矩阵

根据改进的**侵入性**和**核心程度**，采用不同策略：

```
              核心功能 ←────────────→ 外围功能
                │                        │
  高侵入性      │  [A] 早期贡献          │  [B] 独立插件
                │  - 尽快提 PR           │  - Extension
                │  - 积极沟通维护者      │  - MCP Server
                │                        │
                │                        │
  低侵入性      │  [C] 渐进式集成        │  [D] Skills/Hooks
                │  - Fork + 定期合并     │  - 技能包
                │  - 保持兼容性          │  - Webhook
                │                        │
```

### 分类决策树

```
改进功能
  │
  ├─ 是否修改核心代码？
  │   ├─ 是 → 是否与现有架构冲突？
  │   │   ├─ 是 → [A] 早期贡献（需要讨论设计）
  │   │   └─ 否 → [C] 渐进式集成（保持兼容）
  │   │
  │   └─ 否 → 是否需要 Gateway 内部 API？
  │       ├─ 是 → [B] 独立插件（通过插件系统）
  │       └─ 否 → [D] Skills/Hooks（最低侵入性）
```

---

## 插件化方案

### 方案 1: Extension 插件（适用于 [B] 类改进）

#### 适用场景

- Agent Lightning 集成
- 模型量化工具
- 可观测性增强

#### 架构设计

OpenClaw 已有完善的插件系统，我们可以利用：

```typescript
// extensions/openclaw-learning/package.json
{
  "name": "@openclaw/extension-learning",
  "version": "1.0.0",
  "openclaw": {
    "type": "extension",
    "provides": ["agent-learning", "prompt-optimization"]
  }
}

// extensions/openclaw-learning/src/index.ts
import type { OpenClawPlugin } from '@openclaw/types';

export default class LearningExtension implements OpenClawPlugin {
  name = 'agent-learning';
  version = '1.0.0';

  async init(context: PluginContext) {
    // 注册学习相关的 RPC 方法
    context.registerRpcMethod('learning.optimize', this.optimizeAgent);
    context.registerRpcMethod('learning.status', this.getStatus);

    // 注册 Agent 包装器
    context.registerAgentWrapper(LightningAgentWrapper);

    // 注册 WebUI 组件
    context.registerWebComponent('learning-panel', LearningPanel);
  }

  async optimizeAgent(agentId: string) {
    // APO 优化逻辑
  }

  async getStatus(agentId: string) {
    // 返回学习状态
  }
}
```

#### 配置集成

```json
// ~/.openclaw/openclaw.json
{
  "plugins": {
    "enabled": ["@openclaw/extension-learning"],
    "@openclaw/extension-learning": {
      "algorithm": "APO",
      "optimizationModel": "antigravity-primary/gemini-3-flash",
      "autoRetrain": true
    }
  }
}
```

#### 优势

- ✅ **完全独立**：可以独立发布和更新
- ✅ **无侵入性**：不修改 OpenClaw 核心代码
- ✅ **易于维护**：单独的 npm 包，独立版本控制
- ✅ **可选安装**：用户按需安装
- ✅ **快速回退**：禁用插件即可

#### 实施步骤

```bash
# 1. 创建独立插件项目
cd extensions
mkdir openclaw-learning
cd openclaw-learning
pnpm init

# 2. 开发插件
pnpm add @openclaw/types
# 实现插件逻辑

# 3. 本地测试
pnpm link --global
cd ~/.openclaw
pnpm link --global @openclaw/extension-learning

# 4. 发布到 npm
pnpm publish --access public
```

---

### 方案 2: MCP Server（适用于外部服务集成）

#### 适用场景

- AngelSlim 模型量化
- 外部监控服务
- 第三方 AI 服务

#### 架构设计

```typescript
// mcp-servers/angelslim-quantizer/src/index.ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new Server(
  {
    name: "angelslim-quantizer",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

// 注册量化工具
server.setRequestHandler("tools/list", async () => ({
  tools: [
    {
      name: "quantize_model",
      description: "Quantize a model using AngelSlim",
      inputSchema: {
        type: "object",
        properties: {
          modelId: { type: "string" },
          bits: { type: "number", enum: [2, 4, 8] },
          method: { type: "string", enum: ["QAT", "PTQ"] },
        },
        required: ["modelId", "bits"],
      },
    },
  ],
}));

server.setRequestHandler("tools/call", async (request) => {
  if (request.params.name === "quantize_model") {
    const { modelId, bits, method } = request.params.arguments;

    // 调用 AngelSlim CLI
    const result = await quantizeModel(modelId, bits, method);

    return {
      content: [
        {
          type: "text",
          text: `Model quantized successfully: ${result.outputPath}`,
        },
      ],
    };
  }
});

// 启动服务器
const transport = new StdioServerTransport();
await server.connect(transport);
```

#### OpenClaw 配置

```json
{
  "mcpServers": {
    "angelslim": {
      "command": "node",
      "args": ["./mcp-servers/angelslim-quantizer/build/index.js"],
      "env": {
        "ANGELSLIM_PATH": "/usr/local/bin/angelslim"
      }
    }
  }
}
```

#### 优势

- ✅ **标准协议**：基于 MCP 标准
- ✅ **进程隔离**：独立进程，崩溃不影响 Gateway
- ✅ **语言无关**：可以用任何语言实现（Python/Rust）
- ✅ **易于调试**：独立运行和测试

---

## 技能扩展方案

### 方案 3: Skills（适用于 [D] 类改进）

#### 适用场景

- 数据分析技能
- 代码审查工具
- 专业领域知识

#### 示例：模型性能分析技能

```typescript
// skills/model-performance-analyzer/skill.ts

export default {
  name: "model-performance-analyzer",
  emoji: "📊",
  description: "分析和比较不同模型的性能指标",

  async execute(context: SkillContext) {
    const { agentId, timeRange } = context.args;

    // 查询性能数据
    const metrics = await context.db.query(
      `
      SELECT model_id,
             AVG(latency_ms) as avg_latency,
             SUM(tokens_used) as total_tokens,
             COUNT(*) as request_count
      FROM agent_requests
      WHERE agent_id = $1
        AND created_at > $2
      GROUP BY model_id
    `,
      [agentId, timeRange],
    );

    // 生成报告
    const report = generatePerformanceReport(metrics);

    return {
      type: "markdown",
      content: report,
    };
  },

  tools: ["database:query", "chart:generate"],
};
```

#### 安装和使用

```bash
# 用户安装技能
openclaw skills install model-performance-analyzer

# 在对话中使用
用户: "分析过去 7 天各模型的性能"
Agent: [自动调用 model-performance-analyzer skill]
```

#### 优势

- ✅ **零侵入性**：完全外部化
- ✅ **用户可选**：按需安装
- ✅ **易于分发**：技能市场
- ✅ **快速迭代**：独立更新

---

## 版本追踪机制

### 自动化兼容性检测

#### CI/CD 集成

```yaml
# .github/workflows/upstream-compatibility.yml

name: Upstream Compatibility Check

on:
  schedule:
    - cron: "0 0 * * *" # 每天检查
  workflow_dispatch:

jobs:
  check-upstream:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout our fork
        uses: actions/checkout@v3

      - name: Add upstream remote
        run: |
          git remote add upstream https://github.com/openclaw/openclaw.git
          git fetch upstream main

      - name: Check for API changes
        run: |
          # 检查核心 API 变化
          git diff upstream/main -- src/gateway/protocol/schema/
          git diff upstream/main -- src/config/types.*.ts

      - name: Run compatibility tests
        run: |
          # 切换到上游最新代码
          git checkout upstream/main

          # 安装我们的插件
          pnpm install
          pnpm --filter @openclaw/extension-learning build

          # 运行兼容性测试
          pnpm test:compatibility

      - name: Create issue if incompatible
        if: failure()
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: 'Upstream compatibility issue detected',
              body: 'Latest upstream changes may break our extensions.',
              labels: ['compatibility', 'urgent']
            })
```

#### 兼容性测试套件

```typescript
// tests/compatibility/agent-lightning.test.ts

describe("Agent Lightning Extension Compatibility", () => {
  let gateway: Gateway;
  let extension: LearningExtension;

  beforeEach(async () => {
    // 使用上游最新代码初始化 Gateway
    gateway = await initGateway({ version: "upstream-latest" });

    // 加载我们的扩展
    extension = new LearningExtension();
    await extension.init(gateway.pluginContext);
  });

  it("should register RPC methods", async () => {
    const methods = gateway.listRpcMethods();
    expect(methods).toContain("learning.optimize");
    expect(methods).toContain("learning.status");
  });

  it("should wrap agents correctly", async () => {
    const agent = await gateway.getAgent("main");
    expect(agent).toBeInstanceOf(LightningAgentWrapper);
  });

  it("should handle config schema changes", async () => {
    const config = {
      plugins: {
        "@openclaw/extension-learning": {
          algorithm: "APO",
        },
      },
    };

    // 验证配置 schema 兼容性
    const validation = await gateway.validateConfig(config);
    expect(validation.valid).toBe(true);
  });
});
```

---

### 版本锁定策略

#### package.json 依赖管理

```json
{
  "name": "@openclaw/extension-learning",
  "version": "1.0.0",
  "peerDependencies": {
    "openclaw": "^2026.2.6" // 锁定主版本
  },
  "engines": {
    "openclaw": ">=2026.2.6 <2027.0.0" // 兼容范围
  }
}
```

#### 运行时版本检查

```typescript
// extensions/openclaw-learning/src/index.ts

export default class LearningExtension implements OpenClawPlugin {
  async init(context: PluginContext) {
    // 检查 OpenClaw 版本
    const { version } = context.gateway;
    const [major, minor] = version.split(".").map(Number);

    if (major !== 2026 || minor < 2) {
      throw new Error(`This extension requires OpenClaw >= 2026.2.x, got ${version}`);
    }

    // 检查 API 兼容性
    if (!context.hasApi("agent.wrap")) {
      console.warn("Agent wrapping API not available, learning disabled");
      return;
    }

    // 正常初始化
    this.registerHandlers(context);
  }
}
```

---

## 贡献回馈策略

### 决策矩阵

哪些改进应该贡献回上游？

```
                   对社区价值高 ←─────────→ 对社区价值低
                        │                      │
  通用功能              │ [优先贡献]           │ [考虑贡献]
  (所有用户受益)        │ - Agent Learning    │ - 特定行业技能
                        │ - 边缘模型支持       │ - 定制化工具
                        │                      │
                        │                      │
  特定功能              │ [讨论后贡献]         │ [保持私有]
  (部分用户受益)        │ - 异步训练架构       │ - 企业专属功能
                        │ - 可观测性           │ - 内部工具
                        │                      │
```

### 贡献流程

#### Phase 1: 准备阶段

```bash
# 1. 在我们的 fork 中完成开发和测试
cd openclaw-fork
git checkout -b feature/agent-learning

# 开发...
pnpm test
pnpm build

# 2. 确保代码质量
pnpm lint --fix
pnpm format

# 3. 更新文档
# - README.md
# - docs/features/agent-learning.md
# - CHANGELOG.md
```

#### Phase 2: 社区沟通

```markdown
# 在 GitHub Discussions 发起讨论

**Title**: [RFC] Agent Learning Capabilities for OpenClaw

**Body**:

## Motivation

OpenClaw currently lacks the ability to learn from user interactions...

## Proposal

Add optional agent learning capabilities through:

1. Agent Lightning integration
2. APO for prompt optimization
3. RL for continuous improvement

## Implementation

- Non-intrusive: Plugin-based architecture
- Opt-in: Disabled by default
- Well-tested: 95% code coverage
- Documented: Complete user guide

## Questions for Maintainers

1. Does this align with OpenClaw's roadmap?
2. Any concerns about dependencies (agent-lightning)?
3. Preferred merge strategy (monorepo or separate package)?

[Link to working prototype in our fork]
```

#### Phase 3: PR 提交

```bash
# 1. 同步上游最新代码
git remote add upstream https://github.com/openclaw/openclaw.git
git fetch upstream
git rebase upstream/main

# 2. 创建干净的 PR 分支
git checkout -b pr/agent-learning
git cherry-pick <commits>

# 3. 推送到我们的 fork
git push origin pr/agent-learning

# 4. 创建 PR
gh pr create \
  --repo openclaw/openclaw \
  --title "feat: Add Agent Learning capabilities" \
  --body "$(cat docs/pr-template.md)"
```

#### PR 模板

````markdown
## Description

Adds optional agent learning capabilities to OpenClaw through Agent Lightning integration.

## Motivation

- Enable agents to improve from user feedback
- Automatic prompt optimization (APO)
- Continuous learning through reinforcement learning

## Changes

- [x] Add `@openclaw/extension-learning` plugin
- [x] Implement `LightningAgent` wrapper
- [x] Add WebUI learning panel
- [x] Update configuration schema
- [x] Add comprehensive tests (95% coverage)
- [x] Documentation and examples

## Breaking Changes

None - this is an opt-in feature.

## Testing

```bash
pnpm test:learning
pnpm test:compatibility
```
````

## Screenshots

[WebUI Learning Panel Screenshot]

## Checklist

- [x] Tests pass locally
- [x] Code follows project style
- [x] Documentation updated
- [x] No breaking changes
- [x] Discussed in #123

```

---

## 实施指南

### 改进分类实战

让我们将计划中的改进分类：

#### [A] 早期贡献（核心 + 高侵入）

**暂无**

我们的改进都设计为低侵入性。

#### [B] 独立插件（外围 + 高侵入）

```

1. Agent Lightning 集成
   → Extension: @openclaw/extension-learning
   → 优先级: P0
   → 时间: Month 1-3

2. 可观测性增强
   → Extension: @openclaw/extension-telemetry
   → 优先级: P1
   → 时间: Month 4-6

```

#### [C] 渐进式集成（核心 + 低侵入）

```

1. 异步训练架构
   → 策略: Fork + 定期合并
   → 优先级: P1
   → 贡献计划: Month 6 提交 RFC

2. 性能优化（缓存、批处理）
   → 策略: 小型 PR 分批提交
   → 优先级: P2
   → 贡献计划: 每月 1-2 个小 PR

```

#### [D] Skills/Hooks（外围 + 低侵入）

```

1. 模型性能分析
   → Skill: model-performance-analyzer
   → 优先级: P2
   → 时间: Month 3

2. 模型量化工具
   → MCP Server: angelslim-quantizer
   → 优先级: P0
   → 时间: Month 2

```

---

### 目录结构建议

```

openclaw-fork/
├── extensions/ # 独立插件
│ ├── openclaw-learning/ # [B] Agent Learning
│ │ ├── src/
│ │ ├── tests/
│ │ ├── package.json
│ │ └── README.md
│ │
│ └── openclaw-telemetry/ # [B] 可观测性
│ ├── src/
│ └── package.json
│
├── mcp-servers/ # MCP 服务器
│ ├── angelslim-quantizer/ # [D] 模型量化
│ └── performance-monitor/
│
├── skills/ # 技能包
│ ├── model-performance-analyzer/
│ └── prompt-optimizer/
│
├── src/ # [C] 渐进式集成
│ ├── gateway/
│ │ └── async-runner.ts # 异步架构
│ └── agents/
│ └── experience-buffer.ts
│
└── docs/
├── IMPROVEMENT_PLAN.md # 总体计划
├── VERSION_COMPATIBILITY_STRATEGY.md # 本文档
└── extensions/ # 插件文档
├── learning.md
└── telemetry.md

````

---

### 开发工作流

#### 日常开发

```bash
# 1. 每周同步上游
git fetch upstream
git checkout main
git merge upstream/main

# 2. 运行兼容性测试
pnpm test:compatibility

# 3. 如果测试失败
pnpm test:compatibility --verbose
# 分析失败原因，更新插件代码

# 4. 更新插件版本
cd extensions/openclaw-learning
pnpm version patch
pnpm publish

# 5. 更新文档
vim docs/CHANGELOG.md
git add .
git commit -m "chore: sync upstream, bump extension versions"
````

#### 发布流程

```bash
# 1. 测试所有插件
pnpm --filter "@openclaw/extension-*" test

# 2. 构建所有插件
pnpm --filter "@openclaw/extension-*" build

# 3. 发布到 npm
pnpm --filter "@openclaw/extension-*" publish --access public

# 4. 创建 GitHub Release
gh release create v1.0.0 \
  --title "OpenClaw Extensions v1.0.0" \
  --notes "$(cat RELEASE_NOTES.md)"

# 5. 通知用户
# - GitHub Discussions
# - 项目文档更新
```

---

## 总结

### 推荐策略组合

```
Agent Lightning 集成
  → 策略: [B] 独立插件
  → 理由: 外围功能，可选启用，易于维护
  → 时间: 3 个月完成
  → 贡献: 成熟后提 PR

AngelSlim 边缘模型
  → 策略: [D] MCP Server
  → 理由: 外部工具集成，进程隔离
  → 时间: 2 个月完成
  → 贡献: 工具链成熟后分享

异步训练架构
  → 策略: [C] 渐进式集成
  → 理由: 核心架构改动，需要深度讨论
  → 时间: 6 个月完成
  → 贡献: 先 RFC，获得认可后逐步贡献

可观测性增强
  → 策略: [B] 独立插件
  → 理由: 通用需求，但实现可选
  → 时间: 4 个月完成
  → 贡献: 优先贡献（对社区价值高）
```

### 关键成功因素

1. **插件优先**：90% 的改进通过插件实现
2. **定期同步**：每周合并上游更新
3. **自动化测试**：CI/CD 检测兼容性问题
4. **积极沟通**：在 Discussions 中与维护者交流
5. **文档完善**：每个插件都有详细文档和示例

### 维护成本估算

```
策略               每周工作量    风险等级    长期成本
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[B] 独立插件       1-2 小时     低          低
[D] Skills/MCP     0.5-1 小时   极低        极低
[C] 渐进式集成     3-5 小时     中          中
[A] 早期贡献       10+ 小时     高          低（合并后）
```

**结论**：采用 **插件化优先** 策略，可以将每周维护成本控制在 **2-3 小时**以内，同时保持灵活性和可维护性。

---

**文档维护者**: OpenClaw 贡献者
**最后更新**: 2026-02-09
**状态**: 活跃维护
