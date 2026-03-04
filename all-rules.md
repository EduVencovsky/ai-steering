

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

# Coding guidelines

For code you write, follow these guidelines

## Do not shorten variable names

When declaring a varible, always put the entire name. Do not shorten variable names.

Wrong example:

```ts
listC = ["..."];
```

Correct example:

```ts
listContent = ["..."];
```

# Guidelines for writing documents

For every comment you write, follow these guidelines

## Do not write comments that explains "what" or "how" in the middle of the code

Do not put comments in the middle of the code that explains the "what" or "how" of the code bellow it. Only write comments if they are truly necessary to understand why something is being done.

## Always add JSDocs to export functions

Always add propert JSDocs documentation to exporter functions and react components

## Do not write comments on every line of the code

Do not write comments on every line of the code. Only write comments on the code that is not self-explanatory.

Wrong example:

```js
// This is a comment
const foo = () => {
  // This is another comment
  return "bar";
};
```

# Error Handling Guidelines

When handling errors, follow these guidelines

## Never user `alert` for showing errors

Never user Javascript built-in `alert` to show errors

Wrong example:

```tsx
function LoginForm() {
  const handleSubmit = async () => {
    try {
      await fooFunctionThatCanThrow();
    } catch (err) {
      alert(err.message); // ❌ Don't use alert()
    }
  };

  return <button onClick={handleSubmit}>Login</button>;
}
```

Correct example:

```tsx
import { useState } from "react";
import { Alert } from "...";

function LoginForm() {
  const [error, setError] = useState("");

  const handleSubmit = () => {
    try {
      throw new Error("Invalid credentials");
    } catch (err) {
      setError("Login failed. Please check your credentials."); // ✅ User-friendly error
    }
  };

  return (
    <div>
      <button onClick={handleSubmit}>Login</button>
      {/* Show error message to user using some Alert component */}
      {error && <Alert>{error}</Alert>}
    </div>
  );
}
```

## Never display technical errors to users

Never display technical error messages or errors that reference implementation details

Wrong example:

```tsx
try {
  // Simulate technical failure
  throw new Error("TypeError: Cannot read property 'name' of undefined");
} catch (err) {
  setError(err.message); // ❌ Exposes technical details to users
}
```

Correct example:

```tsx
try {
  // Simulate a technical failure
  throw new Error("TypeError: Cannot read property 'name' of undefined");
} catch (err) {
  console.error(err); // ✅ Log technical error for developers
  setError("Something went wrong while loading your profile."); // ✅ Friendly message
}
```

# File Structure Guidelines

When managing files, always follow these guidelines

## Always use Kebab Case when creating folder

For any folders, always use kebab case

Wrong way:

- MyFolder/
- myFolder/

Correct way:

- my-folder/

## Always use Kebab Case when creating Javascript or Typescript files

Always use Kebab Case when creating a new file with the following extesions ".js", ".jsx", ".ts", ".tsx"

Wrong way:

- MyButton.tsx
- myButton.tsx

Correct way:

- my-button.tsx

# Firestore Rules Security Guidelines

You should always follow these rules when changing firestore rules. They are usually stored in a file called `firestore.rules` file

## Default deny / least privilege

All firestore rules must start with a explicity denying everything statemente, then selectively allow access per-collection:

```cloud-firestore-security-rules
match /{document=**} {
  allow read, write: if false;
}
```

## Per-user ownership for user-generated data

Users can only create/read/update/delete documents they own. This is done by checking the `uid` field of the document against the `request.auth.uid` field.

```cloud-firestore-security-rules
// Checks ownership for reads/deletes/updates by looking at the *existing* document.
// Uses `resource.data` because it represents what’s already stored in Firestore.
function isOwnerExisting() {
  return request.auth != null
    && resource.data.uid == request.auth.uid;
}

// Checks ownership for creates by looking at the *incoming* document being written.
// Uses `request.resource.data` because there is no existing document yet on create.
function isOwnerOnCreate() {
  return request.auth != null
    && request.resource.data.uid == request.auth.uid;
}

// Checks ownership for updates and also prevents changing the ownership field.
// This ensures an owner can update the doc, but cannot transfer it to another user,
// and a non-owner cannot "claim" the doc by setting `uid` to themselves.
function isOwnerAndKeepsUserId() {
  return isOwnerExisting()
    // Ensure the updated document still has `uid` equal to the authenticated user.
    && request.resource.data.uid == request.auth.uid
    // Ensure the `uid` field is unchanged compared to the stored document (immutability).
    && request.resource.data.uid == resource.data.uid;
}

match /foo/{docId} {
  allow create: if isOwnerOnCreate();
  allow read, delete: if isOwnerExisting();
  allow update: if isOwnerAndKeepsUserId();
}
```

