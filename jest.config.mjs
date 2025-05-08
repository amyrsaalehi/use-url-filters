export default {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|tsx)$': ['babel-jest', { configFile: './babel.config.cjs' }]
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  testMatch: ['**/tests/**/*.test.(ts|tsx)'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts'
  ],
  coverageDirectory: 'coverage',
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  moduleNameMapper: {
    // Handle CSS imports (if you use CSS in your React components)
    '\\.css$': 'identity-obj-proxy'
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  // For ES modules support
  transformIgnorePatterns: [
    '/node_modules/(?!.*\\.mjs$)'
  ]
}
