# Contributing to Workforce Impact Dashboard

Thank you for your interest in contributing to the Workforce Impact Dashboard! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Types of Contributions

We welcome various types of contributions:

- 🐛 **Bug Reports**: Help us identify and fix issues
- 💡 **Feature Requests**: Suggest new functionality
- 📝 **Documentation**: Improve guides, examples, and API docs
- 🧪 **Testing**: Add test cases and improve coverage
- 💻 **Code**: Implement features, fix bugs, optimize performance
- 🎨 **Design**: UI/UX improvements and accessibility enhancements
- 🌐 **Translations**: Internationalization support

### Getting Started

1. **Fork the Repository**
   ```bash
   # Fork on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/workforce-impact-dashboard.git
   cd workforce-impact-dashboard
   ```

2. **Set Up Development Environment**
   ```bash
   # Install dependencies
   npm install
   
   # Set up environment variables
   cp .env.example .env
   
   # Start development server
   npm run dev
   ```

3. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-description
   ```

## 📋 Development Guidelines

### Code Standards

#### TypeScript
- Use strict TypeScript configuration
- Provide explicit types for public APIs
- Avoid `any` types - use proper typing
- Use meaningful variable and function names

```typescript
// ✅ Good
interface JobRoleData {
  roleId: string;
  growthRate: number;
  confidence: number;
}

function calculateImpactScore(
  aiGrowthRate: number, 
  jobDemandChange: number
): number {
  return aiGrowthRate - jobDemandChange;
}

// ❌ Bad
function calc(a: any, b: any): any {
  return a - b;
}
```

#### React Components
- Use functional components with hooks
- Implement proper prop types
- Follow single responsibility principle
- Use meaningful component and prop names

```typescript
// ✅ Good
interface RoleExplorerProps {
  roles: JobRole[];
  selectedRole: string | null;
  onRoleSelect: (roleId: string) => void;
}

const RoleExplorer: React.FC<RoleExplorerProps> = ({
  roles,
  selectedRole,
  onRoleSelect
}) => {
  // Component implementation
};

