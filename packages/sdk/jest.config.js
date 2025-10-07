module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testRegex: '/__tests__/.*\\.test\\.[j|t]s$',
    collectCoverageFrom: ['src/**/{!(hooks|manifest),}.ts'],
    collectCoverage: true,
    coveragePathIgnorePatterns: ['node_modules', '.module.ts', '.mock.ts'],
    transform: {
      '\\.[jt]s$': 'ts-jest',
      '\\.[jt]sx$': 'ts-jest',
    },
  };
