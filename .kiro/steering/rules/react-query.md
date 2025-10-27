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
