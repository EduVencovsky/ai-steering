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
