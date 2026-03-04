# Amplify V2 Data Guidelines

When using AWS Amplify V2 and generating data schema, always follow these guidelines.

## Use `selectionSet` to fetch related data

When making any call to CRUDL + observeQuery APIs, you can pass `selectionSet` to get related schema data.

When passing the `selectionSet` parameter, you must always define a type with `SelectionSet` so it can correctly infer the type for the fields.

```ts
// src/model/foo.ts
import { type SelectionSet } from "aws-amplify/data";
import { type Schema } from "../../amplify/data/resource";

export type Foo = Schema["Foo"]["type"];
export type FooIdentifier = Schema["Foo"]["identifier"];

// Use selectionSet to define which fields to load.
const fooWithBarBazSelectionSet = [
  "id",
  "name",
  "bar.id",
  "bar.name",
  "baz.*",
] as const;
export type FooWithBarBaz = SelectionSet<Foo, typeof fooWithBarBazSelectionSet>;
```

```ts
import { generateClient } from "aws-amplify/data";
import { type Schema } from "../../amplify/data/resource";
import { type FooIdentifier, type FooWithBarBaz } from "@/model/foo";

const client = generateClient<Schema>();

// Use selectionSet to define which fields to load.
const selectionSet = ["id", "name", "bar.id", "bar.name", "baz.*"] as const;

/**
 * Gets foo with bar and baz
 */
const getFooWithBarBaz = async (
  identifier: FooIdentifier,
): Promise<FooWithBarBaz | null> => {
  // Passing selectionSet to be able to get different set of fields
  const result = await client.models.Foo.get(identifier, { selectionSet });

  return result.data;
};
```

## Always infer the TypeScript types from the generated schemas

Never create interfaces or types that can be inferred from the schema. Use model files to re-export schema-inferred types, then import from those model files.

### Use model files to re-export schema-inferred types

Create model files in `src/model/` to centralize type exports. These files must only re-export types inferred from the schema, never define custom interfaces.

Correct way:

```ts
// src/model/foo.ts
import { type SelectionSet } from "aws-amplify/data";
import { type Schema } from "../../amplify/data/resource";

export type Foo = Schema["Foo"]["type"];
export type FooIdentifier = Schema["Foo"]["identifier"];
export type FooCreateInput = Schema["Foo"]["createType"];
export type FooUpdateInput = Schema["Foo"]["updateType"];
export type FooDeleteInput = Schema["Foo"]["deleteType"];

// Use selectionSet to define which fields to load.
const fooWithBarBazSelectionSet = [
  "id",
  "name",
  "bar.id",
  "bar.name",
  "baz.*",
] as const;
export type FooWithBarBaz = SelectionSet<Foo, typeof fooWithBarBazSelectionSet>;
```

Wrong way:

```ts
// src/model/foo.ts

// ❌ Do not create custom interfaces
export type FooFormInput = {
  name: string;
  description?: string | null;
};
```

### Always use `createType` type for inputs to create

When creating a new item, always use the `createType` for the input type.

Correct way:

```ts
import { generateClient } from "aws-amplify/data";
import { type Schema } from "../../amplify/data/resource";
import { type Foo, type FooCreateInput } from "@/model/foo";

const client = generateClient<Schema>();

/**
 * Creates foo
 */
const createFoo = async (fooInput: FooCreateInput): Promise<Foo> => {
  const result = await client.models.Foo.create(fooInput);

  return result.data;
};
```

### Always use the `identifier` type for getting an item by id

When getting an item by id, always use the `identifier` type to define the parameters to get the item.

Correct way:

```ts
import { generateClient } from "aws-amplify/data";
import { type Schema } from "../../amplify/data/resource";
import { type Foo, type FooIdentifier } from "@/model/foo";

const client = generateClient<Schema>();

/**
 * Gets foo
 */
const getFoo = async (identifier: FooIdentifier): Promise<Foo | null> => {
  const result = await client.models.Foo.get(identifier);

  return result.data;
};
```

### Always use the `updateType` type for the parameters to update an item

When updating an item, always use the `updateType` to define the parameters to update the item.

Correct way:

```ts
import { generateClient } from "aws-amplify/data";
import { type Schema } from "../../amplify/data/resource";
import { type Foo, type FooUpdateInput } from "@/model/foo";

const client = generateClient<Schema>();

/**
 * Updates foo
 */
const updateFoo = async (fooInput: FooUpdateInput): Promise<Foo> => {
  const result = await client.models.Foo.update(fooInput);

  return result.data;
};
```

### Always use the `deleteType` type for the parameters to delete an item

When deleting an item, always use the `deleteType` to define the parameters to delete the item.

Correct way:

```ts
import { generateClient } from "aws-amplify/data";
import { type Schema } from "../../amplify/data/resource";
import { type Foo, type FooDeleteInput } from "@/model/foo";

const client = generateClient<Schema>();

/**
 * Deletes foo
 */
const deleteFoo = async (fooInput: FooDeleteInput): Promise<Foo> => {
  const result = await client.models.Foo.delete(fooInput);

  return result.data;
};
```

## Use underscores instead of hyphens in enum values

GraphQL enum values cannot contain hyphens. Use underscores instead.

Wrong way:

```ts
type: a.enum(["youtube-video", "my-value"]);
```

Correct way:

```ts
type: a.enum(["youtube_video", "my_value"]);
```

## Prevent Owner Reassignment

When using owner-based authorization (allow.owner()), Amplify automatically creates a hidden owner field. By default, owners have permission to update this field, which allows them to reassign record ownership to other users.
To prevent this security risk, you must always explicitly define the owner field and restrict its update permissions.

Wrong way:

```ts
const schema = a.schema({
  Todo: a
    .model({
      content: a.string(),
    })
    .authorization((allow) => [
      allow.owner(), // Implicitly allows the owner to update the hidden 'owner' field
    ]),
});
```

Correct way:

```ts
const schema = a.schema({
  Todo: a
    .model({
      content: a.string(),
      // Explicitly define the owner field to restrict permissions
      owner: a.string().authorization((allow) => [
        allow.owner().to(["read", "delete"]), // Omit 'update' to prevent reassignment
      ]),
    })
    .authorization((allow) => [allow.owner()]),
});
```
