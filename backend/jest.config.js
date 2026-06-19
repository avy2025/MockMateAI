module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  clearMocks: true,
  collectCoverageFrom: [
    'controllers/**/*.js',
    'routes/**/*.js',
    'middleware/**/*.js',
    'services/**/*.js',
    'models/**/*.js'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'html']
};
