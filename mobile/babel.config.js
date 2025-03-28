module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Enable module resolver for path aliases
      ['module-resolver', {
        root: ['.'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@': './src',
          '@components': './src/components',
          '@screens': './src/screens',
          '@hooks': './src/hooks',
          '@utils': './src/utils',
          '@api': './src/api',
          '@navigation': './src/navigation',
          '@assets': './assets',
        },
      }],
      // Add any other plugins here
    ],
  };
};