const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const {
  wrapWithReanimatedMetroConfig,
} = require('react-native-reanimated/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const baseConfig = getDefaultConfig(__dirname);
const mergedConfig = mergeConfig(baseConfig, {
  // You can add your custom config options here
});

module.exports = wrapWithReanimatedMetroConfig(mergedConfig);
