# React i18n Guidelines

Follow these guidelines when using `i18next` and `react-i18next` to translated text messages that are displayed to users

## Always display translated text message to users

Always use react-18next `useTranslation` hook to translate text messages. This ensures that the text messages are always translated and displayed to users.

Never hardcode messages to users, always use the `t` function to translate text messages.

Wrong way:

```tsx
import React from "react";
import { useTranslation } from "react-i18next";

const Foo = () => {
  const { t } = useTranslation();

  // Never hardcode text messages to users
  return (
    <div>
      <h1>Bar</h1>
      <p>Baz</p>
    </div>
  );
};
```

Correct way:

```jsx
import React from "react";
import { useTranslation } from "react-i18next";

const Foo = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t("foo.bar")}</h1>
      <p>{t("foo.baz")}</p>
    </div>
  );
};
```

## When adding new translations, always translate them in all languages

When adding new translations, always translate them in all languages. Translation files are stored in a json file.

## Always use lowercase separated by `-` for the translation keys

When defining the key for a translation, always use lowercase separated by `-` for the translation keys. Never nest the translation messages.

Wrong way:

```json
{
  "foo": {
    "bar": "Bar"
  },
  "foo.bar": "Bar",
  "fooBarBaz": "Baz"
}
```

Correct way:

```json
{
  "foo-bar": "Bar",
  "foo-bar-baz": "Baz"
}
```

## Always put the translation keys in alphabetical order

Always put the translation keys in alphabetical order.

Wrong way:

```json
{
  "foo": "Foo",
  "bar": "Bar",
  "baz": "Baz"
}
```

Correct way:

```json
{
  "bar": "Bar",
  "baz": "Baz",
  "foo": "Foo"
}
```
