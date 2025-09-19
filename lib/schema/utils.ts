import { z, ZodTypeAny } from 'zod';

// Supported types: string, number, boolean, array, object
export function generateSchema(schemaObj: any): ZodTypeAny {
  if (schemaObj.type === 'string')
    return schemaObj.optional ? z.string().optional() : z.string();
  if (schemaObj.type === 'number')
    return schemaObj.optional ? z.number().optional() : z.number();
  if (schemaObj.type === 'boolean')
    return schemaObj.optional ? z.boolean().optional() : z.boolean();
  if (schemaObj.type === 'array')
    return schemaObj.optional
      ? z.array(generateSchema(schemaObj.items)).optional()
      : z.array(generateSchema(schemaObj.items));
  if (schemaObj.type === 'object') {
    const shape: Record<string, ZodTypeAny> = {};
    for (const key in schemaObj.properties) {
      shape[key] = generateSchema(schemaObj.properties[key]);
    }
    return schemaObj.optional ? z.object(shape).optional() : z.object(shape);
  }
  // Fallback: allow any
  return schemaObj.optional ? z.any().optional() : z.any();
}

/**
 * Dynamically merge any composable object schemas for requested types.
 * @param types Array of type names (e.g., ['homicide', 'robbery'])
 * @param schemaMap Object mapping type names to schema objects (e.g., imported templates)
 */
export function getMergedObjectSchema(
  types: string[],
  schemaMap: Record<string, any>,
): ZodTypeAny {
  let merged: ZodTypeAny = z.object({});
  for (const type of types) {
    if (schemaMap[type]) {
      const candidate = generateSchema(schemaMap[type]);
      // Only merge if candidate is a ZodObject
      if (candidate instanceof z.ZodObject) {
        merged = (merged as z.ZodObject<any>).merge(candidate);
      }
    }
  }
  return merged;
}

/**
 * Validate only the top-level schemaObj for required fields and structure.
 * Throws an error if invalid. Does NOT recurse.
 */
export function validateSchemaObj(schemaObj: any, path: string = ''): void {
  if (typeof schemaObj !== 'object' || schemaObj === null) {
    throw new Error(`Schema at ${path || 'root'} is not an object.`);
  }
  if (!('type' in schemaObj)) {
    throw new Error(`Missing 'type' at ${path || 'root'}`);
  }
  if (!('optional' in schemaObj)) {
    throw new Error(`Missing 'optional' at ${path || 'root'}`);
  }
  // For arrays, must have items
  if (schemaObj.type === 'array' && !('items' in schemaObj)) {
    throw new Error(`Array schema at ${path || 'root'} missing 'items'.`);
  }
  // For objects, must have properties
  if (schemaObj.type === 'object' && !('properties' in schemaObj)) {
    throw new Error(`Object schema at ${path || 'root'} missing 'properties'.`);
  }
}
