# Plux：终结复制粘贴的 AI 工作流

<div align="center">

### 🎯 **看到文件？点击 `+`。就是这么简单。告别复制粘贴的痛苦。**

[![GitHub Stars](https://img.shields.io/github/stars/milisp/plux?style=for-the-badge&logo=github&color=gold)](https://github.com/milisp/plux/stargazers)
[![Downloads](https://img.shields.io/github/downloads/milisp/plux/total?style=for-the-badge&color=blue)](https://github.com/milisp/plux/releases)
[![License](https://img.shields.io/github/license/milisp/plux?style=for-the-badge&color=green)](LICENSE)

**终于，有一个真正懂文件管理的 AI 工具。**

*专为开发者、研究者、写作者，以及所有厌倦了将文件复制粘贴到 AI 聊天中的人打造。*

[🚀 **立即下载**](#快速开始) • [📖 **文档**](./docs) • [💬 **社区**](https://github.com/milisp/plux/discussions) • [⭐ **给我们加星**](https://github.com/milisp/plux/stargazers)

</div>

---

## 我们都遇到的问题

```
😤 找到文件 → 打开文件 → 全选 → 复制 → 切换到 AI → 粘贴 → 重复...
```

**是不是很熟悉？** 我们都经历过。直到现在。

## Plux 的解决方案

```
😎 看到文件 → 点击 + → 问 AI → 完成。
```

**Plux** 让你的本地文件——PDF、代码、CSV、文档、任何内容——只需**一键**即可成为 AI 上下文。不再需要复制粘贴的工作流。不再丢失上下文。为 AI 时代带来纯粹、可视化的文件管理体验。

## 🖼️ 实际演示

![Plux Interface](images/plux.png)

<div align="center">
<em>可视化文件树与神奇的 + 按钮。只需一键即可将任意文件添加到你的 AI 对话中。</em>
</div>

---

## ✨ 为什么开发者喜欢 Plux

### 🚀 **即刻上下文，无缝体验**
```
📁 Your Project/
├── 📄 main.py          [+] ← 点击添加
├── 📁 components/      [+] ← 添加整个文件夹  
│   ├── 📄 header.tsx   [+]
│   └── 📄 footer.tsx   [+]
└── 📄 README.md        [+]
```

### 💪 **你需要的全都有，没用的全没有**
- ➕ **一键上下文**：+ 按钮改变一切
- 🔍 **智能文件浏览器**：即时浏览和预览文件
- 💬 **多模型 AI**：Claude、GPT、Gemini、Ollama —— 集于一身
- 📊 **全能文件支持**：PDF、CSV、代码、Markdown、任何文件
- 🎨 **美观代码查看器**：护眼的语法高亮
- 📝 **内置记事本**：无需切换应用即可保存见解
- ⚡ **桌面级速度**：原生 Tauri 性能（约 6MB）
- 🔒 **隐私优先**：你的文件绝不会离开本地

---

## 🎯 真实场景魔法

### 开发者专属 👨‍💻
```bash
# 以前痛苦的流程：
cat src/auth.js | pbcopy
# 粘贴到 AI 聊天
cat src/components/Login.tsx | pbcopy  
# 再粘贴一次...

# 现在这样做：
# 点击 + 添加 auth.js
# 点击 + 添加 Login.tsx
# 随便问 AI
```

### 研究者专属 📚
- **文献综述**：添加论文、笔记、数据集，并可视化确认
- **数据分析**：包含方法文件、结果、以往发现
- **论文写作**：轻松组织章节和参考文献

### 内容创作者专属 ✍️
- **博客写作**：研究材料、草稿、参考文献——尽在指尖
- **文档编写**：从代码文件到完整文档只需几秒
- **创意项目**：灵感、草稿、想法可视化整理

---

## ⚡ 快速入门示例

### 示例 1：代码审查
```
1. 浏览到你的功能分支文件
2. 点击 + 添加你修改的文件  
3. 提问：“请审查此实现是否存在安全问题”
4. 即刻获得上下文反馈
```

### 示例 2：数据分析  
```
1. 点击 + 添加你的 dataset.csv
2. 点击 + 添加 analysis_config.json
3. 提问：“你在这些数据中看到了什么模式？”
4. 将见解保存到内置记事本
```

### 示例 3：调试复杂问题
```
1. 用 + 添加错误日志
2. 用 + 添加相关源码文件
3. 用 + 添加配置文件
4. 提问：“这个 bug 的原因是什么？”
```

**无需复制粘贴，无需找文件。只需纯粹、可视化的上下文管理。**

## 🚀 60 秒极速上手

### 📥 安装

**🎉 即将上线：一键下载安装**
- 🍎 **macOS**：下载 `.dmg` 
- 🪟 **Windows**：下载 `.exe`
- 🐧 **Linux**：下载 `.AppImage`

**📦 源码构建**
```bash
git clone https://github.com/milisp/plux.git
cd plux
bun install
bun run tauri:build
```

### ⚙️ 快速配置

1. **🗂️ 安装文件系统 MCP 服务器**（处理文件操作）：
```bash
# 选项 1：Rust 版（推荐）
cargo install rust-mcp-filesystem

# 选项 2：Node.js 版  
npm install -g @modelcontextprotocol/server-filesystem
```

2. **📝 在 `~/.config/plux/mcp.json` 创建配置文件**：
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "rust-mcp-filesystem",
      "args": ["~/"]
    }
  }
}
```

3. **🚀 启动 Plux**，开始疯狂点击 + 按钮吧！

### 🎯 新手指南
1. **浏览文件**：在可视化树中探索你的项目
2. **点击 +**：将文件添加到 AI 对话  
3. **提问**：与 AI 聊聊你的代码/文档
4. **保存见解**：用内置记事本记录重要发现

**就是这么简单！欢迎体验 AI 文件管理的未来。**

---

## 🗺️ 未来规划

<div align="center">

### 🚀 **加入 1000+ 开发者共建 AI 工作流的未来**

</div>

**🔥 活跃开发路线图：**
- [x] ✅ 多模型支持（GPT、Gemini、Ollama）
- [x] ✅ 可视化文件树与 + 按钮魔法
- [x] ✅ 内置记事本系统
- [ ] 🚧 **智能上下文推荐** —— “你可能还需要这些文件”
- [ ] 📱 **移动伴侣 App** —— 随时随地访问笔记  
- [ ] 🧠 **上下文记忆** —— 跨会话记住文件组合
- [ ] 🔗 **文件关系映射** —— 相关文件的可视化连接
- [ ] 🎨 **自定义主题** —— 让 Plux 更符合你的风格
- [ ] 🚀 **自动配置向导** —— 零配置安装 MCP 服务器
- [ ] 🔌 **插件生态** —— 社区驱动的文件类型支持

---

## 🤝 加入革命

<div align="center">

**Plux 不只是一个工具——它是终结复制粘贴工作流的运动。**

### 准备好成为变革的一员了吗？

[![Star on GitHub](https://img.shields.io/github/stars/milisp/plux?style=for-the-badge&logo=github&label=Star%20on%20GitHub&color=gold)](https://github.com/milisp/plux/stargazers)
[![Follow Updates](https://img.shields.io/github/watchers/milisp/plux?style=for-the-badge&logo=github&label=Watch&color=blue)](https://github.com/milisp/plux/watchers)
[![Join Discord](https://img.shields.io/badge/Discord-Join%20Community-5865F2?style=for-the-badge&logo=discord)](https://discord.gg/plux)

**🌟 给我们加星** • **🍴 Fork 项目** • **🐛 报告 Bug** • **💡 建议新功能** • **📢 扩散 Plux**

</div>

### 🙌 如何贡献

- 🌟 **给仓库加星** —— 表达你的支持！
- 🐛 **报告问题** —— 帮助我们改进
- 💡 **提出想法** —— 你需要什么功能？
- 📢 **告诉更多人** —— 发推、写博客或分享给朋友
- 🔧 **开发插件** —— 为你的场景扩展 Plux
- 💻 **代码贡献** —— 查看我们的 [贡献指南](CONTRIBUTING.md)

### 🎯 我们的使命

**让 AI 上下文管理变得如此直观，让 + 按钮像复制粘贴一样基础。**

每个文件树都该有 + 按钮。每个 AI 工具都应尊重可视化工作流。每位开发者都应专注于创造，而非管理上下文。

**加入我们。让我们共同终结复制粘贴。**

---

<div align="center">

### 📚 了解更多

[📖 **文档**](./docs) • [🎥 **演示视频**](./docs/demo.md) • [🔧 **API 参考**](./docs/api.md) • [🤔 **常见问题**](./docs/faq.md)

**由厌倦复制粘贴的开发者倾情打造 ❤️**

*革命，从一个 + 开始*

</div>