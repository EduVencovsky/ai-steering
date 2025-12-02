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
