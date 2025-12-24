# Firestore Rules Security Guidelines

You should always follow these rules when changing firestore rules. They are usually stored in a file called `firestore.rules` file

## Default deny / least privilege

All firestore rules must start with a explicity denying everything statemente, then selectively allow access per-collection:

```cloud-firestore-security-rules
match /{document=**} {
  allow read, write: if false;
}
```

## Per-user ownership for user-generated data

Users can only create/read/update/delete documents they own. This is done by checking the `uid` field of the document against the `request.auth.uid` field.

```cloud-firestore-security-rules
// Checks ownership for reads/deletes/updates by looking at the *existing* document.
// Uses `resource.data` because it represents what’s already stored in Firestore.
function isOwnerExisting() {
  return request.auth != null
    && resource.data.uid == request.auth.uid;
}

// Checks ownership for creates by looking at the *incoming* document being written.
// Uses `request.resource.data` because there is no existing document yet on create.
function isOwnerOnCreate() {
  return request.auth != null
    && request.resource.data.uid == request.auth.uid;
}

// Checks ownership for updates and also prevents changing the ownership field.
// This ensures an owner can update the doc, but cannot transfer it to another user,
// and a non-owner cannot "claim" the doc by setting `uid` to themselves.
function isOwnerAndKeepsUserId() {
  return isOwnerExisting()
    // Ensure the updated document still has `uid` equal to the authenticated user.
    && request.resource.data.uid == request.auth.uid
    // Ensure the `uid` field is unchanged compared to the stored document (immutability).
    && request.resource.data.uid == resource.data.uid;
}

match /foo/{docId} {
  allow create: if isOwnerOnCreate();
  allow read, delete: if isOwnerExisting();
  allow update: if isOwnerAndKeepsUserId();
}
```
