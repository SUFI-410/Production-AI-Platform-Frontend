import { create } from "zustand";
import {
  createJSONStorage,
  persist,
} from "zustand/middleware";

import type { Source } from "../api/chat/types";

const MAX_SAVED_CONVERSATIONS = 20;
const MAX_CONVERSATION_TITLE_LENGTH = 48;

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

export interface SavedConversation {
  id: string;
  title: string;
  sessionId: string | null;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

interface ChatState {
  messages: ChatMessage[];
  input: string;
  conversationId: string | null;
  activeConversationId: string | null;
  conversations: SavedConversation[];
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
  openConversation: (conversationId: string) => void;
  deleteConversation: (
    conversationId: string,
  ) => void;
}

type CurrentChatState = Pick<
  ChatState,
  | "messages"
  | "input"
  | "conversationId"
  | "isSubmitting"
  | "error"
>;

type ChatStateData = Pick<
  ChatState,
  | "messages"
  | "input"
  | "conversationId"
  | "activeConversationId"
  | "conversations"
  | "isSubmitting"
  | "error"
>;

function createCurrentChatState(): CurrentChatState {
  return {
    messages: [],
    input: "",
    conversationId: null,
    isSubmitting: false,
    error: null,
  };
}

function createInitialState(): ChatStateData {
  return {
    ...createCurrentChatState(),
    activeConversationId: null,
    conversations: [],
  };
}

function createConversationTitle(
  messages: ChatMessage[],
): string {
  const firstUserMessage = messages.find(
    (message) => message.role === "user",
  );

  const normalizedTitle = (
    firstUserMessage?.content ?? "New conversation"
  )
    .replace(/\s+/g, " ")
    .trim();

  if (
    normalizedTitle.length <=
    MAX_CONVERSATION_TITLE_LENGTH
  ) {
    return normalizedTitle;
  }

  return (
    normalizedTitle
      .slice(
        0,
        MAX_CONVERSATION_TITLE_LENGTH - 3,
      )
      .trimEnd() + "..."
  );
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

function moveConversationToFront(
  conversations: SavedConversation[],
  conversation: SavedConversation,
): SavedConversation[] {
  return [
    conversation,
    ...conversations.filter(
      (item) => item.id !== conversation.id,
    ),
  ].slice(0, MAX_SAVED_CONVERSATIONS);
}

function syncConversation(
  conversations: SavedConversation[],
  activeConversationId: string | null,
  messages: ChatMessage[],
  sessionId: string | null,
  updatedAt: string,
): SavedConversation[] {
  if (activeConversationId === null) {
    return conversations;
  }

  const existingConversation = conversations.find(
    (conversation) =>
      conversation.id === activeConversationId,
  );

  const updatedConversation: SavedConversation =
    existingConversation === undefined
      ? {
          id: activeConversationId,
          title: createConversationTitle(messages),
          sessionId,
          messages,
          createdAt:
            messages[0]?.createdAt ?? updatedAt,
          updatedAt,
        }
      : {
          ...existingConversation,
          sessionId,
          messages,
          updatedAt,
        };

  return moveConversationToFront(
    conversations,
    updatedConversation,
  );
}

/**
 * Convert the previous single-chat persisted state into one
 * saved conversation when the upgraded application first loads.
 */
function mergePersistedState(
  persistedState: unknown,
  currentState: ChatState,
): ChatState {
  const persisted =
    persistedState !== null &&
    typeof persistedState === "object"
      ? (
          persistedState as Partial<ChatState>
        )
      : {};

  const persistedMessages = Array.isArray(
    persisted.messages,
  )
    ? getPersistedMessages(persisted.messages)
    : [];

  const persistedConversations = Array.isArray(
    persisted.conversations,
  )
    ? persisted.conversations
    : [];

  const mergedState: ChatState = {
    ...currentState,
    ...persisted,
    messages: persistedMessages,
    conversations: persistedConversations,
  };

  const alreadyUsesConversationHistory =
    persistedConversations.length > 0 ||
    typeof persisted.activeConversationId ===
      "string";

  if (
    alreadyUsesConversationHistory ||
    persistedMessages.length === 0
  ) {
    return mergedState;
  }

  const localConversationId = crypto.randomUUID();

  const createdAt =
    persistedMessages[0]?.createdAt ??
    new Date().toISOString();

  const updatedAt =
    persistedMessages[
      persistedMessages.length - 1
    ]?.createdAt ?? createdAt;

  const sessionId =
    typeof persisted.conversationId === "string"
      ? persisted.conversationId
      : null;

  return {
    ...mergedState,
    conversationId: sessionId,
    activeConversationId: localConversationId,
    conversations: [
      {
        id: localConversationId,
        title: createConversationTitle(
          persistedMessages,
        ),
        sessionId,
        messages: persistedMessages,
        createdAt,
        updatedAt,
      },
    ],
  };
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      ...createInitialState(),

      setInput: (input) => {
        set({ input });
      },

      setConversationId: (conversationId) => {
        set((state) => {
          const updatedAt =
            new Date().toISOString();

          return {
            conversationId,
            conversations: syncConversation(
              state.conversations,
              state.activeConversationId,
              state.messages,
              conversationId,
              updatedAt,
            ),
          };
        });
      },

      setSubmitting: (isSubmitting) => {
        set({ isSubmitting });
      },

      setError: (error) => {
        set({ error });
      },

      addMessage: (message) => {
        set((state) => {
          const updatedAt =
            new Date().toISOString();

          const activeConversationId =
            state.activeConversationId ??
            crypto.randomUUID();

          const messages = [
            ...state.messages,
            message,
          ];

          return {
            messages,
            activeConversationId,
            conversations: syncConversation(
              state.conversations,
              activeConversationId,
              messages,
              state.conversationId,
              updatedAt,
            ),
          };
        });
      },

      updateMessage: (messageId, updates) => {
        set((state) => {
          const messages = state.messages.map(
            (message) =>
              message.id === messageId
                ? {
                    ...message,
                    ...updates,
                  }
                : message,
          );

          return {
            messages,
            conversations: syncConversation(
              state.conversations,
              state.activeConversationId,
              messages,
              state.conversationId,
              new Date().toISOString(),
            ),
          };
        });
      },

      appendToMessage: (
        messageId,
        contentChunk,
      ) => {
        set((state) => {
          const messages = state.messages.map(
            (message) =>
              message.id === messageId
                ? {
                    ...message,
                    content:
                      message.content +
                      contentChunk,
                  }
                : message,
          );

          return {
            messages,
            conversations: syncConversation(
              state.conversations,
              state.activeConversationId,
              messages,
              state.conversationId,
              new Date().toISOString(),
            ),
          };
        });
      },

      removeMessage: (messageId) => {
        set((state) => {
          const messages = state.messages.filter(
            (message) =>
              message.id !== messageId,
          );

          return {
            messages,
            conversations: syncConversation(
              state.conversations,
              state.activeConversationId,
              messages,
              state.conversationId,
              new Date().toISOString(),
            ),
          };
        });
      },

      clearMessages: () => {
        set((state) => ({
          ...createCurrentChatState(),
          activeConversationId: null,
          conversations: state.conversations,
        }));
      },

      resetChat: () => {
        set((state) => ({
          ...createCurrentChatState(),
          activeConversationId: null,
          conversations: state.conversations,
        }));
      },

      openConversation: (conversationId) => {
        set((state) => {
          const conversation =
            state.conversations.find(
              (item) =>
                item.id === conversationId,
            );

          if (conversation === undefined) {
            return state;
          }

          return {
            messages: conversation.messages,
            input: "",
            conversationId:
              conversation.sessionId,
            activeConversationId:
              conversation.id,
            isSubmitting: false,
            error: null,
          };
        });
      },

      deleteConversation: (conversationId) => {
        set((state) => {
          const conversations =
            state.conversations.filter(
              (conversation) =>
                conversation.id !==
                conversationId,
            );

          if (
            state.activeConversationId !==
            conversationId
          ) {
            return { conversations };
          }

          return {
            ...createCurrentChatState(),
            activeConversationId: null,
            conversations,
          };
        });
      },
    }),
    {
      name: "production-ai-platform-chat",
      version: 1,

      storage: createJSONStorage(
        () => sessionStorage,
      ),

      merge: mergePersistedState,

      partialize: (state) => {
        const conversations =
          state.conversations
            .map((conversation) => ({
              ...conversation,
              messages: getPersistedMessages(
                conversation.messages,
              ),
            }))
            .filter(
              (conversation) =>
                conversation.messages.length > 0,
            )
            .slice(
              0,
              MAX_SAVED_CONVERSATIONS,
            );

        const activeConversationId =
          state.activeConversationId !== null &&
          conversations.some(
            (conversation) =>
              conversation.id ===
              state.activeConversationId,
          )
            ? state.activeConversationId
            : null;

        return {
          messages:
            activeConversationId === null
              ? []
              : getPersistedMessages(
                  state.messages,
                ),
          conversationId:
            activeConversationId === null
              ? null
              : state.conversationId,
          activeConversationId,
          conversations,
        };
      },
    },
  ),
);
