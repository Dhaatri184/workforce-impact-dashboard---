import { JobRole, JobCategory } from '../types';

// Predefined job roles for the dashboard
export const JOB_ROLES: JobRole[] = [
  // Software Development
  {
    id: 'software-developer',
    name: 'Software Developer',
    category: 'software-development',
    description: 'Designs, develops, and maintains software applications and systems',
    aliases: ['programmer', 'software engineer', 'developer', 'coder']
  },
  {
    id: 'frontend-developer',
    name: 'Frontend Developer',
    category: 'software-development',
    description: 'Specializes in user interface and user experience development',
    aliases: ['ui developer', 'web developer', 'react developer', 'vue developer']
  },
  {
    id: 'backend-developer',
    name: 'Backend Developer',
    category: 'software-development',
    description: 'Focuses on server-side logic, databases, and system architecture',
    aliases: ['server developer', 'api developer', 'backend engineer']
  },
  {
    id: 'fullstack-developer',
    name: 'Full Stack Developer',
    category: 'software-development',
    description: 'Works on both frontend and backend development',
    aliases: ['full-stack engineer', 'fullstack engineer', 'web developer']
  },

  // AI/ML
  {
    id: 'ai-engineer',
    name: 'AI Engineer',
    category: 'ai-ml',
    description: 'Develops and implements artificial intelligence and machine learning solutions',
    aliases: ['machine learning engineer', 'ml engineer', 'ai developer', 'ai specialist']
  },
  {
    id: 'data-scientist',
    name: 'Data Scientist',
    category: 'data-science',
    description: 'Analyzes complex data to extract insights and build predictive models',
    aliases: ['data analyst', 'research scientist', 'analytics specialist']
  },
  {
    id: 'ml-researcher',
    name: 'ML Researcher',
    category: 'ai-ml',
    description: 'Conducts research in machine learning algorithms and methodologies',
    aliases: ['research scientist', 'ai researcher', 'machine learning researcher']
  },

  // Data Science
  {
    id: 'data-analyst',
    name: 'Data Analyst',
    category: 'data-science',
    description: 'Interprets data and creates reports to support business decisions',
    aliases: ['business analyst', 'analytics specialist', 'data specialist']
  },
  {
    id: 'data-engineer',
    name: 'Data Engineer',
    category: 'data-science',
    description: 'Builds and maintains data pipelines and infrastructure',
    aliases: ['big data engineer', 'etl developer', 'data pipeline engineer']
  },

  // DevOps
  {
    id: 'devops-engineer',
    name: 'DevOps Engineer',
    category: 'devops',
    description: 'Manages deployment pipelines, infrastructure, and system reliability',
    aliases: ['site reliability engineer', 'platform engineer', 'cloud engineer']
  },
  {
    id: 'cloud-architect',
    name: 'Cloud Architect',
    category: 'devops',
    description: 'Designs and oversees cloud infrastructure and migration strategies',
    aliases: ['solutions architect', 'infrastructure architect', 'aws architect']
  },

  // Testing
  {
    id: 'manual-tester',
    name: 'Manual Tester',
    category: 'testing',
    description: 'Performs manual testing of software applications and systems',
    aliases: ['qa tester', 'quality assurance', 'software tester', 'test analyst']
  },
  {
    id: 'automation-engineer',
    name: 'Automation Engineer',
    category: 'testing',
    description: 'Develops and maintains automated testing frameworks and scripts',
    aliases: ['test automation engineer', 'qa automation', 'sdet']
  },

  // Design
  {
    id: 'ux-designer',
    name: 'UX Designer',
    category: 'design',
    description: 'Designs user experiences and interfaces for digital products',
    aliases: ['user experience designer', 'product designer', 'interaction designer']
  },
  {
    id: 'ui-designer',
    name: 'UI Designer',
    category: 'design',
    description: 'Creates visual designs and user interfaces for applications',
    aliases: ['visual designer', 'interface designer', 'graphic designer']
  },

  // Management
  {
    id: 'product-manager',
    name: 'Product Manager',
    category: 'management',
    description: 'Manages product strategy, roadmap, and feature development',
    aliases: ['product owner', 'pm', 'product lead']
  },
  {
    id: 'engineering-manager',
    name: 'Engineering Manager',
    category: 'management',
    description: 'Leads engineering teams and manages technical projects',
    aliases: ['tech lead', 'development manager', 'team lead']
  },

  // Support
  {
    id: 'support-engineer',
    name: 'Support Engineer',
    category: 'support',
    description: 'Provides technical support and troubleshooting for software products',
    aliases: ['technical support', 'customer support', 'help desk', 'support specialist']
  },
  {
    id: 'technical-writer',
    name: 'Technical Writer',
    category: 'support',
    description: 'Creates documentation, guides, and technical content',
    aliases: ['documentation specialist', 'content writer', 'docs writer']
  }
];

