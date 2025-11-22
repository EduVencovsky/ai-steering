# Tanstack Router Guidelines

Tanstack router comes from `@tanstack/react-router`

## Always use hook from tanstack instead of native browser functionality

Never use `window` or other browser functionality to navigate between pages.

Always use provided hooks and functions from tanstack to navigate to pages.

Wrong example:

```tsx
function MyComponent({ id }: { id: string }) {
  const handleClick = () => {
    // ❌ Don't use window.location
    window.location.assign(`/modules/${id}`);
  };

  return <button onClick={handleClick}>Go to Module</button>;
}
```

Correct example:

```tsx
import { useNavigate } from "@tanstack/react-router";

function MyComponent({ id }: { id: string }) {
  const navigate = useNavigate();

  const handleClick = () => {
    // ✅ Use navigate from TanStack Router
    navigate({
      to: "/module-detail/$moduleId",
      params: { moduleId: id }, // Pass params if needed
    });
  };

  return <button onClick={handleClick}>Go to Module</button>;
}
```

## Never access the URL directly. Always use tanstack provided hooks

Never use browser APIs to read URL parameters or search params. Always use TanStack Router hooks.

Wrong example:

```tsx
import { useEffect, useState } from "react";

function MyComponent() {
  const [id, setId] = useState("");

  useEffect(() => {
    // ❌ Don't use URLSearchParams or window.location
    const params = new URLSearchParams(window.location.search);
    setId(params.get("id") || "");
  }, []);

  return <div>ID: {id}</div>;
}
```

Correct example:

```tsx
import { useParams, useSearch } from "@tanstack/react-router";

function MyComponent() {
  // ✅ Use useParams for route parameters
  const { id } = useParams({ from: "/module-detail/$moduleId" });

  // ✅ Use useSearch for query parameters
  const { filter } = useSearch({ from: "/modules" });

  return <div>ID: {id}</div>;
}
```
