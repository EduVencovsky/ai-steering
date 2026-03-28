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

## Always translate untranslated text messages to users

If while reading a file, you see a message that is not translated and it's displayed to users, ALWAYS translate it, even if it's not something you have touched. Be proactive in translating user facing messages.

## When adding new translations, always translate them in all languages

When adding new translations, always translate them in all languages. Translation files are stored in `.ts` files.

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

## Use string interpolation instead of concatenating multiple strings

You can create a translation that will receive a parameter that will be used to render inside the string by passing `{{foo}}`. When need to render strings with non hardcoded values, always create a translation with a parameter instead of concatenating multiple strings.

Wrong way:

```ts
const count = /* ... */;
const `${t("fooEquals")} ${count}`
```

```json
{
  "fooEquals": "Foo ="
}
```

Correct way:

```ts
const count = /* ... */;
const t("fooEquals", { count })
```

```json
{
  "fooEquals": "Foo = {{count}}"
}
```


## Always use correct Portuguese in pt-BR translations

When writing or reviewing pt-BR translation values, always use proper Portuguese with correct accents and special characters. Never omit accents or use unaccented substitutes.

Common mistakes to avoid:
- Missing accents: `nao` → `não`, `voce` → `você`, `esta` → `está`, `e` → `é`, `Gratis` → `Grátis`
- Missing cedilla: `Organizacao` → `Organização`, `execucao` → `execução`, `informacoes` → `informações`, `certificacao` → `certificação`
- Missing acute accents: `topico` → `tópico`, `pratica` → `prática`, `revisao` → `revisão`, `conclusao` → `conclusão`, `Metricas` → `Métricas`
- Missing circumflex: `voce` → `você`, `esta` → `está`
- Missing tilde: `nao` → `não`, `manutencao` → `manutenção`
