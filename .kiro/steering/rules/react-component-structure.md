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

**Keep internal UI state in the presentational
component.** State that only controls how the UI is
displayed (e.g., which step is active, whether a
section is expanded, animation state) should stay in
the presentational component. The container should only
manage state that involves API data, form setup, or
data that needs to be shared across components.
