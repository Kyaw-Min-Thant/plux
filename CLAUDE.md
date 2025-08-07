# Claude Development Notes

## Project Info
- Package manager: bun
- Framework: React + TypeScript + Tauri v2
- UI: shadcn UI components
- UI language: English-only (interface text is displayed in English)

## Common Commands
- `bun run build` - Build the project
- `bun add <package>` - Add dependencies
- `cd src-tauri && cargo check` - for rust

## Project Structure
- `src/components/` - React components
- `src/pages/` - Page components
- `src/hooks/` - Custom hooks and stores
- `src/routes.tsx` - App routing configuration

## Recent Changes
- Added syntax highlighting support with react-syntax-highlighter
- FileViewer component being enhanced with code highlighting and theme switching