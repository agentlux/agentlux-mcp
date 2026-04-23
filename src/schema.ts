import { z } from 'zod';

import type { JsonSchema, JsonSchemaProperty } from './types.js';

function hasDefault(property: JsonSchemaProperty): boolean {
  return Object.prototype.hasOwnProperty.call(property, 'default');
}

function withDescription<T extends z.ZodTypeAny>(
  schema: T,
  property: JsonSchemaProperty,
): T {
  return property.description ? schema.describe(property.description) : schema;
}

function toStringSchema(property: JsonSchemaProperty): z.ZodTypeAny {
  let schema: z.ZodTypeAny;

  if (property.enum?.length) {
    schema = z.enum(property.enum as [string, ...string[]]);
  } else {
    let stringSchema = z.string();
    if (typeof property.minLength === 'number') {
      stringSchema = stringSchema.min(property.minLength);
    }
    if (typeof property.maxLength === 'number') {
      stringSchema = stringSchema.max(property.maxLength);
    }
    schema = stringSchema;
  }

  return withDescription(schema, property);
}

function toNumberSchema(property: JsonSchemaProperty): z.ZodTypeAny {
  let schema = property.type === 'integer' ? z.number().int() : z.number();
  if (typeof property.minimum === 'number') {
    schema = schema.min(property.minimum);
  }
  if (typeof property.maximum === 'number') {
    schema = schema.max(property.maximum);
  }
  return withDescription(schema, property);
}

function toBooleanSchema(property: JsonSchemaProperty): z.ZodTypeAny {
  return withDescription(z.boolean(), property);
}

function toPropertySchema(property: JsonSchemaProperty): z.ZodTypeAny {
  let schema: z.ZodTypeAny;

  switch (property.type) {
    case 'string':
      schema = toStringSchema(property);
      break;
    case 'number':
    case 'integer':
      schema = toNumberSchema(property);
      break;
    case 'boolean':
      schema = toBooleanSchema(property);
      break;
    default:
      throw new Error(`Unsupported JSON schema property type: ${property.type}`);
  }

  if (hasDefault(property)) {
    return schema.default(property.default as never);
  }

  return schema;
}

export function jsonSchemaToZodObject(
  schema: JsonSchema,
): z.ZodObject<Record<string, z.ZodTypeAny>> {
  const required = new Set(schema.required ?? []);
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const [name, property] of Object.entries(schema.properties)) {
    let propertySchema = toPropertySchema(property);
    if (!required.has(name) && !hasDefault(property)) {
      propertySchema = propertySchema.optional();
    }
    shape[name] = propertySchema;
  }

  return z.object(shape);
}
