module.exports = {
  preset: 'react-native',
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|react-redux|@reduxjs|immer)/)',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