# Firestore Guidelines

When using firestore from firebase, always follow the guidelines below

## Do not create your own ids, use firestore ids

Never generate custom IDs manually. Always let Firestore generate document IDs automatically.

Wrong example:

```ts
import { doc, setDoc } from "firebase/firestore";

const customId = `user_${Date.now()}`; // ❌ Don't create custom IDs
await setDoc(doc(db, "users", customId), {
  name: "John Doe",
});
```

Correct example:

```ts
import { collection, addDoc } from "firebase/firestore";

// ✅ Let Firestore generate the ID
const docRef = await addDoc(collection(db, "users"), {
  name: "John Doe",
});

// ✅ Access the generated ID after creation
console.log("Created document with ID:", docRef.id);
```

Or if you need the reference before writing:

```ts
import { collection, doc, setDoc } from "firebase/firestore";

const userRef = doc(collection(db, "users")); // ✅ Firestore generates ID
await setDoc(userRef, {
  name: "John Doe",
});

// ✅ Access the generated ID
console.log("Created document with ID:", userRef.id);
```

# React Component Structure Guidelines

Always follow these guidelines when creating new React components.

## File for React component that renders visual elements and receives the state or data

A presentational component focused only on rendering UI elements based on the props it receives.

Can be reused anywhere and doesn't rely on any react context. These components should be a pure like pure functions.

```tsx
import React from "react";

export interface BarProps {
  bar: Bar;
  onRefresh: () => void;
}

export const Bar = ({ bar, onRefresh }: BarProps) => (
  <div>
    <h2>Foo Details</h2>
    <button onClick={onRefresh}>Refresh</button>
    <pre>{bar}</pre>
  </div>
);
```

## React component that handles the state and API data

Manages component logic, state, and data fetching. Passes data and handlers as props to the visual component.

Will receive few props and will be calling most of the hooks for state or API data.

```tsx
import React from "react";
import { useFoo } from "../hooks/useFoo";
import { Bar } from "../components/Bar";

export interface FooProps {
  id: string;
}

export const Foo = ({ id }: FooProps) => {
  const { data: foo, isLoading, isError, refetch } = useFoo(id);

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error loading data.</p>;
  if (!foo) return <p>No data found.</p>;

  return <Bar bar={foo} onRefresh={refetch} />;
};
```

## Reusable components that uses API data

Some components can be reusable and will required API calls to be made.

For example, imagine that you have a drop down form field that lists certain resources.

In this scenario, instead of passing down props for the API call data in multiple places where this component is reused, it's fine to make a reusable component that has the API call logic inside.

Follow this logic:

- If the component is reused in multiple places and require API calls: Make the component call the API inside of it (following existing guidelines on how to get data from API)
- If the component is only used in a singel place and require API calls: Make the component receive the value of the API call from props

# React Hook Form Guidelines

When using `react-hook-form`, always follow these guidelines

## Always use `useWatch` over `watch`

`watch` is a function that returns the current value of a form field. It is not a reactive value, so it is not updated when the value changes. This means that if you want to use the value of a form field in a component, you need to use `useWatch` instead of `watch`. `useWatch` is a hook that returns a reactive value, so it is updated when the value changes.

Wrong example:

```tsx
const { control, watch } = useForm();

const values = watch();
```

Correct example:

```tsx
const { control, watch } = useForm();

const name = useWatch({ control, name: "name" }); // This will update when the value changes
```

## Always use `useWatch` with the specific fields you want instead of all fields

Always use `useWatch` with the specific fields you want instead of all fields so the componnet doesn't rerender when all field changes, but only the fields you really need.

Wrong example:

```tsx
const { control, watch } = useForm();

const values = useWatch({ control });
```

Correct example:

```tsx
const { control, watch } = useForm();

const name = useWatch({ control, name: "name" }); // Pass the specific fields you want to watch
```

# React i18n Guidelines

Follow these guidelines when using `i18next` and `react-i18next` to translated text messages that are displayed to users

## Always display translated text message to users

Always use react-18next `useTranslation` hook to translate text messages. This ensures that the text messages are always translated and displayed to users.

Never hardcode messages to users, always use the `t` function to translate text messages.

Wrong way:

```tsx
import React from "react";
import { useTranslation } from "react-i18next";

const Foo = () => {
  const { t } = useTranslation();

  // Never hardcode text messages to users
  return (
    <div>
      <h1>Bar</h1>
      <p>Baz</p>
    </div>
  );
};
```

Correct way:

```jsx
import React from "react";
import { useTranslation } from "react-i18next";

const Foo = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t("foo.bar")}</h1>
      <p>{t("foo.baz")}</p>
    </div>
  );
};
```

## When adding new translations, always translate them in all languages

When adding new translations, always translate them in all languages. Translation files are stored in a json file.

