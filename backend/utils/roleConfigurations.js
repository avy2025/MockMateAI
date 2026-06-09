/**
 * Role Definitions for MockMate AI
 */
const SUPPORTED_ROLES = [
  {
    id: 'frontend-developer',
    name: 'Frontend Developer',
    description: 'Expertise in building user interfaces, React, and modern web standards.',
    focusAreas: ['React', 'JavaScript', 'State Management', 'Accessibility', 'CSS/Styling', 'Web Performance'],
    evaluationCriteria: [
      'React knowledge & patterns',
      'JavaScript fundamentals',
      'UI architecture & component design',
      'Responsiveness & Accessibility'
    ]
  },
  {
    id: 'backend-developer',
    name: 'Backend Developer',
    description: 'Server-side logic, APIs, databases, and system scalability.',
    focusAreas: ['APIs (REST/GraphQL)', 'Databases (SQL/NoSQL)', 'Authentication/Security', 'Scalability', 'Microservices', 'Node.js/Python/Java'],
    evaluationCriteria: [
      'API design principles',
      'Database schema & optimization',
      'Security awareness',
      'System design & scalability'
    ]
  },
  {
    id: 'full-stack-developer',
    name: 'Full Stack Developer',
    description: 'End-to-end development covering both client and server side.',
    focusAreas: ['React/Frontend', 'Node.js/Backend', 'Database integration', 'System Architecture', 'DevOps basics'],
    evaluationCriteria: [
      'Full-stack architecture understanding',
      'Integration between layers',
      'Proficiency in both FE & BE',
      'Problem solving across the stack'
    ]
  },
  {
    id: 'data-analyst',
    name: 'Data Analyst',
    description: 'Data interpretation, SQL, and business intelligence.',
    focusAreas: ['SQL', 'Data Visualization (Power BI/Tableau)', 'Statistics', 'Data Cleaning', 'Business Requirements'],
    evaluationCriteria: [
      'SQL proficiency',
      'Analytical thinking',
      'Data storytelling',
      'Attention to detail'
    ]
  },
  {
    id: 'data-scientist',
    name: 'Data Scientist',
    description: 'Machine learning, advanced statistics, and predictive modeling.',
    focusAreas: ['Machine Learning', 'Python/R', 'Mathematics/Stats', 'Data Engineering', 'Model Deployment'],
    evaluationCriteria: [
      'ML fundamentals & algorithms',
      'Statistical rigor',
      'Python/Data library proficiency',
      'Research approach'
    ]
  },
  {
    id: 'product-manager',
    name: 'Product Manager',
    description: 'Product strategy, prioritization, and user-centric design.',
    focusAreas: ['Prioritization', 'Product Metrics', 'User Empathy', 'Stakeholder Management', 'Strategy'],
    evaluationCriteria: [
      'Product thinking',
      'Communication & leadership',
      'Data-driven decision making',
      'Execution ability'
    ]
  },
  {
    id: 'ui-ux-designer',
    name: 'UI/UX Designer',
    description: 'User experience design, prototyping, and visual aesthetics.',
    focusAreas: ['User Research', 'Wireframing', 'Prototyping', 'Design Systems', 'Visual Design'],
    evaluationCriteria: [
      'Design process',
      'User-centric approach',
      'Tool proficiency (Figma)',
      'Visual hierarchy'
    ]
  },
  {
    id: 'devops-engineer',
    name: 'DevOps Engineer',
    description: 'Infrastructure, CI/CD, and cloud automation.',
    focusAreas: ['CI/CD Pipelines', 'Cloud (AWS/Azure/GCP)', 'Docker/Kubernetes', 'Infrastructure as Code', 'Monitoring'],
    evaluationCriteria: [
      'Automation mindset',
      'Infrastructure knowledge',
      'Problem solving under pressure',
      'Security in DevOps'
    ]
  },
  {
    id: 'qa-engineer',
    name: 'QA Engineer',
    description: 'Quality assurance, automation testing, and bug tracking.',
    focusAreas: ['Automation Testing', 'Manual Testing', 'Bug Reporting', 'Test Planning', 'Selenium/Cypress'],
    evaluationCriteria: [
      'Quality mindset',
      'Testing strategy',
      'Detail orientation',
      'Automation script efficiency'
    ]
  }
];

module.exports = {
  SUPPORTED_ROLES
};
