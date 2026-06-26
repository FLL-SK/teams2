const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { NxReactWebpackPlugin } = require('@nx/react/webpack-plugin');
const { useLegacyNxPlugin } = require('@nx/webpack');

// These options were migrated by @nx/webpack:convert-to-inferred from
// the project.json file and merged with the options in this file
const configValues = {
  build: {
    default: {
      compiler: 'babel',
      outputPath: '../../dist/apps/client',
      index: './src/index.html',
      baseHref: '/',
      main: './src/main.tsx',
      tsConfig: './tsconfig.app.json',
      assets: ['./src/favicon.ico', './src/assets'],
    },
    development: {
      extractLicenses: false,
      optimization: false,
      sourceMap: true,
      vendorChunk: true,
    },
    production: {
      fileReplacements: [
        {
          replace: './src/environments/environment.ts',
          with: './src/environments/environment.prod.ts',
        },
      ],
      optimization: true,
      outputHashing: 'all',
      sourceMap: false,
      namedChunks: false,
      extractLicenses: true,
      vendorChunk: false,
    },
  },
  serve: {
    default: {
      port: 4200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      historyApiFallback: {
        index: '/index.html',
        disableDotRule: true,
        htmlAcceptHeaders: ['text/html', 'application/xhtml+xml'],
      },
    },
    development: {},
    production: {},
  },
};

// Determine the correct configValue to use based on the configuration
const configuration = process.env.NX_TASK_TARGET_CONFIGURATION || 'default';

const buildOptions = {
  ...configValues.build.default,
  ...configValues.build[configuration],
};
const devServerOptions = {
  ...configValues.serve.default,
  ...configValues.serve[configuration],
};

/**
 * @type{import('webpack').WebpackOptionsNormalized}
 */
module.exports = async () => ({
  devServer: devServerOptions,
  plugins: [
    new NxAppWebpackPlugin(buildOptions),
    new NxReactWebpackPlugin({
      // Uncomment this line if you don't want to use SVGR
      // See: https://react-svgr.com/
      // svgr: false
    }),
    // NOTE: useLegacyNxPlugin ensures that the non-standard Webpack configuration file previously used still works.
    // To remove its usage, move options such as "plugins" into this file as standard Webpack configuration options.
    // To enhance configurations after Nx plugins have applied, you can add a new plugin with the \`apply\` method.
    // e.g. \`{ apply: (compiler) => { /* modify compiler.options */ }\`
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await useLegacyNxPlugin(require('./webpack.config.old.js'), buildOptions),
  ],
});
