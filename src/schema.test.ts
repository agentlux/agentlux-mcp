import { describe, expect, it } from 'vitest';

import { jsonSchemaToZodObject } from './schema.js';

describe('jsonSchemaToZodObject', () => {
  it('preserves required fields, enums, and defaults', () => {
    const schema = jsonSchemaToZodObject({
      type: 'object',
      properties: {
        category: {
          type: 'string',
          description: 'Tool category',
          enum: ['hat', 'top'],
        },
        page: {
          type: 'number',
          description: 'Page number',
          minimum: 1,
          default: 1,
        },
        featured: {
          type: 'boolean',
          description: 'Whether to include featured only',
        },
      },
      required: ['category'],
    });

    expect(schema.parse({ category: 'hat' })).toEqual({
      category: 'hat',
      page: 1,
    });
    expect(schema.parse({ category: 'top', featured: true })).toEqual({
      category: 'top',
      page: 1,
      featured: true,
    });
    expect(() => schema.parse({})).toThrow();
  });
});
