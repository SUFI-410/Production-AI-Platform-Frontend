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
  if (
    error instanceof Error &&
    error.message.trim().length > 0
  ) {
    return error.message;
  }

  return "The assistant could not process your request.";
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
    async (message: string): Promise<void> => {
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
          session_id: conversationId,
          use_cache: true,
        });

        updateMessage(assistantMessage.id, {
          content: response.answer,
          status: "completed",
          sources: response.sources,
          grounded: response.grounded,
        });

        if (response.session_id !== null) {
          setConversationId(response.session_id);
        }
      } catch (error: unknown) {
        const errorMessage =
          getErrorMessage(error);

        setError(errorMessage);

        updateMessage(assistantMessage.id, {
          content:
            "Sorry, I could not generate a response. Please try again.",
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
    (message: string): void => {
      void submitMessage(message);
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
