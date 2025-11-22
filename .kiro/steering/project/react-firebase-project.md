# React Component Structure

## Libraries

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

When implementing a UI with React, you must divide it into the following files:

1. [File for making the API call](#separate-file-for-making-the-api-call)
2. [File for the Hook that handles the API logic with React Query](#hook-for-handling-api-logic-with-react-query)
3. [File for React component that renders visual elements and receives the state or data](#react-component-that-renders-visual-elements-and-receives-the-state-or-data)
4. [File for React component that handles the state and API data](#react-component-that-handles-the-state-and-api-data)

### Separate file for making the API call

Follow "Make a separate file for the function that makes the API call": #[[file:.kiro/steering/rules/tanstack-query.md]]

This file should also export the API data interfaces and types

```typescript
export interface Foo {
  // ...
}
```

### Hook for handling API logic with react-query

Follow "Create a separate file for each `useQuery` or `useMutation` hook and use `queryOptions` for `useQuery`": #[[file:.kiro/steering/rules/tanstack-query.md]]

It should use the files from the API data types

### React component that renders visual elements and receives the state or data

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

Firestore data can be unstructured and nothing guarantees that it will return the correct data.

So when you make an API call to Firestore, you should always validate the data that comes back from it. To do this, you should use `zod` to define the shape of the data that comes back from Firestore.

Example:

```ts
export const fooSchema = z.object({
  id: z.string(),
  bar: z.string(),
  baz: z.number(),
});
export type Foo = z.infer<typeof fooSchema>;

const getFoo = async (id: string): Foo | null => {
  const docRef = doc(db, "foo", id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  const data = docSnap.data();
  const { success, data, error } = fooSchema.safeParse({ ...data, id });

  if (success) {
    return data;
  }

  console.error(error);
  return null;
};

export const createFooSchema = z.object({
  bar: z.string(),
  baz: z.number(),
});
export type CreateFoo = z.infer<typeof createFooSchema>;

const createFoo = (foo: CreateFoo): Foo => {
  const docRef = await addDoc(collection(db, "foo"), foo);
  return { id: docRef.id, ...foo };
};
```

And if you have a form using `react-hook-form` that `onSubmit` will call the API, you should use the same `zod` schema from the API in the `useForm`

Example:

```ts
// Hook imported from different file that uses @tanstack/react-query mutation hook and calls createFoo API
const createFoo = useCreatFoo();

const { handleSubmit, register, formState } = useForm<CreateFoo>({
  resolver: zodResolver(createFooSchema),
});

const onSubmit = handleSubmit(async (data) => {
  const newFoo = await createFoo.mutateAsync(data);
  // ...
});
```

And when needing to define some typescript type that is refering to the API data, always import the type that is generated from the `zod` schema.