// Job category metadata
export const JOB_CATEGORIES: Record<JobCategory, { name: string; description: string; color: string }> = {
  'software-development': {
    name: 'Software Development',
    description: 'Roles focused on building and maintaining software applications',
    color: '#3B82F6' // Blue
  },
  'ai-ml': {
    name: 'AI & Machine Learning',
    description: 'Roles working with artificial intelligence and machine learning technologies',
    color: '#8B5CF6' // Purple
  },
  'data-science': {
    name: 'Data Science',
    description: 'Roles focused on data analysis, processing, and insights',
    color: '#10B981' // Green
  },
  'devops': {
    name: 'DevOps & Infrastructure',
    description: 'Roles managing deployment, infrastructure, and system operations',
    color: '#F59E0B' // Orange
  },
  'testing': {
    name: 'Quality Assurance',
    description: 'Roles ensuring software quality through testing and validation',
    color: '#EF4444' // Red
  },
  'design': {
    name: 'Design & UX',
    description: 'Roles focused on user experience and visual design',
    color: '#EC4899' // Pink
  },
  'management': {
    name: 'Management & Leadership',
    description: 'Roles leading teams and managing product development',
    color: '#6366F1' // Indigo
  },
  'support': {
    name: 'Support & Documentation',
    description: 'Roles providing technical support and creating documentation',
    color: '#84CC16' // Lime
  }
};

// Risk level configurations
export const RISK_LEVELS = {
  high: {
    label: 'High Disruption Risk',
    emoji: '🔴',
    color: '#DC2626',
    description: 'Roles at high risk of automation or significant change'
  },
  medium: {
    label: 'Transition Role',
    emoji: '🟡',
    color: '#D97706',
    description: 'Roles undergoing transformation but with adaptation opportunities'
  },
  low: {
    label: 'Growth Opportunity',
    emoji: '🟢',
    color: '#059669',
    description: 'Roles with strong growth potential and low automation risk'
  }
} as const;

// Classification configurations
export const CLASSIFICATIONS = {
  disruption: {
    label: 'Disruption',
    description: 'High AI impact with declining job demand',
    color: '#DC2626'
  },
  transition: {
    label: 'Transition',
    description: 'Moderate changes requiring skill adaptation',
    color: '#D97706'
  },
  growth: {
    label: 'Growth',
    description: 'Expanding opportunities with AI complementarity',
    color: '#059669'
  }
} as const;

// Time range presets
export const TIME_RANGES = {
  '1year': {
    label: '1 Year',
    months: 12,
    granularity: 'month' as const
  },
  '2years': {
    label: '2 Years',
    months: 24,
    granularity: 'month' as const
  },
  '3years': {
    label: '3 Years',
    months: 36,
    granularity: 'quarter' as const
  },
  '5years': {
    label: '5 Years',
    months: 60,
    granularity: 'quarter' as const
  }
} as const;

// API configuration
export const API_CONFIG = {
  github: {
    baseUrl: 'https://api.github.com',
    rateLimit: 5000, // requests per hour
    searchEndpoint: '/search/repositories',
    aiKeywords: [
      'artificial-intelligence',
      'machine-learning',
      'deep-learning',
      'neural-network',
      'ai',
      'ml',
      'tensorflow',
      'pytorch',
      'openai',
      'gpt',
      'llm',
      'generative-ai',
      'computer-vision',
      'nlp',
      'natural-language-processing'
    ]
  },
  cache: {
    defaultTTL: 3600000, // 1 hour in milliseconds
    maxSize: 100, // maximum number of cached entries
    aiDataTTL: 1800000, // 30 minutes for AI data
    jobDataTTL: 3600000 // 1 hour for job data
  },
  retry: {
    maxAttempts: 3,
    baseDelay: 1000, // 1 second
    maxDelay: 10000 // 10 seconds
  }
} as const;

// Chart configuration
export const CHART_CONFIG = {
  colors: {
    primary: '#3B82F6',
    secondary: '#8B5CF6',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#06B6D4'
  },
  animation: {
    duration: 750,
    easing: 'ease-in-out'
  },
  responsive: {
    breakpoints: {
      mobile: 768,
      tablet: 1024,
      desktop: 1280
    }
  }
} as const;

// Default values
export const DEFAULTS = {
  timeRange: [new Date('2022-01-01'), new Date()] as [Date, Date],
  selectedRole: 'software-developer',
  granularity: 'month' as const,
  minConfidence: 0.5,
  cacheEnabled: true,
  refreshInterval: 300000 // 5 minutes
} as const;