## Always use lowercase separated by `-` for the translation keys

When defining the key for a translation, always use lowercase separated by `-` for the translation keys. Never nest the translation messages.

Wrong way:

```json
{
  "foo": {
    "bar": "Bar"
  },
  "foo.bar": "Bar",
  "fooBarBaz": "Baz"
}
```

Correct way:

```json
{
  "foo-bar": "Bar",
  "foo-bar-baz": "Baz"
}
```

## Always put the translation keys in alphabetical order

Always put the translation keys in alphabetical order.

Wrong way:

```json
{
  "foo": "Foo",
  "bar": "Bar",
  "baz": "Baz"
}
```

Correct way:

```json
{
  "bar": "Bar",
  "baz": "Baz",
  "foo": "Foo"
}
```

## Use string interpolation instead of concatenating multiple strings

You can create a translation that will receive a parameter that will be used to render inside the string by passing `{{foo}}`. When need to render strings with non hardcoded values, always create a translation with a parameter instead of concatenating multiple strings.

Wrong way:

```ts
const count = /* ... */;
const `${t("fooEquals")} ${count}`
```

```json
{
  "fooEquals": "Foo ="
}
```

Correct way:

```ts
const count = /* ... */;
const t("fooEquals", { count })
```

```json
{
  "fooEquals": "Foo = {{count}}"
}
```

# React guidelines

When using `react`, always follow these guidelines

## How to strucutre files for React components

Never put 2 react components in the same file. Always have a single component per file.

In the component file, always use named exports and always export the component props

Correct example:

```tsx
// Foo.tsx
export interface FooProps {
  id: string;
}

export const Foo = ({ id }: FooProps) => {
  // ...
};
```

# Shadcn Guidelines

When using shadcn, follow these guidelines

## Importing components

You can import shadcn components from: `@/components/ui/`

Example:

```tsx
import { Foo } from "@/components/ui/foo";
```

## Always use Shadcn components

Always use shadcn components. Do not render raw html or raw css if you have a shadcn component available for it,
If a component is not available in the code base, but it does exist in the shadcn library, run the command to add the component and use it.

## Command to add new components

If you need to add a new component, use the following command:

```bash
npx --yes shadcn@latest add <component-name>
```

## Command to see available components

Run the following command to see available components to add:

```bash
npx --yes shadcn@latest list @shadcn
```

# React Query Guidelines

When using `@tanstack/react-query`, make sure that you follow these guidelines

1. Make a separate file for the function that makes the API call
1. Create a separate file for each `useQuery` or `useMutation` hook
1. Use `queryOptions` for `useQuery`

## Make a separate file for the function that makes the API call

Contains reusable functions for performing API requests. Keeps networking logic isolated from UI and hooks. Must be pure functions.

You should follow the same standard from what is already being used in the project to make the API call.

Example:

```ts
export const getFoo = async (id: string): Promise<Foo> => {
  // Using `fetch` is just an example, use what is already being used to make API calls in the project
  const res = await fetch(`https://api.example.com/foo/${id}`);
  return res.json();
};

export const createFoo = async (data: Foo): Promise<Bar> => {
  // Using `fetch` is just an example, use what is already being used to make API calls in the project
  const res = await fetch("https://api.example.com/foo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};
```

## Create a separate file for each `useQuery` or `useMutation` hook and use `queryOptions` for `useQuery`

Encapsulates API fetching logic using `useQuery` or `useMutation` from React Query. Keeps data management separate from components.

Example for `useQuery`:

```ts
import { useQuery, queryOptions } from "@tanstack/react-query";
import { getFoo } from "...";

// Always create a function for queryOptions
export const getFooQueryOptions = (id: string) => {
  return queryOptions({
    queryKey: ["foo", id],
    queryFn: () => getFoo(id),
    // ...
  });
};

export const useGetFoo = (id: string) => useQuery(getFooQueryOptions(id));
```

Example for `useMutation`:

```ts
import { useMutation } from "@tanstack/react-query";
import { createFoo } from "...";

export const useCreateFoo = () => {
  return useMutation({
    mutationFn: createFoo,
    // ...
  });
};
```

# TanStack Router Breadcrumb Guidelines

When creating routes with TanStack Router, follow these guidelines for breadcrumbs.

## Always create a parent layout route for nested routes

When creating a new route section (e.g., `/foo`, `/bar`), always create a parent layout file that defines the breadcrumb and renders an `<Outlet />`.

Wrong way (missing parent layout):

```
src/routes/
  foo/
    index.tsx      # /foo page
    $fooId.tsx     # /foo/:fooId layout
```

Correct way:

```
src/routes/
  foo.tsx          # Parent layout with breadcrumb
  foo/
    index.tsx      # /foo page
    $fooId.tsx     # /foo/:fooId layout
```

## Parent layout route structure

The parent layout route must:
1. Define a `loader` that returns a `crumb` property
2. Render an `<Outlet />` component

```tsx
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/foo")({
  component: RouteComponent,
  loader: () => {
    return {
      crumb: "Foo",
    };
  },
});

