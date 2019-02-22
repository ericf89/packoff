module.exports = {
  presets: [
    [
      '@babel/env',
      {
        targets: {
          browsers: 'defaults',
          node: 'current',
        },
      },
    ],
  ],
  plugins: [
    ['@babel/plugin-proposal-optional-chaining', { loose: false }],
    '@babel/plugin-proposal-numeric-separator',
    '@babel/plugin-proposal-object-rest-spread',
  ],
  env: {
    production: {
      presets: [
        'minify',
        [
          '@babel/env',
          {
            forceAllTransforms: true,
            modules: 'commonjs',
            targets: {
              browsers: 'defaults',
              node: 'current',
            },
          },
        ],
      ],
    },
  },
};
