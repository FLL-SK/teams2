import type { CodegenConfig } from '@graphql-codegen/cli';

const clientScalars = {
  DateTime: 'string',
  Url: 'string',
  HumanId: 'string',
  Email: 'string',
  ID: 'string',
  ErrorCode: 'string',
};

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
    // typy celej schémy (objektové typy ako Registration, Address, … používa klient priamo)
    'apps/client/src/app/_generated/schema.ts': {
      plugins: ['typescript'],
      config: {
        scalars: clientScalars,
        enumsAsTypes: true,
        avoidOptionals: false,
      },
    },
    'apps/client/src/app/_generated/graphql.tsx': {
      documents: 'apps/client/graphql/**/*.graphql',
      plugins: [
        // typescript-operations (od v6) generuje aj vstupné typy a enumy použité v operáciách,
        // ostatné typy schémy sa preexportujú zo schema.ts (lokálne deklarácie majú prednosť)
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
              "export * from './schema';",
            ].join('\n'),
          },
        },
      ],
      config: {
        scalars: clientScalars,
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
