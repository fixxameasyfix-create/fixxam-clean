import { Schema } from "./vertex";

export class SchemaBuilder {
  private readonly schema: Schema;

  constructor(schema: Schema) {
    this.schema = schema;
  }

  build(): Schema {
    return this.schema;
  }

  static create(
    schema: Schema,
  ): SchemaBuilder {
    return new SchemaBuilder(
      schema,
    );
  }
}