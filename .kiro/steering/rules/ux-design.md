---
name: ux-visual-mocks
description: Create and review UX wireframes, interface mockups, and screen flows using visible and inspectable design rules.
---

# UX Visual Mocks

## Purpose

Create UX mocks that make the main task, content structure, interactive elements, and important interface states visually clear before implementation.

Apply only rules that can be inspected directly in a visual mock or screen flow.

## Normative language

Uppercase normative keywords use BCP 14 meanings as defined by RFC 2119 and RFC 8174.

## Guidelines

### 1. Show one prominent primary action

Each screen SHOULD contain one visually dominant action. Secondary actions MUST use lower emphasis so that they do not compete with the main action.

**Bad**

```text
┌──────────────────────────────┐
│ Complete your order          │
│                              │
│ [ SAVE ] [ PAY ] [ EDIT ]    │
│ [ BACK ] [ CANCEL ]          │
└──────────────────────────────┘
```

**Good**

```text
┌──────────────────────────────┐
│ Complete your order          │
│                              │
│ [ PAY NOW ]                  │
│                              │
│ Edit order      Go back      │
└──────────────────────────────┘
```

---

### 2. Use spacing to show relationships

Related elements MUST appear close together. Separate groups MUST have visibly more space between them than the elements inside each group.

**Bad**

```text
┌──────────────────────────────┐
│ Name                         │
│                              │
│ Email                        │
│ [____________________]       │
│                              │
│ [____________________]       │
└──────────────────────────────┘
```

**Good**

```text
┌──────────────────────────────┐
│ Name                         │
│ [____________________]       │
│                              │
│ Email                        │
│ [____________________]       │
└──────────────────────────────┘
```

---

### 3. Keep related screens structurally consistent

Screens within the same flow SHOULD preserve the same layout structure. Repeated headings, navigation, fields, and actions SHOULD remain in predictable positions.

**Bad**

```text
Step 1                        Step 2
┌──────────────┐              ┌──────────────┐
│ Profile      │              │ [ Continue ] │
│              │              │ Address      │
│ Name         │              │              │
│ [________]   │              │ [________]   │
│              │              │              │
│ [ Continue ] │              │ Back         │
└──────────────┘              └──────────────┘
```

**Good**

```text
Step 1                        Step 2
┌──────────────┐              ┌──────────────┐
│ Profile      │              │ Address      │
│              │              │              │
│ Name         │              │ Street       │
│ [________]   │              │ [________]   │
│              │              │              │
│ [ Continue ] │              │ [ Continue ] │
│ Back         │              │ Back         │
└──────────────┘              └──────────────┘
```

---

### 4. Expose frequent actions

A common or primary action SHOULD NOT be hidden inside a menu, tab, or disclosure panel. Hidden controls SHOULD be reserved for secondary or infrequent options.

**Bad**

```text
┌──────────────────────────────┐
│ Blue jacket             €49  │
│                              │
│ [ More options ▾ ]           │
└──────────────────────────────┘

After opening the menu:
[ Add to basket ]
```

**Good**

```text
┌──────────────────────────────┐
│ Blue jacket             €49  │
│                              │
│ [ ADD TO BASKET ]            │
│ More options ▾               │
└──────────────────────────────┘
```

---

### 5. Make interactive roles visually distinct

Buttons MUST look like buttons. Links MUST look like links. Status labels MUST NOT look clickable. Users SHOULD be able to distinguish each role without guessing.

**Bad**

```text
┌──────────────────────────────┐
│ Continue                     │
│ Learn more                   │
│ COMPLETED                    │
└──────────────────────────────┘
```

**Good**

```text
┌──────────────────────────────┐
│ [ CONTINUE ]                 │
│ Learn more →                 │
│ Status: COMPLETED            │
└──────────────────────────────┘
```

---

### 6. Show states without relying only on color

Selected, focused, disabled, loading, success, and error states MUST be visually distinguishable. Color MUST NOT be the only signal. Use labels, icons, outlines, underlines, or other visible cues.

**Bad**

```text
┌──────────────────────────────┐
│ All   Active   Completed     │
│       ↑                      │
│ Active is shown only by      │
│ a color change               │
└──────────────────────────────┘
```

**Good**

```text
┌──────────────────────────────┐
│ All   [ ✓ Active ] Completed │
│         ─────────            │
│         selected             │
└──────────────────────────────┘
```

---

### 7. Place errors next to the problem

A validation message MUST appear beside the field that needs correction. It MUST explain what needs to change. For a form with multiple errors, the mock SHOULD also show an error summary near the top.

**Bad**

```text
┌──────────────────────────────┐
│ Something went wrong.        │
│                              │
│ Email                        │
│ [ alex@email             ]   │
└──────────────────────────────┘
```

**Good**

```text
┌──────────────────────────────┐
│ Fix the errors below         │
│ • Enter a valid email        │
│                              │
│ Email                        │
│ [ alex@email             ]   │
│ Enter a valid email address. │
└──────────────────────────────┘
```

---

### 8. Reuse the same visual pattern for the same role

The same type of action MUST use the same component pattern throughout the mock. Equivalent actions SHOULD NOT look unrelated.

**Bad**

```text
┌──────────────────────────────┐
│ [ Save ]                     │
│ CONFIRM                      │
│ ┌─────────────┐              │
│ │ Continue    │              │
│ └─────────────┘              │
└──────────────────────────────┘
```

**Good**

```text
┌──────────────────────────────┐
│ [ SAVE ]                     │
│ [ CONFIRM ]                  │
│ [ CONTINUE ]                 │
└──────────────────────────────┘
```

---

### 9. Draw meaningful non-happy states

Important screens SHOULD include the applicable loading, empty, error, disabled, and success states. A blank screen MUST NOT be used as an unexplained state.

**Bad**

```text
┌──────────────────────────────┐
│ Saved items                  │
│                              │
│                              │
│                              │
└──────────────────────────────┘
```

**Good**

```text
┌──────────────────────────────┐
│ Saved items                  │
│                              │
│ No saved items yet.          │
│ Browse products to add one.  │
│                              │
│ [ BROWSE PRODUCTS ]          │
└──────────────────────────────┘
```

---

### 10. Remove unnecessary steps, not necessary steps

A screen flow SHOULD NOT add an intermediate screen unless it collects information, supports a decision, prevents a meaningful error, or confirms an important action.

Do not optimize solely for the lowest possible click count.

**Bad**

```text
[ Product ]
     ↓
[ Open actions ]
     ↓
[ Choose purchase ]
     ↓
[ Add to basket ]
```

**Good**

```text
[ Product ]
     ↓
[ Add to basket ]
```

## Review checklist

Before sharing a mock, verify that:

- the primary action is immediately visible;
- spacing clearly separates related and unrelated elements;
- related screens use a consistent layout structure;
- frequent actions are not hidden unnecessarily;
- buttons, links, and statuses have distinct visual roles;
- important states are visible without relying only on color;
- error messages appear beside the affected fields;
- repeated actions reuse consistent components;
- loading, empty, error, disabled, and success states are shown where relevant; and
- each screen in the flow has a clear purpose.
