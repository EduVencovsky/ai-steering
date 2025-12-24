

# React Firebase Project Guidelines

Follow all of these guidelines:

## Libraries

In this project, you will be using the following libraries:

- `react`
- `zod`
- `react-hook-form`
- `shadcn`
- `@tanstack/react-query`
- `@tanstack/react-router`
- `firebase`
  - `firebase/auth`
  - `firebase/firestore`

## File structure

- `api`:
  - `**/*`: [Files for making the API call](#separate-file-for-making-the-api-call)
- `components`:
  - `ui`: Contains `shadcn` components
  - `*.tsx`:
- `context-providers`
  - `*.tsx`: Contains context providers
- `hooks`
  - `**/*.tsx`: Contains application hooks and react query hooks [files for the Hook that handles the API logic with React Query](#hook-for-handling-api-logic-with-react-query)
- `model`
  - `**/*.ts`: Contains firebase collections and zod schema
- `routes`
  - `**/*.tsx`: Contains files with routes from `@tanstack/react-router`

When implementing a UI with React, you must divide it into the following files:

1. [File for defining the models and firebase collections](#file-for-defining-the-models-and-firebase-collections)
1. [File for making the API call](#separate-file-for-making-the-api-call)
1. [File for the Hook that handles the API logic with React Query](#hook-for-handling-api-logic-with-react-query)
1. [File for React component that renders visual elements and receives the state or data](#react-component-that-renders-visual-elements-and-receives-the-state-or-data)
1. [File for React component that handles the state and API data](#react-component-that-handles-the-state-and-api-data)

### File for defining the models and firebase collections

For each firebase collection/doc create a separate file with a zod schema for the data that will be stored in the collection/doc.

There must be a function declared to be reused that will make the collection/doc typed and validated with zod. You shouldn't recreate this, but just import it.

Like:

```typescript
const toFirestore = <
  SchemaType extends z.infer<z.ZodTypeAny<DocumentData, DocumentData>>
>(
  data: SchemaType
) => {
  const entries = Object.entries(data).filter(([key]) => key !== "id");
  return Object.fromEntries(entries);
};

const fromFirestore =
  <
    Schema extends z.ZodTypeAny<DocumentData, DocumentData>,
    SchemaType extends z.infer<Schema>
  >(
    schema: SchemaType
  ) =>
  (snap: QueryDocumentSnapshot<DocumentData, DocumentData>) => {
    return schema.parse({ ...snap.data(), id: snap.id });
  };

export function typedCollection<
  Schema extends z.ZodTypeAny<DocumentData, DocumentData>
>(db: Firestore, path: string, schema: Schema) {
  type SchemaType = z.infer<Schema>;

  return collection(db, path).withConverter<SchemaType>({
    toFirestore,
    fromFirestore: fromFirestore(schema),
  });
}

export function typedDoc<
  Schema extends z.ZodTypeAny<DocumentData, DocumentData>
>(db: Firestore, path: string, schema: Schema) {
  type SchemaType = z.infer<Schema>;

  return doc(db, path).withConverter<SchemaType>({
    toFirestore,
    fromFirestore: fromFirestore(schema),
  });
}
```

In each collection file, you will define a schema for the input which doesn't contain the ID and the type for with the ID

For example:

```typescript
export const FooInputSchema = z.object({
  bar: z.string(),
  baz: z.string(),
});

export type FooInput = z.infer<typeof FooInputSchema>;
export type Foo = FooInput & { id: string };

export const fooCol = typedCollection(db, "foo", FooInputSchema);
export interface GetFooDocOptions {
  id: string;
}
export const getFooDoc = ({ id }: GetFooDocOptions) =>
  typedDoc(db, `foo/${id}`, FooInputSchema);
```

### File for making the API call

Follow "Make a separate file for the function that makes the API call: #[[file:.kiro/steering/rules/tanstack-query.md]]

### File for the Hook that handles the API logic with React Query

Follow "Create a separate file for each `useQuery` or `useMutation` hook and use `queryOptions` for `useQuery`": #[[file:.kiro/steering/rules/tanstack-query.md]]

It should use the files from the API data types

### File for React component that renders visual elements and receives the state or data

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

### React component that handles the state and API data

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

### Reusable components that uses API data

Some components can be reusable and will required API calls to be made.

For example, imagine that you have a drop down form field that lists certain resources.

In this scenario, instead of passing down props for the API call data in multiple places where this component is reused, it's fine to make a reusable component that has the API call logic inside.

Follow this logic:

- If the component is reused in multiple places and require API calls: Make the component call the API inside of it (following existing guidelines on how to get data from API)
- If the component is only used in a singel place and require API calls: Make the component receive the value of the API call from props

## How to handle Forms and API calls from firestore

When making an API calls, always use the types from the model.

Example:

```ts
// Use types from model
const getFoo = async (id: string): Foo | null => {
  const docRef = doc(db, "foo", id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  return { ...data, id };
};

// Use input and return types from model
const createFoo = (foo: FooInput): Foo => {
  const docRef = await addDoc(collection(db, "foo"), foo);
  return { id: docRef.id, ...foo };
};
```

And if you have a form using `react-hook-form` that `onSubmit` will call the API, you should use the same `zod` schema from the API in the `useForm`

Example:

```ts
// Hook imported from different file that uses @tanstack/react-query mutation hook and calls createFoo API
const createFoo = useCreatFoo();

const { handleSubmit, register, formState } = useForm<Foo>({
  resolver: zodResolver(fooSchema),
});

const onSubmit = handleSubmit(async (data) => {
  const newFoo = await createFoo.mutateAsync(data);
  // ...
});
```

And when needing to define some typescript type that is refering to the API data, always import the type from the model that is generated by the zod schema

# **Guidelines for Writing Requirement Documents**

A requirement document contains multiple requirements and each consist of a user story and acceptance criteria.

## **1. User Stories**

User stories must be written with acceptance criteria in **EARS (Easy Approach to Requirements Syntax)** notation to ensure clarity, consistency, and testability.

A **user story** describes a feature or functionality from the **user’s perspective**. It explains **who** wants something, **what** they want, and **why** it matters.

The standard format is:

> **As a [type of user], I want [goal or action], so that [benefit or reason].**

This structure helps focus on the **user’s need** rather than the system’s internal behavior.

**Example:**

> As a user, I want to add new FOO items, so that I can track tasks I need to complete.

---

## **2. Acceptance Criteria**

**Acceptance criteria** define the **conditions** that must be met for a user story to be considered complete.
They describe how the **system should behave** when certain actions or conditions occur.

Acceptance criteria must use **EARS notation**, following this structure:

```
WHEN [condition or event]
THE SYSTEM SHALL [expected behavior]
```

This ensures that requirements are clear, testable, and unambiguous.

**Example:**

> WHEN the user submits a form with invalid data,
> THE SYSTEM SHALL display validation errors next to the relevant fields.

---

## **3. Requirements Document Structure**

Each **user story** must be followed by a list of **acceptance criteria** that describe how the system will fulfill the user’s need.
Together, they ensure the requirement is **complete, understandable, and testable**.

A single doc can have multiple requirements.

**Structure:**

```md
# [Requirement Document Name]

[Small description of the requirement]

## Requirement [Number]

**User Story:** As a [type of user], I want [goal], so that [reason].

**Acceptance Criteria**:

1. WHEN [condition], THE SYSTEM SHALL [behavior].
2. WHEN [condition], THE SYSTEM SHALL [behavior].
3. ...
```

**Example:**

```md
# FOO List

A FOO List that can add, update, delete and mark FOO items as comples

## Requirement 1

**User Story:**
As a user, I want to add new FOO items, so that I can track tasks I need to complete.

**Acceptance Criteria:**

1. WHEN the user enters task text and submits, THE SYTEM SHALL create a new FOO item with the provided task text.
2. WHEN a new FOO item is created, THE SYTEM SHALL set the completion status to false.
3. THE SYTEM SHALL display the new FOO item in the task list immediately after creation.
4. WHEN the user submits an empty task text, THE SYTEM SHALL prevent creation and display an error message.

## Requirement 2

**User Story:** As a user, I want to update existing FOO items, so that I can modify task details or mark them as complete.

**Acceptance Criteria:**

1. WHEN the user selects a FOO item for editing, THE SYSTEM SHALL display the current task text in an editable field.
2. WHEN the user modifies the task text and saves, THE SYSTEM SHALL update the FOO item with the new content.
3. WHEN the user toggles the completion status, THE SYSTEM SHALL update and save the new status.
4. THE SYSTEM SHALL visually distinguish completed FOO items (e.g., with a checkmark or strike-through) from pending ones.
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
