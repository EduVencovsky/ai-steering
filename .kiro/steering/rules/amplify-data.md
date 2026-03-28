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

## Understand list nullability in generated TypeScript types

Amplify Gen 2 generates TypeScript types based on GraphQL nullability rules. For list fields, there are two separate “required” concepts:

- **Is the list itself required?** (can the entire field be `null` / omitted?)
- **Are the items inside the list required?** (can an element inside the array be `null`?)

If you only mark the list field as required, Amplify may still generate list item types as nullable, resulting in types like:

`Nullable<string>[] | undefined`

Wrong way (list required, items can still be nullable):

```ts
interests: a.string().array().required(),
```

Correct way (make items required _and_ the list required):

```ts
interests: a.string().required().array().required(),
```

## Use Amplify secrets for sensitive environment variables

Never hardcode API keys, tokens, or other secrets in code or plain environment variables. Always use Amplify's `secret()` function to reference secrets stored in AWS SSM Parameter Store.

Set secrets via the CLI for sandbox environments and via the Amplify console for production branches.

Wrong way:

```ts
// ❌ Do not hardcode secrets
const myHandler = defineFunction({
  name: "my-handler",
  entry: "./my-handler/handler.ts",
  environment: {
    API_KEY: "sk-1234567890abcdef",
  },
});
```

Correct way:

```ts
import { defineFunction, secret } from "@aws-amplify/backend";

const myHandler = defineFunction({
  name: "my-handler",
  entry: "./my-handler/handler.ts",
  environment: {
    API_KEY: secret("API_KEY"),
  },
});
```

Setting the secret for sandbox:

```bash
npx ampx sandbox secret set API_KEY
```

For production branches, set secrets via the Amplify console under the environment's secret management.

In the Lambda handler, read the secret from `process.env`:

```ts
const apiKey = process.env.API_KEY;
```

## Use custom queries for Lambda functions instead of CDK API Gateway stacks

When you need a Lambda function that the frontend can call (e.g., proxying an external API, running custom business logic), always use Amplify's built-in custom queries (`a.query()`) backed by `a.handler.function()` in the data schema. Do not create custom CDK stacks with API Gateway, REST API, or HTTP API constructs.

Custom queries use the existing AppSync endpoint, existing Cognito auth, and the existing `generateClient<Schema>()` pattern. No extra infrastructure, no CORS configuration, no manual auth token management.

### Define the function and queries in `amplify/data/resource.ts`

Use `defineFunction` with `entry` pointing to the handler file and `secret()` for sensitive environment variables. Define custom queries in the schema with `a.handler.function()`.

Correct way:

```ts
import {
  type ClientSchema,
  a,
  defineData,
  defineFunction,
  secret,
} from "@aws-amplify/backend";

const myHandler = defineFunction({
  name: "my-handler",
  entry: "./my-handler/handler.ts",
  environment: {
    MY_SECRET: secret("MY_SECRET"),
  },
});

const schema = a.schema({
  myQuery: a
    .query()
    .arguments({ id: a.string().required() })
    .returns(a.json())
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function(myHandler)),
});
```

Wrong way:

```ts
// ❌ Do not create CDK stacks with API Gateway
import { Stack } from "aws-cdk-lib";
import { RestApi, LambdaIntegration } from "aws-cdk-lib/aws-apigateway";

const apiStack = backend.createStack("MyApiStack");
const restApi = new RestApi(apiStack, "MyApi", { /* ... */ });
```

### Place handler files under `amplify/data/`

Handler files for custom queries go under `amplify/data/<handler-name>/`. Do not create an `amplify/functions/` directory for handlers that are used by custom queries.

Correct way:

```
amplify/data/
  my-handler/
    handler.ts
    helper.ts
  resource.ts
```

Wrong way:

```
amplify/functions/
  my-handler/
    resource.ts
    handler.ts
```

### Call custom queries from the frontend using `generateClient`

Use the existing `generateClient<Schema>()` pattern to call custom queries. Do not use `get()` from `aws-amplify/api` or plain `fetch` with manual auth tokens.

Correct way:

```ts
import { generateClient } from "aws-amplify/data";
import { type Schema } from "../../amplify/data/resource";

const client = generateClient<Schema>();

const result = await client.queries.myQuery({ id: "abc" });
```

Wrong way:

```ts
// ❌ Do not use REST API client for Lambda calls
import { get } from "aws-amplify/api";

const response = await get({
  apiName: "myApi",
  path: "/my-endpoint",
  options: { queryParams: { id: "abc" } },
}).response;
```

### Do not modify `amplify/backend.ts` for Lambda functions

The `backend.ts` file should only contain `defineBackend` with the standard resources (auth, data, etc.) and any CDK overrides for those resources. Lambda functions used by custom queries are defined in `amplify/data/resource.ts` and do not need to be added to `defineBackend`.

### Define return types in the schema and reuse them in the handler

Always define the return type of a custom query using `a.customType()` or `a.ref()` in the schema. The handler must use the schema-inferred type (`Schema["myQuery"]["functionHandler"]`) so the return type is type-safe from the Lambda handler all the way to the frontend client call.

```ts
// amplify/data/resource.ts
const schema = a.schema({
  FooResponse: a.customType({
    id: a.string().required(),
    name: a.string().required(),
    count: a.integer(),
  }),

  getFoo: a
    .query()
    .arguments({ id: a.string().required() })
    .returns(a.ref("FooResponse"))
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function(myHandler)),
});
```

```ts
// amplify/data/my-handler/handler.ts
import type { Schema } from "../resource";

export const handler: Schema["getFoo"]["functionHandler"] = async (event) => {
  // Return type is enforced by the schema-inferred type
  return { id: event.arguments.id, name: "Example", count: 42 };
};
```

### Share one Lambda across multiple custom queries

When multiple custom queries use the same underlying logic (e.g., different endpoints of the same external API), define one `defineFunction` and reference it in all queries. The handler routes based on `event.fieldName`.

```ts
const sharedHandler = defineFunction({
  name: "my-proxy",
  entry: "./my-proxy/handler.ts",
  environment: { API_KEY: secret("API_KEY") },
});

const schema = a.schema({
  getFoo: a
    .query()
    .arguments({ id: a.string().required() })
    .returns(a.json())
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function(sharedHandler)),

  getBar: a
    .query()
    .arguments({ name: a.string().required() })
    .returns(a.json())
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function(sharedHandler)),
});
```

```ts
// amplify/data/my-proxy/handler.ts
export const handler = async (event) => {
  switch (event.fieldName) {
    case "getFoo":
      return await getFoo(event.arguments.id);
    case "getBar":
      return await getBar(event.arguments.name);
    default:
      throw new Error(`Unknown query: ${event.fieldName}`);
  }
};
```