function RouteComponent() {
  return <Outlet />;
}
```

## Dynamic breadcrumbs for detail pages

For routes with dynamic parameters, fetch the data in the loader to display a meaningful breadcrumb.

```tsx
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { getFooQueryOptions } from "@/hooks/foo/use-foo";

export const Route = createFileRoute("/foo/$fooId")({
  component: RouteComponent,
  loader: async ({ params: { fooId }, context }) => {
    return {
      crumb: (
        await context.queryClient.ensureQueryData(getFooQueryOptions(fooId))
      )?.title,
    };
  },
});

function RouteComponent() {
  return <Outlet />;
}
```

## Create pages need breadcrumbs

Standalone create pages (e.g., `/foo-create`, `/bar-create`) are leaf routes and should define a `crumb` in their loader.

```tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/foo-create")({
  component: FooCreatePage,
  loader: () => ({ crumb: "Create Foo" }),
});

function FooCreatePage() {
  return <div>...</div>;
}
```

## Edit routes under detail pages

Edit routes should be nested under the detail route (e.g., `/foo/$fooId/edit`). Define the breadcrumb directly in the edit route file.

```tsx
// src/routes/foo/$fooId/edit.tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/foo/$fooId/edit")({
  component: RouteComponent,
  loader: () => ({ crumb: "Edit" }),
});

function RouteComponent() {
  return <div>...</div>;
}
```

# Tanstack Router Guidelines

Tanstack router comes from `@tanstack/react-router`

## Always use hook from tanstack instead of native browser functionality

Never use `window` or other browser functionality to navigate between pages.

Always use provided hooks and functions from tanstack to navigate to pages.

Wrong example:

```tsx
function MyComponent({ id }: { id: string }) {
  const handleClick = () => {
    // ❌ Don't use window.location
    window.location.assign(`/modules/${id}`);
  };

  return <button onClick={handleClick}>Go to Module</button>;
}
```

Correct example:

```tsx
import { useNavigate } from "@tanstack/react-router";

function MyComponent({ id }: { id: string }) {
  const navigate = useNavigate();

  const handleClick = () => {
    // ✅ Use navigate from TanStack Router
    navigate({
      to: "/module-detail/$moduleId",
      params: { moduleId: id }, // Pass params if needed
    });
  };

  return <button onClick={handleClick}>Go to Module</button>;
}
```

## Never access the URL directly. Always use tanstack provided hooks

Never use browser APIs to read URL parameters or search params. Always use TanStack Router hooks.

Wrong example:

```tsx
import { useEffect, useState } from "react";

function MyComponent() {
  const [id, setId] = useState("");

  useEffect(() => {
    // ❌ Don't use URLSearchParams or window.location
    const params = new URLSearchParams(window.location.search);
    setId(params.get("id") || "");
  }, []);

  return <div>ID: {id}</div>;
}
```

Correct example:

```tsx
import { useParams, useSearch } from "@tanstack/react-router";

function MyComponent() {
  // ✅ Use useParams for route parameters
  const { id } = useParams({ from: "/module-detail/$moduleId" });

  // ✅ Use useSearch for query parameters
  const { filter } = useSearch({ from: "/modules" });

  return <div>ID: {id}</div>;
}
```

# Typescript Guidelines

When using typescript, follow these guidelines

## Do not use `any`

Do not use the `any` type, always set the correct type.

## Do not use `as` operator and do not use `as any`

Do not use the `as` operator and do not use `as any`

## Always import types/interfaces with `type` keyword

Example:

```ts
import { type Foo } from "...";
```

# Zod Guidelines

When using `zod` follow these guidelines

## Always use `safeParse` instead of `parse`

`parse` will throw an error if the input is invalid, which is not what we want. Instead, use `safeParse` which will return an object with a `success` boolean and an `error` object.

Wrong example:

```ts
try {
  schema.parse(input);
} catch (error) {
  // handle error
}
```

Correct example:

```ts
const result = schema.safeParse(input);
if (!result.success) {
  // handle error
}
```

## Always call `console.error` when validation fails

If validation fails, you should log the error to the console. This will help you debug the issue.

```ts
const result = schema.safeParse(input);
if (!result.success) {
  console.error(result.error);
}
```

## When defining a zod validation schema, always export it's type with `infer`

Example:

```ts
export const fooSchema = z.object({
  bar: z.string(),
});

export type Foo = z.infer<typeof fooSchema>;
```
