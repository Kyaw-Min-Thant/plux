# Plux: The End of Copy-Paste AI Workflows

> **File tree + plus button** — One-click your files to AI.  
> Your personal **AI finder/explorer**.

<div align="center">

### 🎯 **See a file? Click `+`. That's it. No more copy-paste hell.**

[![GitHub Stars](https://img.shields.io/github/stars/milisp/plux?style=for-the-badge&logo=github&color=gold)](https://github.com/milisp/plux/stargazers)
[![Downloads](https://img.shields.io/github/downloads/milisp/plux/total?style=for-the-badge&color=blue)](https://github.com/milisp/plux/releases)
[![License](https://img.shields.io/github/license/milisp/plux?style=for-the-badge&color=green)](LICENSE)

**Finally, an AI tool that gets file management right.**

*Built for developers, researchers, writers, and anyone tired of copy-pasting files into AI chats.*

[🚀 **Download Now**](#getting-started) • [📖 **Documentation**](./docs) • [💬 **Community**](https://github.com/milisp/plux/discussions) • [⭐ **Star Us**](https://github.com/milisp/plux/stargazers)

</div>

---

## 🛠 Technical Overview

**Tech Stack**: React + TypeScript + Tauri + Model Context Protocol (MCP)

**Supported AI Providers**: OpenRouter, Claude, GPT, Gemini, Ollama

**Supported File Types**: PDF, CSV, code files, Markdown, plain text, and more

**MCP Server Options**:
- Rust: `cargo install rust-mcp-filesystem`
- Node.js: `npm install -g @modelcontextprotocol/server-filesystem`

**Performance**: Native Tauri app (~6MB) with instant file tree navigation and syntax-highlighted preview

---

## The Problem We All Face

```
😤 Find file → Open file → Select all → Copy → Switch to AI → Paste → Repeat...
```

**Sound familiar?** We've all been there. Until now.

## The Plux Solution

```
😎 See file → Click + → Ask AI → Done.
```

**Plux** transforms your local files—PDFs, code, CSVs, documents, anything—into AI context with **one click**. No more copy-paste workflows. No more lost context. Just pure, visual file management for the AI age.

## 🔍 How Plux Compares

- **Cursor IDE**: Relies on typing `@` + filename inside an IDE. Limited to specific IDE environments and requires more typing.  
- **Claude Code**: Works in the terminal with commands; requires familiarity with file paths and less visual feedback.  
- **Plux**: Visual file tree + one-click `+` button + works with any AI model + native desktop experience.

[📖 Full comparison here](./docs/plux-positioning-and-comparison.md)

## 🖼️ See It In Action

![Plux Interface](images/plux.png)

<div align="center">
<em>The visual file tree with the magical + button. One click adds any file to your AI conversation.</em>
</div>

---

## ✨ Why Developers Love Plux

### 🚀 **Instant Context, Zero Friction**
```
📁 Your Project/
├── 📄 main.py          [+] ← Click to add
├── 📁 components/      [+] ← Add entire folder  
│   ├── 📄 header.tsx   [+]
│   └── 📄 footer.tsx   [+]
└── 📄 README.md        [+]
```

### 💪 **Everything You Need, Nothing You Don't**
- ➕ **One-Click Context**: The + button that changes everything
- 🔍 **Smart File Explorer**: Browse and preview files instantly
- 💬 **Multi-Model AI**: Claude, GPT, Gemini, Ollama — all in one place
- 📊 **Universal File Support**: PDFs, CSVs, code, markdown, anything
- 🎨 **Beautiful Code Viewer**: Syntax highlighting that doesn't hurt your eyes
- 📝 **Built-in Notepad**: Save insights without switching apps
- ⚡ **Desktop Speed**: Native Tauri performance (~6MB)
- 🔒 **Privacy First**: Your files never leave your machine

---

## 🎯 Real-World Magic

### For Developers 👨‍💻
```bash
# Instead of this painful workflow:
cat src/auth.js | pbcopy
# paste into AI chat
cat src/components/Login.tsx | pbcopy  
# paste again...

# Do this:
# Click + on auth.js
# Click + on Login.tsx
# Ask AI anything
```

### For Researchers 📚
- **Literature Review**: Add papers, notes, datasets with visual confirmation
- **Data Analysis**: Include methodology files, results, previous findings
- **Thesis Writing**: Organize chapters and references effortlessly

### For Content Creators ✍️
- **Blog Writing**: Research materials, drafts, references — all at your fingertips
- **Documentation**: Code files to comprehensive docs in seconds
- **Creative Projects**: Inspiration, drafts, and ideas organized visually

---

## ⚡ Quick Start Examples

### Example 1: Code Review
```
1. Browse to your feature branch files
2. Click + on the files you changed  
3. Ask: "Review this implementation for security issues"
4. Get instant, contextual feedback
```

### Example 2: Data Analysis  
```
1. Click + on your dataset.csv
2. Click + on analysis_config.json
3. Ask: "What patterns do you see in this data?"
4. Save insights to built-in notepad
```

### Example 3: Debug Complex Issue
```
1. Add error logs with +
2. Add related source files with +
3. Add configuration files with +
4. Ask: "What's causing this bug?"
```

**No copy-paste. No file hunting. Just pure, visual context management.**

## 🚀 Get Started in 60 Seconds

### 📥 Installation

**🎉 Coming Soon: One-Click Downloads**
- 🍎 **macOS**: Download `.dmg` 
- 🪟 **Windows**: Download `.exe`
- 🐧 **Linux**: Download `.AppImage`

**📦 Build from Source**

### Prerequisites

[development or CONTRIBUTING](CONTRIBUTING.md)

```bash
git clone https://github.com/milisp/plux.git
cd plux
bun install
bun tauri build
```

### ⚙️ Quick Setup

1. **🗂️ Install filesystem MCP server** (handles file operations):
```bash
# Option 1: Rust version (recommended)
cargo install rust-mcp-filesystem
```

or download [rust-mcp-filesystem](https://rust-mcp-stack.github.io/rust-mcp-filesystem/#/guide/install)


2. **📝 Create config file** at `~/.config/plux/mcp.json`:
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

#### Option 2: Node.js version  

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "~/"
      ]
    }
  }
}
```

3. **🚀 Launch Plux** and start clicking those + buttons!

### 🎯 First Steps
1. **Browse Files**: Explore your project in the visual tree
2. **Click +**: Add files to your AI conversation  
3. **Ask Questions**: Chat with AI about your code/documents
4. **Save Insights**: Use the built-in notepad for important findings

**That's it! Welcome to the future of AI file management.**

---

## 🗺️ What's Coming Next

<div align="center">

### 🚀 **Join 1000+ developers building the future of AI workflows**

</div>

**🔥 Active Development Roadmap:**
- [x] ✅ Multi-model support (Claude, GPT, Gemini, Ollama)
- [x] ✅ Visual file tree with + button magic
- [x] ✅ Built-in notepad system
- [ ] 🚧 **Smart context suggestions** - "You might also want these files"
- [ ] ⚙️ Auto-download and path setup for rust-mcp-filesystem
- [ ] 📊 Model comparison view
- [ ] 📱 **Mobile companion app** - Access your notes anywhere  
- [ ] 🧠 **Context memory** - Remember file combinations across sessions
- [ ] 🔗 **File relationship mapping** - Visual connections between related files
- [ ] 🎨 **Custom themes** - Make Plux match your style
- [ ] 🚀 **Auto-setup wizard** - Zero-config MCP server installation
- [ ] 🔌 **Plugin ecosystem** - Community-built file type support

---

## 🤝 Join the Revolution

<div align="center">

**Plux is more than a tool — it's a movement to end copy-paste workflows forever.**

### Ready to be part of the change?

[![Star on GitHub](https://img.shields.io/github/stars/milisp/plux?style=for-the-badge&logo=github&label=Star%20on%20GitHub&color=gold)](https://github.com/milisp/plux/stargazers)
[![Follow Updates](https://img.shields.io/github/watchers/milisp/plux?style=for-the-badge&logo=github&label=Watch&color=blue)](https://github.com/milisp/plux/watchers)
[![Join Discord](https://img.shields.io/badge/Discord-Join%20Community-5865F2?style=for-the-badge&logo=discord)](https://discord.gg/plux)

**🌟 Star us** • **🍴 Fork it** • **🐛 Report bugs** • **💡 Suggest features** • **📢 Spread the word**

</div>

### 🙌 How to Contribute

- 🌟 **Star this repo** - Show your support!
- 🐛 **Report issues** - Help us improve
- 💡 **Share ideas** - What features do you need?
- 📢 **Tell others** - Tweet, blog, or just tell a friend
- 🔧 **Build plugins** - Extend Plux for your use case
- 💻 **Code contributions** - Check out our [Contributing Guide](CONTRIBUTING.md)

### 🎯 Our Mission

**To make AI context management so intuitive that the + button becomes as fundamental as copy-paste.**

Every file tree should have + buttons. Every AI tool should respect visual workflows. Every developer should spend time building, not managing context.

**Join us. Let's kill copy-paste forever.**

---

<div align="center">

### 📚 Learn More

[📖 **Documentation**](./docs) • [🎥 **Demo Video**](./docs/demo.md) • [🔧 **API Reference**](./docs/api.md) • [🤔 **FAQ**](./docs/faq.md)

**Built with ❤️ by developers who were tired of copy-paste workflows**

*The revolution starts with a single +*

</div>
