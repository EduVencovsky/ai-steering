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
