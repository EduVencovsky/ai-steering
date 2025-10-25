# React Component Structure

When implementing a UI with React, you must divide it into the following files:

1. [File for the API data types](#file-for-the-api-data-types)
2. [File for making the API call](#separate-file-for-making-the-api-call)
3. [File for the Hook that handles the API logic with React Query](#hook-for-handling-api-logic-with-react-query)
4. [File for React component that renders visual elements and receives the state or data](#react-component-that-renders-visual-elements-and-receives-the-state-or-data)
5. [File for React component that handles the state and API data](#react-component-that-handles-the-state-and-api-data)

For example:

## File for the API data types

This file should contain the exports for the data types

```typescript
export interface Foo {
  // ...
}
```

## Separate file for making the API call

Follow "Make a separate file for the function that makes the API call": #[[file:.kiro/steering/rules/react-query.md]]

It should use the files from the API data types

## Hook for handling API logic with react-query

Follow "Create a separate file for each `useQuery` or `useMutation` hook and use `queryOptions` for `useQuery`": #[[file:.kiro/steering/rules/react-query.md]]

It should use the files from the API data types

## React component that renders visual elements and receives the state or data

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
