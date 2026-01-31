import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: './dist/schema.graphql',
  hooks: {
    afterOneFileWrite: ['eslint --fix', 'prettier --write'],
  },
  generates: {
    'apps/server/src/app/_generated/graphql.ts': {
      plugins: [
        'typescript',
        {
          'typescript-resolvers': {
            avoidOptionals: false,
          },
        },
        {
          add: {
            content: [
              '/* eslint @typescript-eslint/no-unused-vars: "off"*/',
              '/* eslint-disable @typescript-eslint/no-explicit-any */',
              '/* eslint-disable @typescript-eslint/ban-types */',
            ].join('\n'),
          },
        },
      ],
      config: {
        scalars: {
          DateTime: 'Date',
          Url: 'string',
          HumanId: 'string',
          Email: 'string',
          ID: 'mongodb#ObjectId',
        },
        enumsAsTypes: true,
        useIndexSignature: true,
        contextType: '../apollo/apollo-context#ApolloContext',
      },
    },
    'apps/client/src/app/_generated/graphql.tsx': {
      documents: 'apps/client/graphql/**/*.graphql',
      plugins: [
        'typescript',
        'typescript-operations',
        {
          'typescript-react-apollo': {
            withHooks: false,
            withComponent: false,
            withHOC: false,
            withMutationFn: false,
            withResultType: false,
            withMutationOptionsType: false,
          },
        },
        {
          add: {
            content: [
              '/* eslint-disable @typescript-eslint/no-explicit-any */',
              '/* eslint-disable @typescript-eslint/ban-types */',
              '/* eslint-disable @typescript-eslint/explicit-module-boundary-types */',
            ].join('\n'),
          },
        },
      ],
      config: {
        scalars: {
          DateTime: 'string',
          Url: 'string',
          HumanId: 'string',
          Email: 'string',
          ID: 'string',
        },
        enumsAsTypes: true,
        avoidOptionals: false,
      },
    },
    './graphql.schema.json': {
      plugins: ['introspection'],
    },
  },
};

export default config;
