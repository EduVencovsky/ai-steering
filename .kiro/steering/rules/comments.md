# Guidelines for writing documents

For every comment you write, follow these guidelines

## Do not write comments that explains "what" or "how" in the middle of the code

Do not put comments in the middle of the code that explains the "what" or "how" of the code bellow it. Only write comments if they are truly necessary to understand why something is being done.

## Always add JSDocs to export functions

Always add propert JSDocs documentation to exporter functions and react components

## Do not write comments on every line of the code

Do not write comments on every line of the code. Only write comments on the code that is not self-explanatory.

Wrong example:

```js
// This is a comment
const foo = () => {
  // This is another comment
  return "bar";
};
```
