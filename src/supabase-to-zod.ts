import { generate } from 'ts-to-zod';

import fs from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import prettier from 'prettier';

import { z } from 'zod';
import {
  transformTypes,
  getImportPath,
  transformTypesOptionsSchema,
} from './lib';
import { pascalCase } from 'change-case';

const simplifiedJSDocTagSchema = z.object({
  name: z.string(),
  value: z.string().optional(),
});

const getSchemaNameSchema = z.function().args(z.string()).returns(z.string());

const nameFilterSchema = z.function().args(z.string()).returns(z.boolean());

const jSDocTagFilterSchema = z
  .function()
  .args(z.array(simplifiedJSDocTagSchema))
  .returns(z.boolean());

export const supabaseToZodOptionsSchema = transformTypesOptionsSchema
  .omit({ sourceText: true })
  .extend({
    input: z.string(),
    output: z.string(),
    skipValidation: z.boolean().optional(),
    maxRun: z.number().optional(),
    nameFilter: nameFilterSchema.optional(),
    jsDocTagFilter: jSDocTagFilterSchema.optional(),
    getSchemaName: getSchemaNameSchema.optional(),
    keepComments: z.boolean().optional().default(false),
    skipParseJSDoc: z.boolean().optional().default(false),
  });

export type SupabaseToZodOptions = z.infer<typeof supabaseToZodOptionsSchema>;

export default async function supabaseToZod(opts: SupabaseToZodOptions) {
  const inputPath = join(process.cwd(), opts.input);
  const outputPath = join(process.cwd(), opts.output);

  const sourceText = await fs.readFile(inputPath, 'utf-8');

  const parsedTypes = transformTypes({ sourceText, ...opts });

  const { getZodSchemasFile, errors } = generate({
    getSchemaName: (name) => `${pascalCase(name)}Schema`,
    sourceText: parsedTypes,
    ...opts,
  });

  if (errors.length > 0) {
    console.error(errors);
  }

  const zodSchemasFile = getZodSchemasFile(
    getImportPath(outputPath, inputPath),
  );

  const organizedSchemas = organizeSchemas(
    zodSchemasFile,
    inputPath,
    outputPath,
  );
  const prettierConfig = await prettier.resolveConfig(process.cwd());

  await fs.writeFile(
    outputPath,
    await prettier.format(organizedSchemas, {
      parser: 'babel-ts',
      ...prettierConfig,
    }),
  );
}

function organizeSchemas(
  zodSchemasFile: string,
  inputPath: string,
  outputPath: string,
): string {
  const lines = zodSchemasFile.split('\n');
  const schemas: Record<string, string[]> = {};
  const schemaDefinitions: string[] = [];
  const types: string[] = [];

  let currentEntity = '';
  let currentSchemaDefinition = '';
  let jsonSchemaDefinition = '';

  for (const line of lines) {
    if (line.startsWith('export const') && line.includes('Schema')) {
      if (currentSchemaDefinition) {
        schemaDefinitions.push(currentSchemaDefinition);
        currentSchemaDefinition = '';
      }

      const match = line.match(/export const (\w+)Schema/);
      if (match) {
        const [, name] = match;
        if (name === 'Json') {
          jsonSchemaDefinition = line;
          continue;
        }
        currentEntity = name.replace(/(Row|Insert|Update)$/, '');
        if (!schemas[currentEntity]) {
          schemas[currentEntity] = [];
        }
        schemas[currentEntity].push(name);
      }
      currentSchemaDefinition = line;
    } else if (currentSchemaDefinition) {
      currentSchemaDefinition += '\n' + line;
    }
  }

  // Add the last schema definition if there is one
  if (currentSchemaDefinition) {
    schemaDefinitions.push(currentSchemaDefinition);
  }

  const relativeInputPath = relative(dirname(outputPath), dirname(inputPath));
  const typesImportPath = join(relativeInputPath, 'types').replace(/\\/g, '/');

  let output = 'import { z } from "zod";\n';
  output += `import type { Json } from "./${typesImportPath}";\n\n`;

  // Add Json schema definition
  output += jsonSchemaDefinition + '\n\n';

  // Add schema definitions
  output += schemaDefinitions.join('\n\n') + '\n\n';

  // Add inferred types
  for (const [entity, schemaNames] of Object.entries(schemas)) {
    for (const schemaName of schemaNames) {
      types.push(
        `export type ${schemaName} = z.infer<typeof ${schemaName}Schema>;`,
      );
    }
  }

  output += types.join('\n') + '\n\n';

  // Generate entity objects
  for (const [entity, schemaNames] of Object.entries(schemas)) {
    if (!schemaNames.length) continue;

    // Skip case where there is only one schema
    if (schemaNames.length === 1) {
      continue;
    }

    output += `export type ${entity} = {\n`;
    for (const schemaName of schemaNames) {
      const shortName = schemaName.replace(entity, '');
      output += `  ${shortName}: ${schemaName},\n`;
    }
    output += '};\n\n';
    output += `export const ${entity}Schema = {\n`;
    for (const schemaName of schemaNames) {
      const shortName = schemaName.replace(entity, '');
      output += `  ${shortName}: ${schemaName}Schema,\n`;
    }
    output += '};\n\n';
  }

  return output;
}
