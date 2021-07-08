const path = require("path")
const {alias} = require('../build-utils/alias');

module.exports = {
  "stories": [
    '../app/static/js/shared-styles/**/*.stories.js',
    '../app/static/js/components/**/*.stories.js'
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials"
  ],
  "webpackFinal": async (config) => {
    config.resolve.alias = {
      // extend aliases with our own
      ...config.resolve?.alias,
      ...alias}
    return config
  }
}