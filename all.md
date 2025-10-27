

# React Component Structure

When implementing a UI with React, you must divide it into the following files:

1. [File for making the API call](#separate-file-for-making-the-api-call)
2. [File for the Hook that handles the API logic with React Query](#hook-for-handling-api-logic-with-react-query)
3. [File for React component that renders visual elements and receives the state or data](#react-component-that-renders-visual-elements-and-receives-the-state-or-data)
4. [File for React component that handles the state and API data](#react-component-that-handles-the-state-and-api-data)

For example:

## Separate file for making the API call

Follow "Make a separate file for the function that makes the API call": #[[file:.kiro/steering/rules/react-query.md]]

This file should also export the API data interfaces and types

```typescript
export interface Foo {
  // ...
}
```

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

# Error handling

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

# React Hook Form

When using `react-hook-form`, always follow these guidelines

## Always use `useWatch` over `watch`

# React Query Guidelines

When using `@tanstack/react-query`, make sure that you follow these guidelines

1. Make a separate file for the function that makes the API call
1. Create a separate file for each `useQuery` or `useMutation` hook and use `queryOptions` for `useQuery`

## Make a separate file for the function that makes the API call

Contains reusable functions for performing API requests. Keeps networking logic isolated from UI and hooks. Must be pure functions.

You should follow the same standard from what is already being used in the project to make the API call.

Example:

```ts
export interface Foo {
  /* ... */
}

export interface Bar {
  /* ... */
}

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

# Shadcn

Use shadcn for the UI components.

## Importing components

You can import shadcn components from: `@/components/ui/`

Example:

```tsx
import { Foo } from "@/components/ui/foo";
```

# Typescript Best Practices

## Do not use `any`

Do not use the `any` type, always set the correct type.

## Do not use `as` operator and do not use `as any`

Do not use the `as` operator and do not use `as any`

## Always import types/interfaces with `type` keyword

Example:

```ts
import { type Foo } from "...";
```
