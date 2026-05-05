import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../src/App.jsx";
import Ollama from "ollama";

vi.mock("ollama", () => ({
  default: {
    chat: vi.fn()
  }
}));

function createDeferred() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

function getPromptBox() {
  return screen.getByRole("textbox", { name: /ask the hr assistant/i });
}

function getSendButton() {
  return screen.getByRole("button", { name: /send/i });
}

function getClearButton() {
  return screen.getByRole("button", { name: /clear thread/i });
}

beforeEach(() => {
  Ollama.chat.mockReset();
});

afterEach(() => {
  cleanup();
});

describe("HR Help Assistant chatbot", () => {
  it("captures user input and enables Send only when the prompt contains non-whitespace text", async () => {
    const user = userEvent.setup();
    render(<App />);

    const promptBox = getPromptBox();
    const sendButton = getSendButton();

    expect(sendButton).toBeDisabled();

    await user.type(promptBox, "   ");
    expect(sendButton).toBeDisabled();

    await user.clear(promptBox);
    await user.type(promptBox, "How do I find the benefits enrollment deadline?");

    expect(promptBox).toHaveValue("How do I find the benefits enrollment deadline?");
    expect(sendButton).toBeEnabled();
  });

  it("does not call Ollama for an empty or whitespace-only prompt", async () => {
    const user = userEvent.setup();
    render(<App />);

    const promptBox = getPromptBox();
    const sendButton = getSendButton();

    await user.type(promptBox, "    ");
    expect(sendButton).toBeDisabled();
    await user.click(sendButton);

    expect(Ollama.chat).not.toHaveBeenCalled();
  });

  it("submits the user message to Ollama with the expected model and message shape", async () => {
    const user = userEvent.setup();
    Ollama.chat.mockResolvedValueOnce({
      message: {
        role: "assistant",
        content: "Check your HR portal for the benefits enrollment deadline."
      }
    });

    render(<App />);

    await user.type(getPromptBox(), "Where can I find benefits deadlines?");
    await user.click(getSendButton());

    await waitFor(() => expect(Ollama.chat).toHaveBeenCalledTimes(1));

    expect(Ollama.chat).toHaveBeenCalledWith({
      model: "llama3.2",
      messages: [
        {
          role: "user",
          content: "Where can I find benefits deadlines?"
        }
      ]
    });
  });

  it("renders the user message, clears the input, shows loading feedback, and renders the assistant response", async () => {
    const user = userEvent.setup();
    const deferred = createDeferred();
    Ollama.chat.mockReturnValueOnce(deferred.promise);

    render(<App />);

    const promptBox = getPromptBox();
    await user.type(promptBox, "How do I request time off?");
    await user.click(getSendButton());

    expect(screen.getByText("How do I request time off?")).toBeInTheDocument();
    expect(promptBox).toHaveValue("");
    expect(screen.getByText(/thinking/i)).toBeInTheDocument();
    expect(getSendButton()).toBeDisabled();

    deferred.resolve({
      message: {
        role: "assistant",
        content: "Open the HR portal, choose the time-off form, and submit your request."
      }
    });

    expect(
      await screen.findByText(/open the hr portal/i)
    ).toBeInTheDocument();
    expect(screen.queryByText(/thinking/i)).not.toBeInTheDocument();
    expect(getSendButton()).toBeDisabled();
  });

  it("keeps a threaded conversation in order and sends prior messages with the next request", async () => {
    const user = userEvent.setup();
    Ollama.chat
      .mockResolvedValueOnce({
        message: {
          role: "assistant",
          content: "Benefits enrollment dates are usually listed in the HR portal."
        }
      })
      .mockResolvedValueOnce({
        message: {
          role: "assistant",
          content: "For follow-up questions, contact HR or check the benefits FAQ."
        }
      });

    render(<App />);

    await user.type(getPromptBox(), "Where are benefits dates listed?");
    await user.click(getSendButton());
    await screen.findByText(/benefits enrollment dates/i);

    await user.type(getPromptBox(), "Who should I ask if I still have questions?");
    await user.click(getSendButton());
    await screen.findByText(/benefits faq/i);

    const thread = screen.getByLabelText(/conversation thread/i);
    const messages = within(thread).getAllByRole("article");

    expect(messages).toHaveLength(4);
    expect(messages[0]).toHaveTextContent("You");
    expect(messages[0]).toHaveTextContent("Where are benefits dates listed?");
    expect(messages[1]).toHaveTextContent("Assistant");
    expect(messages[1]).toHaveTextContent("Benefits enrollment dates");
    expect(messages[2]).toHaveTextContent("You");
    expect(messages[2]).toHaveTextContent("Who should I ask if I still have questions?");
    expect(messages[3]).toHaveTextContent("Assistant");
    expect(messages[3]).toHaveTextContent("benefits FAQ");

    expect(Ollama.chat).toHaveBeenNthCalledWith(2, {
      model: "llama3.2",
      messages: [
        {
          role: "user",
          content: "Where are benefits dates listed?"
        },
        {
          role: "assistant",
          content: "Benefits enrollment dates are usually listed in the HR portal."
        },
        {
          role: "user",
          content: "Who should I ask if I still have questions?"
        }
      ]
    });
  });

  it("displays a helpful error message when the Ollama request fails and resets loading state", async () => {
    const user = userEvent.setup();
    Ollama.chat.mockRejectedValueOnce(new Error("Model unavailable"));

    render(<App />);

    await user.type(getPromptBox(), "How do I update my home address?");
    await user.click(getSendButton());

    expect(await screen.findByText(/failed to get response from ollama/i)).toBeInTheDocument();
    expect(screen.queryByText(/thinking/i)).not.toBeInTheDocument();
    expect(getSendButton()).toBeDisabled();

    await user.type(getPromptBox(), "Try again later?");
    expect(getSendButton()).toBeEnabled();
  });

  it("clears the conversation thread, input, and error when Clear thread is clicked", async () => {
    const user = userEvent.setup();

    Ollama.chat.mockResolvedValueOnce({
        message: {
        role: "assistant",
        content: "Ask your HR representative or check your employee handbook."
        }
    });

    render(<App />);

    const clearButton = getClearButton();
    const thread = screen.getByLabelText(/conversation thread/i);

    expect(clearButton).toBeDisabled();

    await user.type(getPromptBox(), "Where can I find the employee handbook?");
    await user.click(getSendButton());

    await waitFor(() => {
        expect(within(thread).getAllByRole("article")).toHaveLength(2);
    });

    expect(clearButton).toBeEnabled();

    await user.type(getPromptBox(), "draft text");
    expect(getPromptBox()).toHaveValue("draft text");

    await user.click(clearButton);

    expect(within(thread).queryAllByRole("article")).toHaveLength(0);
    expect(getPromptBox()).toHaveValue("");
    expect(clearButton).toBeDisabled();
    });

  it("renders assistant markdown content as HTML elements", async () => {
    const user = userEvent.setup();
    Ollama.chat.mockResolvedValueOnce({
      message: {
        role: "assistant",
        content: "Here are next steps:\n\n- Review the benefits guide\n- Contact HR if needed\n\n[Benefits guide](https://example.com/benefits)"
      }
    });

    render(<App />);

    await user.type(getPromptBox(), "What should I check before benefits enrollment?");
    await user.click(getSendButton());

    expect(await screen.findByText("Review the benefits guide")).toBeInTheDocument();
    expect(screen.getByText("Contact HR if needed")).toBeInTheDocument();

    const link = screen.getByRole("link", { name: /benefits guide/i });
    expect(link).toHaveAttribute("href", "https://example.com/benefits");
  });
})