# AI Growth vs Job Market Shift: Interactive Workforce Impact Dashboard

An interactive web dashboard that analyzes how AI development growth correlates with job market changes across different roles, helping users make informed career and business decisions.

## 🎯 Problem Statement

The rapid growth of AI technology is transforming the job market, but there's confusion about which roles are at risk and which are growing. This dashboard provides data-driven insights by combining two unrelated data sources to reveal workforce transformation patterns.

## 📊 Data Sources

### 1. AI Development Growth (GitHub API)
- AI-related repository growth metrics
- Technology trend analysis
- Developer activity patterns
- Signals: AI tools, automation, GenAI development pace

### 2. Job Market Trends (Multiple APIs)
- Job posting trends by role from Indeed/LinkedIn APIs
- Government labor statistics
- Curated datasets from Kaggle/data.gov
- Signals: Demand change for current roles

## ✨ Key Features

### Interactive Role Explorer
- 15+ job roles including Software Developer, AI Engineer, Data Analyst, etc.
- Searchable dropdown with role categorization
- Real-time data visualization updates

### Time Slider Analysis
- Interactive timeline from 2020-2024
- Real-time preview of data changes
- Proper handling of missing data with interpolation

### Side-by-Side Role Comparison
- Compare any two roles simultaneously
- Highlight significant differences
- Visual emphasis for market dynamics

### AI Impact Score
- Computed metric: (AI Growth Rate %) - (Job Demand Change %)
- Risk classifications:
  - 🔴 High Disruption Risk
  - 🟡 Transition Role  
  - 🟢 Growth Opportunity

### Auto-Generated Insights
- Contextual analysis based on current selections
- Key statistics and percentage changes
- Clickable references to supporting data

### Impact Matrix
- Comprehensive view of all roles
- Sortable by AI growth, job trends, impact score
- Color-coded risk levels

## 🛠 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Charts**: Recharts for interactive visualizations
- **State Management**: Zustand for lightweight state management
- **Styling**: CSS3 with modern design patterns
- **Testing**: Jest + fast-check for property-based testing
- **Data Processing**: Custom normalization and caching layer

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- GitHub API token (optional, for higher rate limits)

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd workforce-impact-dashboard
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Create environment file:
\`\`\`bash
cp .env.example .env
# Add your API keys (optional)
\`\`\`

4. Start development server:
\`\`\`bash
npm run dev
\`\`\`

5. Open http://localhost:3000

### Available Scripts

- \`npm run dev\` - Start development server
- \`npm run build\` - Build for production
- \`npm run test\` - Run test suite
- \`npm run test:property\` - Run property-based tests
- \`npm run lint\` - Run ESLint

## 🧪 Testing Strategy

The project uses a dual testing approach:

### Unit Tests
- Component rendering and interactions
- Specific examples and edge cases
- Integration points between components

### Property-Based Tests
- Universal properties across all inputs
- Data processing consistency
- State management correctness
- 17 comprehensive properties covering all requirements

## 📁 Project Structure

\`\`\`
workforce-impact-dashboard/
├── src/
│   ├── components/          # React components
│   ├── services/           # API clients and data services
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   ├── data/               # Sample datasets
│   └── __tests__/          # Test files
├── .kiro/                  # Kiro IDE configuration
└── docs/                   # Documentation
\`\`\`

## 🎨 How Kiro Accelerated Development

This project was developed using Kiro IDE with:

- **Spec-driven development**: Requirements → Design → Implementation plan
- **Property-based testing**: 17 correctness properties ensuring reliability
- **Code generation**: API clients, React components, data models
- **Interactive development**: Real-time feedback and validation

### Kiro Usage Examples

1. **Data Model Generation**:
   - Generated TypeScript interfaces for JobRole, AIGrowthData, etc.
   - Created validation functions and utility helpers

2. **Component Scaffolding**:
   - Built React components with proper TypeScript props
   - Implemented responsive layouts and interactions

3. **Testing Infrastructure**:
   - Set up Jest + fast-check configuration
   - Generated property-based tests for all correctness properties

## 📈 Key Insights

The dashboard reveals important workforce transformation patterns:

- **Not job loss — role evolution**: AI is transforming roles rather than eliminating them
- **Data-driven upskilling direction**: Clear indicators for career development
- **Market timing insights**: When to transition between roles
- **Technology adoption patterns**: How AI growth correlates with job demand

## 🏆 Competition Submission

This project was created for the AI for Bharat competition, demonstrating:

✅ Two unrelated real-world data sources  
✅ Interactive, visual dashboard  
✅ Complete GitHub repository with .kiro directory  
✅ Comprehensive documentation and screenshots  
✅ Production-ready deployment configuration  

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📞 Support

For questions or issues, please open a GitHub issue or contact the development team.

---

**Built with ❤️ using Kiro IDE for the AI for Bharat competition**