// ❌ Bad
const Component = (props: any) => {
  // Implementation
};
```

#### CSS/Styling
- Use CSS modules or styled-components
- Follow BEM methodology for class names
- Implement responsive design patterns
- Ensure accessibility compliance

```css
/* ✅ Good */
.role-explorer {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.role-explorer__search {
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
}

.role-explorer__search:focus {
  outline: 2px solid var(--focus-color);
  outline-offset: 2px;
}

/* ❌ Bad */
.component {
  padding: 10px;
}

.input {
  border: 1px solid gray;
}
```

### Testing Requirements

#### Unit Tests
- Write tests for all new functions and components
- Aim for >90% code coverage
- Test both happy path and error scenarios
- Use descriptive test names

```typescript
// ✅ Good
describe('calculateImpactScore', () => {
  test('should return positive score when AI growth exceeds job demand', () => {
    const result = calculateImpactScore(50, 20);
    expect(result).toBe(30);
  });

  test('should return negative score when job demand exceeds AI growth', () => {
    const result = calculateImpactScore(20, 50);
    expect(result).toBe(-30);
  });

  test('should handle zero values correctly', () => {
    const result = calculateImpactScore(0, 0);
    expect(result).toBe(0);
  });
});
```

#### Property-Based Tests
- Add property tests for data processing functions
- Use fast-check for generating test data
- Verify universal properties across all inputs

```typescript
// Property-based test example
fc.assert(
  fc.property(
    fc.float({ min: -100, max: 200 }),
    fc.float({ min: -50, max: 100 }),
    (aiGrowth, jobDemand) => {
      const score = calculateImpactScore(aiGrowth, jobDemand);
      return typeof score === 'number' && !isNaN(score);
    }
  )
);
```

### Documentation Standards

#### Code Documentation
- Use JSDoc for public APIs
- Include examples in documentation
- Document complex algorithms and business logic

```typescript
/**
 * Calculates the impact score for a job role based on AI growth and job demand.
 * 
 * @param aiGrowthRate - The percentage growth rate of AI repositories
 * @param jobDemandChange - The percentage change in job postings
 * @returns The impact score (positive indicates disruption risk)
 * 
 * @example
 * ```typescript
 * const score = calculateImpactScore(50, 20);
 * console.log(score); // 30 (high disruption risk)
 * ```
 */
function calculateImpactScore(
  aiGrowthRate: number,
  jobDemandChange: number
): number {
  return aiGrowthRate - jobDemandChange;
}
```

#### README and Guides
- Keep documentation up-to-date
- Include code examples and screenshots
- Write for different skill levels
- Use clear, concise language

## 🐛 Bug Reports

### Before Submitting a Bug Report

1. **Check existing issues** to avoid duplicates
2. **Try the latest version** to see if the issue is already fixed
3. **Use demo mode** to isolate the issue from API problems
4. **Check browser console** for error messages

### Bug Report Template

```markdown
## Bug Description
A clear and concise description of the bug.

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior
What you expected to happen.

## Actual Behavior
What actually happened.

## Screenshots
If applicable, add screenshots to help explain the problem.

## Environment
- OS: [e.g., Windows 10, macOS 12.0]
- Browser: [e.g., Chrome 96, Firefox 95]
- Version: [e.g., 1.0.0]

## Additional Context
Any other context about the problem.
```

## 💡 Feature Requests

### Before Submitting a Feature Request

1. **Check existing issues** for similar requests
2. **Consider the scope** - does it fit the project goals?
3. **Think about implementation** - is it technically feasible?
4. **Consider alternatives** - are there existing solutions?

### Feature Request Template

```markdown
## Feature Description
A clear and concise description of the feature.

## Problem Statement
What problem does this feature solve?

## Proposed Solution
Describe your proposed solution.

## Alternatives Considered
Describe alternative solutions you've considered.

## Use Cases
Describe specific use cases for this feature.

## Implementation Notes
Any technical considerations or constraints.
```

## 🔄 Pull Request Process

### Before Submitting a Pull Request

1. **Create an issue** to discuss the change (for significant features)
2. **Fork the repository** and create a feature branch
3. **Write tests** for your changes
4. **Update documentation** as needed
5. **Run the test suite** to ensure nothing is broken
6. **Check code style** with ESLint and Prettier

### Pull Request Checklist

- [ ] **Branch**: Created from `main` with descriptive name
- [ ] **Tests**: Added/updated tests with good coverage
- [ ] **Documentation**: Updated relevant documentation
- [ ] **Code Style**: Follows project conventions
- [ ] **Commits**: Clear, descriptive commit messages
- [ ] **Description**: Detailed PR description with context

### Pull Request Template

```markdown
## Description
Brief description of the changes.

## Type of Change
- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Related Issues
Fixes #(issue number)

## Testing
- [ ] Unit tests pass
- [ ] Property-based tests pass
- [ ] Manual testing completed
- [ ] Cross-browser testing (if applicable)

## Screenshots
If applicable, add screenshots of the changes.

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Code is commented where necessary
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] All tests pass
```

### Review Process

1. **Automated Checks**: CI/CD pipeline runs tests and linting
2. **Code Review**: Maintainers review code quality and design
3. **Testing**: Manual testing of new features
4. **Approval**: At least one maintainer approval required
5. **Merge**: Squash and merge to main branch

## 🎨 Design Contributions

### UI/UX Guidelines

- **Accessibility First**: WCAG 2.1 AA compliance
- **Responsive Design**: Mobile-first approach
- **Consistent Design**: Follow existing design patterns
- **Performance**: Optimize for fast loading and smooth interactions

### Design Assets

- **Figma Files**: Available for major design changes
- **Icon Library**: Use consistent icon set
- **Color Palette**: Follow established brand colors
- **Typography**: Use defined font scales and weights

## 📚 Documentation Contributions

### Types of Documentation

- **User Guides**: Help users understand features
- **Developer Guides**: Technical implementation details
- **API Documentation**: Service and function references
- **Tutorials**: Step-by-step learning materials

### Documentation Standards

- **Clear Structure**: Use headings and sections logically
- **Code Examples**: Include working code snippets
- **Screenshots**: Visual aids for complex procedures
- **Links**: Reference related documentation and resources

## 🌐 Internationalization

### Adding Translations

1. **Create Language Files**: Add JSON files for new languages
2. **Translate Keys**: Provide translations for all text keys
3. **Test Layouts**: Ensure UI works with different text lengths
4. **Cultural Considerations**: Adapt for local conventions

### Translation Guidelines

- **Accuracy**: Maintain meaning and context
- **Consistency**: Use consistent terminology
- **Localization**: Adapt for cultural differences
- **Testing**: Verify translations in context

## 🏆 Recognition

### Contributors

We recognize contributors in several ways:

- **Contributors List**: GitHub contributors page
- **Release Notes**: Acknowledgment in release announcements
- **Hall of Fame**: Special recognition for significant contributions
- **Swag**: Stickers and merchandise for active contributors

### Contribution Types

- 🐛 **Bug Fixes**: Identifying and resolving issues
- ✨ **Features**: Implementing new functionality
- 📝 **Documentation**: Improving guides and references
- 🧪 **Testing**: Adding test coverage and quality assurance
- 🎨 **Design**: UI/UX improvements and accessibility
- 🌐 **Translation**: Internationalization support
- 🚀 **Performance**: Optimization and efficiency improvements

## 📞 Getting Help

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and community chat
- **Discord**: Real-time community support (link in README)
- **Email**: Direct contact for sensitive issues

### Mentorship

New contributors can get help from experienced maintainers:

- **Good First Issues**: Labeled issues suitable for beginners
- **Mentorship Program**: Pairing with experienced contributors
- **Code Review**: Detailed feedback on pull requests
- **Documentation**: Comprehensive guides and examples

## 📋 Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

Examples of behavior that contributes to creating a positive environment include:

- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

### Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be reported by contacting the project team. All complaints will be reviewed and investigated promptly and fairly.

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing! 🎉**

Your contributions help make the Workforce Impact Dashboard better for everyone. We appreciate your time and effort in improving this project.