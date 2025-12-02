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
npx shadcn@latest add <component-name>
```

## Command to see available components

Run the following command to see available components to add:

```bash
npx shadcn@latest list @shadcn
```
