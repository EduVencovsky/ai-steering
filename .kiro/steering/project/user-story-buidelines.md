# **Guidelines for Writing Requirement Documents**

A requirement document contains multiple requirements and each consist of a user story and acceptance criteria.

## **1. User Stories**

User stories must be written with acceptance criteria in **EARS (Easy Approach to Requirements Syntax)** notation to ensure clarity, consistency, and testability.

A **user story** describes a feature or functionality from the **user’s perspective**. It explains **who** wants something, **what** they want, and **why** it matters.

The standard format is:

> **As a [type of user], I want [goal or action], so that [benefit or reason].**

This structure helps focus on the **user’s need** rather than the system’s internal behavior.

**Example:**

> As a user, I want to add new FOO items, so that I can track tasks I need to complete.

---

## **2. Acceptance Criteria**

**Acceptance criteria** define the **conditions** that must be met for a user story to be considered complete.
They describe how the **system should behave** when certain actions or conditions occur.

Acceptance criteria must use **EARS notation**, following this structure:

```
WHEN [condition or event]
THE SYSTEM SHALL [expected behavior]
```

This ensures that requirements are clear, testable, and unambiguous.

**Example:**

> WHEN the user submits a form with invalid data,
> THE SYSTEM SHALL display validation errors next to the relevant fields.

---

## **3. Requirements Document Structure**

Each **user story** must be followed by a list of **acceptance criteria** that describe how the system will fulfill the user’s need.
Together, they ensure the requirement is **complete, understandable, and testable**.

A single doc can have multiple requirements.

**Structure:**

```md
# [Requirement Document Name]

[Small description of the requirement]

## Requirement [Number]

**User Story:** As a [type of user], I want [goal], so that [reason].

**Acceptance Criteria**:

1. WHEN [condition], THE SYSTEM SHALL [behavior].
2. WHEN [condition], THE SYSTEM SHALL [behavior].
3. ...
```

**Example:**

```md
# FOO List

A FOO List that can add, update, delete and mark FOO items as comples

## Requirement 1

**User Story:**
As a user, I want to add new FOO items, so that I can track tasks I need to complete.

**Acceptance Criteria:**

1. WHEN the user enters task text and submits, THE SYTEM SHALL create a new FOO item with the provided task text.
2. WHEN a new FOO item is created, THE SYTEM SHALL set the completion status to false.
3. THE SYTEM SHALL display the new FOO item in the task list immediately after creation.
4. WHEN the user submits an empty task text, THE SYTEM SHALL prevent creation and display an error message.

## Requirement 2

**User Story:** As a user, I want to update existing FOO items, so that I can modify task details or mark them as complete.

**Acceptance Criteria:**

1. WHEN the user selects a FOO item for editing, THE SYSTEM SHALL display the current task text in an editable field.
2. WHEN the user modifies the task text and saves, THE SYSTEM SHALL update the FOO item with the new content.
3. WHEN the user toggles the completion status, THE SYSTEM SHALL update and save the new status.
4. THE SYSTEM SHALL visually distinguish completed FOO items (e.g., with a checkmark or strike-through) from pending ones.
```
