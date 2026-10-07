const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  buffer: require.resolve('buffer/'),
  valibot: path.resolve(__dirname, 'node_modules/valibot/dist/index.cjs'),
};

const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'valibot') {
    return {
      filePath: path.resolve(__dirname, 'node_modules/valibot/dist/index.cjs'),
      type: 'sourceFile',
    };
  }
  if (moduleName === 'bip32') {
    return {
      filePath: path.resolve(__dirname, 'node_modules/bip32/src/cjs/index.cjs'),
      type: 'sourceFile',
    };
  }
  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;