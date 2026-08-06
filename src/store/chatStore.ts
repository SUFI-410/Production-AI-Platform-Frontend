import { create } from "zustand";
import {
  createJSONStorage,
  persist,
} from "zustand/middleware";

import type { Source } from "../api/chat/types";

export type ChatRole = "user" | "assistant";

export type ChatMessageStatus =
  | "pending"
  | "streaming"
  | "completed"
  | "error";

/**
 * Source metadata returned by the FastAPI /chat endpoint.
 *
 * Reusing the API transport type prevents the frontend store
 * from defining a conflicting source structure.
 */
export type ChatMessageSource = Source;

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  status: ChatMessageStatus;
  createdAt: string;
  sources?: ChatMessageSource[];
  grounded?: boolean | null;
}

interface ChatState {
  messages: ChatMessage[];
  input: string;
  conversationId: string | null;
  isSubmitting: boolean;
  error: string | null;

  setInput: (input: string) => void;
  setConversationId: (
    conversationId: string | null,
  ) => void;
  setSubmitting: (isSubmitting: boolean) => void;
  setError: (error: string | null) => void;

  addMessage: (message: ChatMessage) => void;
  updateMessage: (
    messageId: string,
    updates: Partial<Omit<ChatMessage, "id">>,
  ) => void;
  appendToMessage: (
    messageId: string,
    contentChunk: string,
  ) => void;
  removeMessage: (messageId: string) => void;

  clearMessages: () => void;
  resetChat: () => void;
}

type ChatStateData = Pick<
  ChatState,
  | "messages"
  | "input"
  | "conversationId"
  | "isSubmitting"
  | "error"
>;

function createInitialState(): ChatStateData {
  return {
    messages: [],
    input: "",
    conversationId: null,
    isSubmitting: false,
    error: null,
  };
}

/**
 * Persist only complete conversation exchanges.
 *
 * If the page is refreshed while a request is running, the
 * unfinished assistant placeholder and its unmatched user
 * message are excluded from persisted state.
 */
function getPersistedMessages(
  messages: ChatMessage[],
): ChatMessage[] {
  let lastCompletedExchangeIndex = -1;

  messages.forEach((message, index) => {
    const isFinishedAssistantMessage =
      message.role === "assistant" &&
      (
        message.status === "completed" ||
        message.status === "error"
      );

    if (isFinishedAssistantMessage) {
      lastCompletedExchangeIndex = index;
    }
  });

  if (lastCompletedExchangeIndex < 0) {
    return [];
  }

  return messages.slice(
    0,
    lastCompletedExchangeIndex + 1,
  );
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      ...createInitialState(),

      setInput: (input) => {
        set({ input });
      },

      setConversationId: (conversationId) => {
        set({ conversationId });
      },

      setSubmitting: (isSubmitting) => {
        set({ isSubmitting });
      },

      setError: (error) => {
        set({ error });
      },

      addMessage: (message) => {
        set((state) => ({
          messages: [
            ...state.messages,
            message,
          ],
        }));
      },

      updateMessage: (messageId, updates) => {
        set((state) => ({
          messages: state.messages.map((message) =>
            message.id === messageId
              ? {
                  ...message,
                  ...updates,
                }
              : message,
          ),
        }));
      },

      appendToMessage: (
        messageId,
        contentChunk,
      ) => {
        set((state) => ({
          messages: state.messages.map((message) =>
            message.id === messageId
              ? {
                  ...message,
                  content:
                    message.content + contentChunk,
                }
              : message,
          ),
        }));
      },

      removeMessage: (messageId) => {
        set((state) => ({
          messages: state.messages.filter(
            (message) =>
              message.id !== messageId,
          ),
        }));
      },

      clearMessages: () => {
        set({
          messages: [],
          error: null,
        });
      },

      resetChat: () => {
        set(createInitialState());
      },
    }),
    {
      name: "production-ai-platform-chat",
      version: 1,

      storage: createJSONStorage(
        () => sessionStorage,
      ),

      partialize: (state) => ({
        messages: getPersistedMessages(
          state.messages,
        ),
        conversationId: state.conversationId,
      }),
    },
  ),
);
