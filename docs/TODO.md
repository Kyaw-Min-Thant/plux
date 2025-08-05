# TODO: Plux, AI Finder Development Roadmap

## Current Status ✅
- [x] File tree management with expand/collapse
- [x] File + button to add files to AI context
- [x] Context files store management
- [x] File filtering and search in tree view
- [x] File/folder navigation
- [x] Chat integration with file context
- [x] Settings for exclude folders
- [x] Token counting for context management
- [x] **MCP Server Management System (useMcpStore)**
- [x] **MCP Server UI with enable/disable toggles**
- [x] **MCP config file management (mcp.json)**
- [x] **Server connection status and tool discovery**
- [x] **DXT manifest system for server installation**
- [x] **Multi-provider support (OpenAI, etc.)**

## Strategy: MCP Server Ecosystem Integration 🔌

### Phase 1: MCP Infrastructure & Core Servers (Week 1-2)

#### MCP Server Manager (Build on existing system)
- [x] ~~Server configuration management~~ (Already have mcp.json + useMcpStore)
- [x] ~~Server enable/disable toggles~~ (Already implemented in McpServers.tsx)  
- [ ] **Enhance server discovery** - Add server marketplace/browser
- [ ] **Complete tool loading** - Finish `loadServerTools` implementation
- [ ] **Server health monitoring** - Add connection status indicators
- [ ] **Auto-start/stop management** - Enhance current connection system
- [ ] **Server installation wizard** - Extend DXT manifest system

