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
