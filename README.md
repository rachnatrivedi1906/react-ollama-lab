# Lab: Building a Chat Interface in React

In this lab, you will build a local AI-powered chatbot prototype for an HR help assistant.

This lab focuses on the **core frontend patterns behind AI chat interfaces**, including:

- controlled input
- threaded message state
- asynchronous model calls
- loading feedback
- error handling
- markdown rendering

---

## Learning Outcome

You will **build a working AI chatbot interface** within a professional HR support context using the **Identify → Assemble → Execute → Verify process**, applying React state management, async logic, and UI feedback patterns to meet a fully passing automated test suite.

---

## What You’ll Get

### Support
- Starter React project (Vite)
- Pre-built UI and styles
- Component scaffold with TODOs
- Automated test suite (Vitest + Testing Library)

### Rules
- You must complete the lab using the provided structure
- Do not modify the tests
- You may use documentation and course materials
- You should run tests frequently as you build

---

## What You’ll Learn

You will be able to:

- manage controlled input in React
- maintain a threaded message history
- handle asynchronous API calls
- manage loading and error states
- render structured AI responses (Markdown)
- connect user actions to UI updates

---

## How You’ll Show It

You will submit:

- a working React application
- all tests passing using `npm test`

---

## Setup

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Run tests:

```bash
npm test
```

---

## Important: How to Work Through This Lab

This lab is test-driven.

- The tests will fail at the start. That is expected.

As you implement features, tests will begin to pass.

You should:

- Run tests early and often
- Use test failures to guide your implementation
- Focus on one test at a time

---

## Suggested Process

Follow the Identify → Assemble → Execute → Verify workflow.

1. Identify (Plan Your Approach)

Before coding, think through:

- What state do you need?
    - input
    - messages
    - loading
    - error
- What happens when a user clicks “Send”?
- What happens when the request fails?
- What happens when the user clears the chat?

2. Assemble (Structure Your Component)

Set up:
- state variables
- event handlers
- message object shape:
```js
{ role: "user" | "assistant", content: string }
```

3. Execute (Build Features Step-by-Step)

Work incrementally:
    a. Capture input
    b. Enable/disable Send button correctly
    c. Add user message to thread
    d. Call Ollama.chat
    e. Add assistant response
    f. Show loading state ("Thinking...")
    g. Handle errors
    h. Render message list
    i. Implement Clear Thread

4. Verify (Test and Refine)

After each step:

Run:
```bash
npm test
```

Fix failing tests.

Check behavior in the browser.

Ask yourself:

- Does the UI match expected behavior?
- Are messages in the correct order?
- Are edge cases handled (empty input, errors)?


## Ollama Integration

Your code must call:

```js
Ollama.chat({
  model: "llama3.2",
  messages: nextMessages
});
```

> **Important Note**
>
> The test suite mocks Ollama. The tests and CodeGrade will not require your local model to be installed and running.

## Requirements Checklist

Your chatbot must:

- Use controlled input (value + onChange)
- Disable Send when input is empty or loading
- Disable Clear Thread when no messages or loading
- Add user message before API call
- Send full message history to Ollama
- Add assistant response to thread
- Show “Thinking...” while waiting
- Show error message on failure: "Failed to get response from Ollama."
-  Render messages in order
-  Render markdown using react-markdown + remark-gfm
-  Clear messages, input, and error on Clear Thread
-  Pass all tests

## Submission

Submit your GitHub repository.

Your submission must:

- Run successfully with npm install
- Pass all tests with npm test
- Include your completed OllamaChat.jsx


## Tip

If you’re stuck:

- Read the failing test carefully
- Ask: what behavior is this test expecting?
- Implement only what’s needed to pass that test

This lab mirrors how real teams build AI features:

- small steps
- constant testing
- iterative improvement
