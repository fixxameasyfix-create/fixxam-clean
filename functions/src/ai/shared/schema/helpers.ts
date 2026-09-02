import {
  Schema,
  SchemaType,
} from "./vertex";

export function string(
  description?: string,
): Schema {
  return {
    type: SchemaType.STRING,
    description,
  };
}

export function number(
  description?: string,
): Schema {
  return {
    type: SchemaType.NUMBER,
    description,
  };
}

export function integer(
  description?: string,
): Schema {
  return {
    type: SchemaType.INTEGER,
    description,
  };
}

export function boolean(
  description?: string,
): Schema {
  return {
    type: SchemaType.BOOLEAN,
    description,
  };
}

export function array(
  items: Schema,
  description?: string,
): Schema {
  return {
    type: SchemaType.ARRAY,
    description,
    items,
  };
}

export function object(
  properties: Record<string, Schema>,
  required: readonly string[] = [],
  description?: string,
): Schema {
  return {
    type: SchemaType.OBJECT,
    description,
    properties,
    required: [...required],
  };
}

export function enumString(
  values: readonly string[],
  description?: string,
): Schema {
  return {
    type: SchemaType.STRING,
    description,
    enum: [...values],
  };
}

export function nullable(
  schema: Schema,
): Schema {
  return {
    ...schema,
    nullable: true,
  };
}