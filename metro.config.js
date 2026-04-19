const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// 👇 Esta é a linha mágica que ensina o Expo a ler os arquivos de migração do banco!
config.resolver.sourceExts.push("sql");

module.exports = config;
