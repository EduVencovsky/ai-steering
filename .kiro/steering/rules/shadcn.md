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

## Use shadcn/ui Form primitives for consistent field UI

When building forms with shadcn/ui, always use the shadcn **Form primitives** (typically alongside react-hook-form) to keep spacing, typography, accessibility semantics, and validation messaging consistent across the app.

### Wrap form-like UI in `<Form>`

Even in multi-step wizards, wrap the interactive area so child form elements follow the same conventions.

```tsx
<Card className="p-6">
  <Form {...form}>{/* step content */}</Form>
</Card>
```

### Structure each field with `FormItem`, `FormLabel`, `FormDescription`, and `FormMessage`

Every input block (toggles, checkboxes, sliders, etc.) should follow the same pattern:

- **`FormItem`**: consistent spacing/layout
- **`FormLabel`**: field title
- **`FormDescription`**: helper/optional hint
- **Control UI**: your input component(s)
- **`FormMessage`**: reserved space for validation/error text

Wrong way:

```tsx
Wrong way (ad-hoc markup + inconsistent error handling):

<div className="space-y-4">
  {/* Don't use heading for labels */}
  <h2 className="text-lg font-semibold">Days</h2>
  {/* Don't use p for descriptions */}
  <p className="text-sm text-muted-foreground">Optional</p>

  {/* control UI here */}

  {/* ❌ No FormMessage slot; errors end up inconsistent/jumpy */}
  {hasError && (
    <p className="text-sm text-destructive">
      Something went wrong.
    </p>
  )}
</div>
```

Correct way:

```tsx
<FormItem className="space-y-4">
  <FormLabel className="text-lg font-semibold">Days</FormLabel>
  <FormDescription>Optional</FormDescription>

  {/* control UI here */}

  <FormMessage />
</FormItem>
```
