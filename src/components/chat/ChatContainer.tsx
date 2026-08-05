import axios from "axios";
import { useCallback } from "react";

import { useChat } from "../../hooks/useChat";
import {
  type ChatMessage,
  useChatStore,
} from "../../store/chatStore";
import { ChatInput } from "./ChatInput";
import MessageList from "./MessageList";

function createMessage(
  role: ChatMessage["role"],
  content: string,
  status: ChatMessage["status"],
): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    status,
    createdAt: new Date().toISOString(),
  };
}

function getErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return "The assistant could not process your request. Please try again.";
  }

  if (
    error.code === "ECONNABORTED" ||
    error.code === "ETIMEDOUT"
  ) {
    return (
      "The request took too long. Please wait a moment, " +
      "then try the same question again."
    );
  }

  const statusCode = error.response?.status;

  if (statusCode === undefined) {
    return (
      "Unable to reach the AI service. Check your internet " +
      "connection and try again."
    );
  }

  if (statusCode === 403) {
    return (
      "Human verification failed or expired. Complete the " +
      "verification and try again."
    );
  }

  if (statusCode === 429) {
    return (
      "Too many requests were sent. Please wait at least " +
      "10 seconds before trying again."
    );
  }

  if (statusCode === 422) {
    return (
      "The request could not be validated. Refresh the page " +
      "and try again."
    );
  }

  if (statusCode === 500) {
    return (
      "The AI service encountered an internal error. " +
      "Please try again shortly."
    );
  }

  if (
    statusCode === 502 ||
    statusCode === 503 ||
    statusCode === 504
  ) {
    return (
      "The AI service is temporarily unavailable. " +
      "Please try again in a few moments."
    );
  }

  return (
    "The assistant could not process your request. " +
    "Please try again."
  );
}

function ChatContainer() {
  const { mutateAsync } = useChat();

  const conversationId = useChatStore(
    (state) => state.conversationId,
  );

  const isSubmitting = useChatStore(
    (state) => state.isSubmitting,
  );

  const addMessage = useChatStore(
    (state) => state.addMessage,
  );

  const updateMessage = useChatStore(
    (state) => state.updateMessage,
  );

  const setInput = useChatStore(
    (state) => state.setInput,
  );

  const setConversationId = useChatStore(
    (state) => state.setConversationId,
  );

  const setSubmitting = useChatStore(
    (state) => state.setSubmitting,
  );

  const setError = useChatStore(
    (state) => state.setError,
  );

  const submitMessage = useCallback(
    async (
      message: string,
      turnstileToken: string,
    ): Promise<void> => {
      const question = message.trim();

      if (
        question.length === 0 ||
        isSubmitting
      ) {
        return;
      }

      const userMessage = createMessage(
        "user",
        question,
        "completed",
      );

      const assistantMessage = createMessage(
        "assistant",
        "",
        "pending",
      );

      setError(null);
      setSubmitting(true);
      setInput("");

      addMessage(userMessage);
      addMessage(assistantMessage);

      try {
        const response = await mutateAsync({
          question,
          turnstile_token: turnstileToken,
          session_id: conversationId,
          use_cache: true,
        });

        updateMessage(assistantMessage.id, {
          content: response.answer,
          status: "completed",
          sources: response.sources,
          grounded: response.grounded,
        });

        if (
          typeof response.session_id === "string"
        ) {
          setConversationId(
            response.session_id,
          );
        }
      } catch (error: unknown) {
        const errorMessage =
          getErrorMessage(error);

        setError(errorMessage);

        updateMessage(assistantMessage.id, {
          content: errorMessage,
          status: "error",
          sources: [],
          grounded: null,
        });
      } finally {
        setSubmitting(false);
      }
    },
    [
      addMessage,
      conversationId,
      isSubmitting,
      mutateAsync,
      setConversationId,
      setError,
      setInput,
      setSubmitting,
      updateMessage,
    ],
  );

  const handleSubmit = useCallback(
    (
      message: string,
      turnstileToken: string,
    ): Promise<void> => {
      return submitMessage(
        message,
        turnstileToken,
      );
    },
    [submitMessage],
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      <MessageList />

      <ChatInput onSubmit={handleSubmit} />
    </div>
  );
}

export default ChatContainer;
