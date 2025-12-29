

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
