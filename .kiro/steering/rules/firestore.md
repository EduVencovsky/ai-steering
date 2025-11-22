# Firestore Guidelines

When using firestore from firebase, always follow the guidelines below

## Do not create your own ids, use firestore ids

Never generate custom IDs manually. Always let Firestore generate document IDs automatically.

Wrong example:

```ts
import { doc, setDoc } from "firebase/firestore";

const customId = `user_${Date.now()}`; // ❌ Don't create custom IDs
await setDoc(doc(db, "users", customId), {
  name: "John Doe",
});
```

Correct example:

```ts
import { collection, addDoc } from "firebase/firestore";

// ✅ Let Firestore generate the ID
const docRef = await addDoc(collection(db, "users"), {
  name: "John Doe",
});

// ✅ Access the generated ID after creation
console.log("Created document with ID:", docRef.id);
```

Or if you need the reference before writing:

```ts
import { collection, doc, setDoc } from "firebase/firestore";

const userRef = doc(collection(db, "users")); // ✅ Firestore generates ID
await setDoc(userRef, {
  name: "John Doe",
});

// ✅ Access the generated ID
console.log("Created document with ID:", userRef.id);
```
