# TanStack Router Breadcrumb Guidelines

When creating routes with TanStack Router, follow these guidelines for breadcrumbs.

## Always create a parent layout route for nested routes

When creating a new route section (e.g., `/foo`, `/bar`), always create a parent layout file that defines the breadcrumb and renders an `<Outlet />`.

Wrong way (missing parent layout):

```
src/routes/
  foo/
    index.tsx      # /foo page
    $fooId.tsx     # /foo/:fooId layout
```

Correct way:

```
src/routes/
  foo.tsx          # Parent layout with breadcrumb
  foo/
    index.tsx      # /foo page
    $fooId.tsx     # /foo/:fooId layout
```

## Parent layout route structure

The parent layout route must:
1. Define a `loader` that returns a `crumb` property
2. Render an `<Outlet />` component

```tsx
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/foo")({
  component: RouteComponent,
  loader: () => {
    return {
      crumb: "Foo",
    };
  },
});

function RouteComponent() {
  return <Outlet />;
}
```

## Dynamic breadcrumbs for detail pages

For routes with dynamic parameters, fetch the data in the loader to display a meaningful breadcrumb.

```tsx
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { getFooQueryOptions } from "@/hooks/foo/use-foo";

export const Route = createFileRoute("/foo/$fooId")({
  component: RouteComponent,
  loader: async ({ params: { fooId }, context }) => {
    return {
      crumb: (
        await context.queryClient.ensureQueryData(getFooQueryOptions(fooId))
      )?.title,
    };
  },
});

function RouteComponent() {
  return <Outlet />;
}
```

## Create pages need breadcrumbs

Standalone create pages (e.g., `/foo-create`, `/bar-create`) are leaf routes and should define a `crumb` in their loader.

```tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/foo-create")({
  component: FooCreatePage,
  loader: () => ({ crumb: "Create Foo" }),
});

function FooCreatePage() {
  return <div>...</div>;
}
```

## Edit routes under detail pages

Edit routes should be nested under the detail route (e.g., `/foo/$fooId/edit`). Define the breadcrumb directly in the edit route file.

```tsx
// src/routes/foo/$fooId/edit.tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/foo/$fooId/edit")({
  component: RouteComponent,
  loader: () => ({ crumb: "Edit" }),
});

function RouteComponent() {
  return <div>...</div>;
}
```
