import { loadSchema } from '@graphql-tools/load';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import { printSchemaWithDirectives } from '@graphql-tools/utils';
import { writeFile, mkdir } from 'fs/promises';
import { GraphQLSchema, validateSchema } from 'graphql';

const getTargetSchema = (schemaKey: string) => `./dist/${schemaKey}.graphql`;
const getSourceSchema = (schemaKey: string) => `./contract/${schemaKey}.graphql`;

async function setup() {
  await mkdir('./dist', { recursive: true });
}

async function loadSchemaFromFile(schemaPath: string) {
  return await loadSchema(schemaPath, {
    loaders: [new GraphQLFileLoader()]
  });
}

async function saveSchemaString(schemaKey: string, schema: GraphQLSchema) {
  const schemaString = printSchemaWithDirectives(schema, {
    assumeValid: false,
    commentDescriptions: true
  });
  await writeFile(getTargetSchema(schemaKey), schemaString);
}

async function buildSchema(schemaKey: string) {
  try {
    const schema = await loadSchemaFromFile(getSourceSchema(schemaKey));
    await saveSchemaString(schemaKey, schema);
  } catch (e) {
    console.log(`Error while building schema "${schemaKey}"`, e);
  }
}

async function validateGraphQL(schemaKey: string) {
  try {
    const schema = await loadSchemaFromFile(getTargetSchema(schemaKey));
    const errors = validateSchema(schema);
    if (errors.length > 0) {
      console.error(errors, errors[0].locations);
      process.exit(1);
    }
  } catch (e) {
    console.log(`Error while building schema "${schemaKey}"`, e);
  }
}

(async () => {
  try {
    await setup();
    await buildSchema('schema');
    await validateGraphQL('schema');
    console.log('Schema built successfuly!');
  } catch (e) {
    console.log(e);
  }
})().catch((e) => console.log(e));
