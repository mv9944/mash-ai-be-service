// jest.config.js
export default {
    testEnvironment: 'node',
    clearMocks: true,
    coverageDirectory: 'coverage',
    collectCoverageFrom: ['src/**/*.js', '!src/server.js', '!src/app.js', '!src/config/**'], // Exclude config from coverage for now

    // --- Key changes for ES Modules ---
    // 1. No Babel transform needed for modern Node.js ESM
    transform: {},

    // 2. Tell Jest which file extensions to treat as ESM.
    //    While .js is default with "type": "module", this can sometimes help.
    // extensionsToTreatAsEsm: ['.js'], // Usually not needed if "type": "module" is set and Node version is sufficient

    // 3. If specific node_modules are ESM and cause issues, you might need to adjust transformIgnorePatterns.
    //    For common libraries like supertest, this is usually not an issue with modern Jest.
    // transformIgnorePatterns: [
    //   '/node_modules/(?!(supertest|other-esm-module)/)',
    // ],

    // 4. Module Name Mapper (if you use aliases like @/ in your src)
    // moduleNameMapper: {
    //   '^@/(.*)$': '<rootDir>/src/$1',
    // },
    // --- End of ES Modules changes ---

    verbose: true,
};