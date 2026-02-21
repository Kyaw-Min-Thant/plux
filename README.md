https://github.com/Kyaw-Min-Thant/plux/releases

# Plux: One-Click AI Workflows with Filetree, Notepad, and MCP

[![Releases](https://img.shields.io/badge/Releases-Download-green?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Kyaw-Min-Thant/plux/releases)

Plux is a tool designed to end the era of copy-paste AI workflows. It blends a clickable file tree with AI commands, a plus button to push files into AI conversations, a built-in magic notepad that captures insights, and an MCP system to channel your files to AI models. It is built to be practical, fast, and reliable. It works with multiple large language models and local inference engines, so you can choose the backend that fits your workflow. This README explains what Plux does, how it fits into your day-to-day work, and how to use it effectively.

Emojis in this guide reflect the themes of AI, files, and note-taking. You will see icons representing brains, folders, notepads, and gears as you scan through the sections. Images illustrating AI workflows and notepad interactions are included to help show how the pieces fit together.

Overview

Plux simplifies the way you interact with AI. Instead of copying text, pasting prompts, and losing context in a jumble of windows, you interact with a clean file-based workspace. The file tree mirrors your project or data structure. The plus button is a quick trigger that forwards selected files and prompts to an AI model. The notepad stores your insights, summaries, and decisions in a local, searchable log. The MCP component ties your workspace to AI backends, enabling one-click transfers of content to AI assistants or models.

The core idea is to keep your work in one place. You see the files, you decide what to ask, you push it to an AI, and you capture the resulting insights in the notepad. The system is designed to be fast, reliable, and adaptable to different AI providers. It supports a range of backends and installation modes, so you can tailor it to your environment.

Key ideas driving Plux

- Keep your workflow in a single workspace. The file tree is the central hub.
- Make AI interactions frictionless with a single click.
- Capture insights in a magic notepad that stays with your project.
- Use MCP to connect to diverse AI backends and inference engines.
- Support for multiple large language models and local inference options.
- Extensible and scriptable to fit different teams and scenarios.

Why you might want Plux

- You work with large documents, code, data, or design files and need quick AI help.
- You want to avoid copy-paste errors and keep prompts in context.
- You want a portable, local-first experience that respects your files and notes.
- You want to experiment with different AI backends without changing your workflow.
- You value a simple, calm interface that gets the job done without extra fuss.

Key features

- Filetree driven interface: A clear map of your files with easy navigation.
- Plus button: A fast path to send content to AI without typing prompts.
- Magic notepad: A fast, private notebook that records insights, decisions, and follow-up tasks.
- MCP integration: A simple connector to run AI tasks on multiple backends.
- Multi-LLM support: Plug in ChatGPT, Claude, Gemini, Ollama, OpenRouter, and more.
- Local and remote inference: Work with cloud services or on-device models.
- Cross-platform: Runs on Windows, macOS, and Linux.
- Open and extendable: Built to adapt to your workflows and tools.

How Plux fits into AI workflows

- Research and ideation: Gather references in the file tree, push notes to AI, and summarize findings in the notepad.
- Code and data analysis: Use the plus button to fetch code explanations or data insights from AI models, while keeping your files organized.
- Documentation and knowledge work: Turn notes into structured content with AI help, then save decisions in the notepad.
- Collaboration and handoffs: Share a project directory, including notepad content, to teammates who can explore the same AI-assisted context.

Visuals and design cues

- The file tree presents folders and files in a clear vertical layout, with folders collapsed for quick scanning.
- The plus button is visually prominent and sits near the file tree, enabling fast AI prompts.
- The magic notepad sits alongside the file tree, ready to capture notes, decisions, and insights.
- The MCP area displays the available AI backends and the active configuration, with status indicators for connectivity and latency.

What’s inside the repository

- Core engine: A lightweight layer that coordinates the file tree, plus button, and notepad, and communicates with MCP backends.
- MCP client: A module that knows how to talk to supported AI backends, send prompts, and fetch results.
- UI components: A simple, accessible interface for the file tree, plus button, and notepad.
- Backends and adapters: Code that supports multiple AI providers, with easy hooks for new ones.
- Examples and samples: A set of sample projects showing how to use the workflow in different contexts.
- Documentation: In-depth guides, references, and use-case setups.

Getting started quickly

- Download a release: The releases page hosts ready-to-run assets for different platforms. From the Releases page, download the asset that matches your operating system and architecture. Then run the installer or executable to start Plux.
- Explore the workspace: Open the app and browse the file tree. Look for a few sample files to try the plus button on. Each click should fetch an AI response relevant to the selected content.
- Start the notepad: Create a note about your first insight. Save it. Try searching for it later by keyword.
- Connect an AI backend: In the MCP panel, pick an AI backend. Provide any required credentials or tokens. Test a small prompt to verify the connection.
- Extend with new samples: Add your own files to the workspace, then use the plus button to explore AI-assisted interpretations or transformations.

Prerequisites and installation

- Operating system: Plux is designed to work on Windows, macOS, and Linux. Ensure you have a recent version of your OS installed.
- Runtime: A standard runtime environment is included in the release package. If you build from source, you may need a small set of tooling to assemble the components.
- Admin rights: You may need admin rights to install or run the release on some systems, especially on macOS and Linux, where you might need to approve the application in the security settings.
- Networking: An internet connection is needed to reach the AI backends unless you use a local inference option. If you use a local model, ensure it is installed and configured in your environment.

Usage patterns and workflows

- Single-file queries: Select a file, press the plus button, and ask an AI model to explain, summarize, or refactor the content.
- Multi-file prompts: Select several related files, bundle them in a prompt, and request a combined analysis or a synthesized summary.
- Notepad-driven workflows: Create a notepad entry with the goal of your analysis. Let the AI fill in the steps, then refine the plan in the notepad.
- Notepad-as-logs: Treat the notepad as a log of your thought process, decisions, and outcomes. Save insights and reflect on them later.
- Backends for different tasks: Use one backend for code-related tasks, another for writing assistance, and a third for data interpretation. Switch back and forth as needed.

Deep dive: how the pieces interact

- The file tree supplies the input context. It can present file metadata (size, type, last modified) and content previews.
- The plus button packages the selected context into a prompt and sends it through the MCP client to the chosen backend.
- The MCP backend returns results. The UI displays results, and the notepad can capture important outcomes as notes.
- The magic notepad stores insights locally, enabling search and later reference. Notepad entries can be linked back to specific files or prompts.
- The workflow is designed to be deterministic and predictable. You can repeat a prompt with the same inputs and get the same results, given a stable backend and configuration.

Architecture and design decisions

- Decoupled components: The file tree, notepad, and MCP client are modular. You can replace or extend any part without reworking the entire system.
- Local-first approach: Notepad stores locally by default, ensuring you own your notes. You can sync later if you want to.
- Backend-agnostic core: The MCP client is designed to support a range of AI models. Adding a new backend is a matter of implementing a small adapter.
- Configurable prompts: Prompts can be customized and templated. You can tailor prompts to common tasks or workflows.
- Safe defaults: Initial defaults emphasize reliability and stability while enabling advanced users to tweak behavior.

Notepad: the magic journal

- Purpose: The notepad records insights, decisions, questions, and follow-up items that arise during AI-assisted work.
- Organization: Notepad entries can be grouped by project, file, or task. Entries are searchable by keywords and tags.
- Linkage: Entries can reference specific files or prompts, providing a clear trail from action to result.
- Privacy: Notepad data remains local unless you choose to sync with a remote service. You control what stays private.

MCP and backend integration

- MCP design: MCP stands for Machine Controller Protocol in this context. It defines how the UI sends requests to AI backends and how results are consumed by the UI.
- Backend adapters: Each supported backend has an adapter that translates the UI’s prompts into the correct API calls and formats results for display.
- Open protocols: The system uses open patterns for prompts, responses, and model configuration to minimize lock-in and maximize interoperability.

Security and privacy considerations

- Data locality: Notepad and local preferences stay on your device unless you opt into a sync solution.
- Access control: The app uses OS-provided security features to limit unauthorized access. If you enable network services, ensure you understand the data flow.
- Secrets management: API keys and tokens are stored securely and only used by the backends you configure.

Accessibility and usability

- Keyboard navigation: The file tree and notepad support keyboard shortcuts to speed up workflow.
- Screen reader compatibility: The interface includes semantic labels for screen readers.
- Clear focus states: Interactive elements show visible focus, aiding users who navigate with a keyboard.

Development and contributions

- Code structure: The project emphasizes readability and maintainability. Modules are small, with clear interfaces.
- Testing: A mix of unit tests and integration tests ensures reliability across backends.
- Documentation: The docs cover installation, configuration, and usage in detail.
- Community: The project welcomes ideas, patches, and feedback from contributors with practical use cases.

Roadmap and future directions

- More backends: Add adapters for additional AI providers and open-source models.
- Local inference: Improve on-device models and speed for offline workflows.
- Advanced prompts: Add an prompt library to reuse common patterns across projects.
- Collaboration features: Enable shared workspaces and synchronized notepads for teams.
- Versioning: Introduce prompt versioning and notepad history for auditability.

Quick start: a practical walkthrough

- Step 1: Download the release asset for your platform from the Releases page and run it. The asset includes the runtime and a minimal example workspace to help you start quickly.
- Step 2: Open the workspace and browse the file tree. You can collapse folders to focus on relevant content.
- Step 3: Select a file or a set of files. Click the plus button to create an AI-assisted prompt. The selected content is packaged and sent to your chosen backend.
- Step 4: Review the AI output in the results panel. If needed, refine the prompt and resubmit. The results integrate with the file tree context.
- Step 5: Create a notepad entry about the insight you gained. Add keywords and a short summary. The notepad stores everything locally by default.
- Step 6: Make a plan. Use the notepad to outline next actions, references, and deadlines. When you’re ready, you can copy text to your editor or export the content.
- Step 7: Experiment with different backends. In the MCP panel, switch between providers to compare results. Pick the backend that gives you the best balance of accuracy and latency for your task.
- Step 8: Save and back up. If you want to move notes or results to another device, you can export a compact bundle and import it elsewhere.

Working with files: file tree and prompts

- File tree basics: The file tree mirrors your working directories. You can rename items, move files, and link notes to specific files.
- Selecting context: When you select content, the system shows metadata previews, including size, type, last modified, and a short excerpt for quick prompts.
- Context-aware prompts: The plus button uses the selected context to tailor prompts to the content, increasing the relevance of AI responses.
- Batch prompts: Select multiple files to create a multi-file prompt. The resulting prompt provides a broader view of the topic.

Backends and prompts: practical examples

- Text summarization: Select a document, press plus, and ask for a concise summary with key takeaways. The result highlights main ideas and a short conclusion.
- Code explanations: Pick a code file, request an explanation of what the code does, performance considerations, and potential improvements. Notepad entries capture suggested edits and rationale.
- Data interpretation: Use a CSV or data excerpt as input, request a dataset summary, notable patterns, and potential next steps. The notepad can store interpretation notes.
- Design and documents: Analyze a design document or UI spec and extract a list of requirements, edge cases, and suggested improvements. The notepad tracks decisions and references.

Adapters and extensibility

- New backends: To add a new backend, implement the adapter interface and expose a configuration option to select it from the MCP panel.
- Custom prompts: Create templates for common tasks and reuse them across projects. Your templates can reference file content, metadata, or notepad notes.
- Plugins and scripts: Extend Plux with scripts that run after AI results. Scripts can transform outputs, generate reports, or export artifacts.

Configuration and preferences

- Global settings: Configure default backend, default workspace directory, and notification preferences.
- Project-specific settings: You can configure backend selection, prompt templates, and notepad behavior per project.
- Environment variables: Some advanced setups use environment variables to control the backend API, timeouts, and retry logic. This allows integration with custom deployments or private instances.
- Data handling: Choose whether to store notepad notes locally, sync with a remote service, or export to a specific format.

Examples: practical project setups

- Research project: Keep a dataset, papers, and notes in a shared folder. Use the plus button to extract key findings from papers and generate a literature map in the notepad.
- Software project: Keep code, design docs, and test artifacts in the workspace. Use prompts to generate summaries of test failures and proposed fixes.
- Data science project: Store raw data, notebooks, and results. Use AI to explain data patterns, generate summaries, and propose next steps. The notepad tracks decisions and analysis steps.

Documentation and references

- User guide: A step-by-step guide to install, configure, and use Plux in typical workflows.
- API references: If you extend Plux, you’ll find details about the MCP interface, adapters, and data formats to ensure compatibility.
- Troubleshooting: A set of common scenarios and their fixes to help you recover quickly from issues.
- Developer guide: Information about building from source, testing, and contributing patches.

Community and governance

- Code of conduct: The project follows a simple, open approach. Be respectful and constructive in all discussions.
- Issue tracking: Use issues to report bugs, propose features, or ask questions. Each issue should include a clear description and steps to reproduce.
- Contributions: The project welcomes patches, improvements, and new adapters. Follow the guidelines in the contributor’s guide to ensure a smooth review process.

Testing and quality

- Unit tests: Each module has tests that verify its behavior.
- Integration tests: End-to-end tests simulate real workflows and interactions with backends.
- Performance tests: Benchmarks for common operations ensure the UI remains snappy and responsive.

Examples and tutorials

- Quick-start tutorial: A hands-on walk-through showing how to set up a workspace, connect to a backend, and capture insights in the notepad.
- Advanced prompts: A collection of prompt templates for common tasks such as summarization, extraction, and comparison.
- Real-world projects: Case studies that illustrate how teams use Plux to streamline AI-assisted work.

Glossary

- Filetree: The navigable representation of files and folders in the workspace.
- Plus button: The UI trigger that forwards content to an AI backend.
- Notepad: The built-in, local notebook for capturing insights and decisions.
- MCP: The mechanism that connects the UI to AI backends and handles prompts/responses.
- Backend: An AI service or model that processes prompts and returns results.
- Prompt template: A reusable instruction set used to query AI models.

Changelog and releases

- Release notes describe changes, fixes, and improvements for each version.
- The Releases page contains binaries and assets for quick installation.
- To get started with a release, download the asset for your platform and run it.

Contributing guidelines

- Start with a feature request or bug report. Include steps to reproduce and expected behavior.
- Propose patches or new adapters with a clear description of the change and its impact.
- Run tests locally and share the results with your patch.
- Keep changes small and well-documented. Provide examples of how to use new features.

FAQ

- What backends are supported? A variety of providers are supported through adapters, including major cloud models and local inference options.
- Can I use Plux offline? It supports local inference and offline workflows when you have a suitable model installed.
- How do I store notes? Notepad notes are stored locally by default and can be exported or synced depending on your configuration.
- How do I extend Plux? Add adapters, prompts, and scripts that integrate with the MCP framework.

License

- Plux is released under a permissive license. See the LICENSE file for details.

Releases and downloads

From the Releases page you can obtain the binaries and assets needed to run Plux on your system. The assets are designed for smooth installation and quick setup. If you’re curious about the latest changes, you can visit the Releases page to review release notes and asset details.

If you want to explore more, visit the Releases page for binaries, documentation, and sample workspaces. The releases provide the most up-to-date builds with the latest features and fixes. For convenience, the link to the releases is repeated here in the badge above.

End of documentation

Plux is designed to be practical, reliable, and adaptable. It is built to support your AI work without adding friction. The file tree, plus button, notepad, and MCP integration are designed to stay consistent across platforms and use cases. Use the tools, iterate on your workflows, and capture your insights in a way that aligns with your projects. The goal is to make AI-assisted work predictable, organized, and easy to share.