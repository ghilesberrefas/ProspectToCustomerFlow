module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    setupFiles: ['<rootDir>/jest.setup.js'],
    collectCoverage: true,
    coverageReporters: ["lcov", "text"],
  };
  