#### High-Priority Community Servers (Extend current mcp.json)
- [x] ~~Filesystem Server~~ (Already configured)
- [x] ~~Sequential Thinking Server~~ (Already configured)
- [ ] **GitHub Server** - Add to mcp.json + DXT manifest
- [ ] **Perplexity Server** - Web research capabilities  
- [ ] **Notion Server** - Content management integration
- [ ] **Bright Data Server** - Web data extraction (#1 server)
- [ ] **AgentQL Server** - Structured web data extraction
- [ ] **BigQuery Server** - Database querying
- [ ] **AWS Bedrock Server** - Multiple AI models

### User Experience (Month 2)
- [ ] User onboarding flow
- [ ] Tutorial/help system
- [ ] Multiple theme support (light/dark/high contrast)
- [ ] Keyboard shortcuts
- [ ] Settings persistence

### Phase 2: User Experience & Interface (Week 3-4)
- [ ] Rename to "AI Finder" and update branding
- [ ] **Enhance McpServers.tsx** - Add server marketplace/browser view
- [ ] **Server capability discovery** - Extend tool display to show capabilities
- [ ] **Unified context** - Integrate MCP tools with existing file context
- [ ] **Server-specific UI** - Custom interfaces for different server types
- [ ] **Export conversations** - Include MCP server context in exports
- [ ] **Complete tool integration** - Make MCP tools usable in chat

## Phase 2: Specialized MCP Server Categories

### Productivity & Collaboration Servers (Month 2)
- [ ] **Taskade Server** - Project and workflow management  
- [ ] **Routine Server** - Calendar and task integration
- [ ] **Plane Server** - Project automation
- [ ] **JetBrains Server** - IDE integration
- [ ] **Cloudflare Server** - Resource configuration

### Development & DevOps Servers (Month 2-3)
- [ ] **Semgrep Server** - Code security scanning
- [ ] **Prisma Postgres Server** - Database management
- [ ] **dbt Server** - Data build tool integration  
- [ ] **Google Cloud Run Server** - Deployment server
- [ ] **Harness Server** - Pipeline and repository interactions
- [ ] **ZenML Server** - MLOps pipeline interactions

### AI & Research Servers (Month 3-4)
- [ ] **Langfuse Server** - Prompt management
- [ ] **Logfire Server** - OpenTelemetry traces and metrics
- [ ] **21st.dev Magic Server** - UI component generation
- [ ] **Neo4j Server** - Graph database interactions
- [ ] **Milvus Server** - Vector database search

## Phase 3: Advanced MCP Ecosystem

### Financial & Market Data Servers (Month 4-5)
- [ ] **CoinGecko Server** - Crypto market data
- [ ] **Token Metrics Server** - Crypto analytics  
- [ ] **Twelve Data Server** - Financial market data
- [ ] **Stripe Server** - Payment API interactions
- [ ] **MotherDuck Server** - Data querying and analysis
- [ ] **Teradata Server** - Database management and data quality

### Communication & Social Servers (Month 5-6)
- [ ] **302AI Custom Server** - Flexible tool configuration
- [ ] **AgentRPC Server** - Cross-language function connectivity
- [ ] **ActionKit Server** - 130+ SaaS integrations (Slack, Salesforce, Gmail)
- [ ] **Various Communication Servers** - Based on top category from mcpservers.org

### Specialized Domain Servers (Month 6-7)
- [ ] **Web Scraping Servers** - Top category with multiple options
- [ ] **Search Servers** - Multiple search integration options  
- [ ] **Image Generation Servers** - AI-powered image creation
- [ ] **Game Development Servers** - Gaming-specific tools
- [ ] **Scientific Reasoning Servers** - Research and analysis tools

## Phase 4: Platform & Ecosystem Maturity

### MCP Server Development Kit (Month 7-8)
- [ ] Server development templates
- [ ] Testing framework for custom servers  
- [ ] Server publishing pipeline
- [ ] Community server marketplace
- [ ] Server analytics and metrics
- [ ] Revenue sharing for server developers

## Phase 5: Industry Specialization

### Education Vertical (Month 8-9)
- [ ] Student research assistant mode
- [ ] Citation management
- [ ] Academic writing support
- [ ] Homework help templates
- [ ] Study guide generation

### Business Vertical (Month 9-10)
- [ ] Legal document analysis
- [ ] Financial report processing
- [ ] Market research compilation
- [ ] Business plan assistance
- [ ] Compliance checking

### Healthcare Vertical (Month 10-11)
- [ ] Medical literature search
- [ ] Patient record analysis (with privacy)
- [ ] Symptom correlation
- [ ] Drug interaction checking
- [ ] Medical coding assistance

## Phase 6: Platform & Ecosystem

### API & Integrations (Month 11-12)
- [ ] Public API for third-party integrations
- [ ] Browser extension
- [ ] Mobile companion app
- [ ] Plugin system
- [ ] Webhook support

### Enterprise Features (Month 12+)
- [ ] SSO integration
- [ ] Enterprise security compliance
- [ ] Audit trails
- [ ] Custom deployment options
- [ ] Professional services

## Business Model Evolution

### MCP-Powered Platform Approach
- [ ] **Free tier**: Basic filesystem + 3 community servers
- [ ] **Pro tier**: Unlimited servers + premium servers + cloud sync
- [ ] **Enterprise tier**: Custom servers + on-premise + SSO
- [ ] **Developer tier**: Server development tools + marketplace revenue

### Revenue Streams  
- [ ] Subscription tiers based on server access
- [ ] Premium MCP server marketplace (revenue share)
- [ ] Custom MCP server development services
- [ ] Enterprise MCP server hosting
- [ ] White-label MCP client licensing

## Technical Infrastructure

### Performance & Scalability
- [ ] File processing optimization
- [ ] Caching system
- [ ] Database optimization
- [ ] CDN integration
- [ ] Load balancing

### Security & Privacy
- [ ] End-to-end encryption
- [ ] GDPR compliance
- [ ] SOC 2 certification
- [ ] Data anonymization
- [ ] Privacy-first architecture

## Success Metrics

### User Engagement
- [ ] Daily/monthly active users
- [ ] Session duration
- [ ] Files processed per user
- [ ] Feature adoption rates
- [ ] User retention

### Business Metrics
- [ ] Customer acquisition cost
- [ ] Lifetime value
- [ ] Conversion rates
- [ ] Revenue growth
- [ ] Market penetration

---

## Notes

- Prioritize user feedback and iterate quickly
- Keep the core experience simple while adding power-user features
- Focus on specific use cases that provide clear value
- Build community around the product
- Consider open-source components to accelerate development

## Ecosystem Stats (Current Reality Check)
- **Total Available Servers**: 1,535+ servers on mcpservers.org
- **Top Categories**: Search, Web Scraping, Communication, Productivity, Development
- **Major Adopters**: Claude, Gemini, OpenAI, Replit, Sourcegraph, Vertex AI
- **Growth**: Thousands of servers since November 2024 launch

## Competitive Advantages
1. **First-Mover as Universal MCP Client** - Be the go-to desktop client
2. **Server Marketplace** - Curated, tested, and rated servers
3. **Cross-Platform Desktop** - Native performance vs web interfaces
4. **Context Management** - Superior file + server context handling
5. **Local Privacy** - Keep sensitive data local while using cloud servers

## Next Actions

1. **Week 1**: Implement MCP server manager UI
2. **Week 2**: Integrate top 5 most popular servers (GitHub, Perplexity, Notion, Bright Data, AgentQL)
3. **Month 1**: Launch beta with 20+ integrated servers
4. **Month 2**: Build server marketplace and rating system
5. **Month 3**: Target specific verticals (developers → researchers → business users)