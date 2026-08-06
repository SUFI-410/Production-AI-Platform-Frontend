import { Trash2 } from "lucide-react";

import { useChatStore } from "../../store/chatStore";

const dateFormatter = new Intl.DateTimeFormat(
  undefined,
  {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  },
);

function Sidebar() {
  const isSubmitting = useChatStore(
    (state) => state.isSubmitting,
  );

  const conversations = useChatStore(
    (state) => state.conversations,
  );

  const activeConversationId = useChatStore(
    (state) => state.activeConversationId,
  );

  const resetChat = useChatStore(
    (state) => state.resetChat,
  );

  const openConversation = useChatStore(
    (state) => state.openConversation,
  );

  const deleteConversation = useChatStore(
    (state) => state.deleteConversation,
  );

  return (
    <aside className="sidebar">
      <button
        aria-label="Start a new conversation"
        className="new-chat-button"
        disabled={isSubmitting}
        onClick={resetChat}
        type="button"
      >
        + New Chat
      </button>

      <nav
        aria-label="Recent conversations"
        className="sidebar-menu"
      >
        <div className="sidebar-section">
          <h3>Recent Chats</h3>

          {conversations.length === 0 ? (
            <p className="px-2 py-3 text-sm text-muted-foreground">
              No conversations yet
            </p>
          ) : (
            <ul className="space-y-1">
              {conversations.map(
                (conversation) => {
                  const isActive =
                    conversation.id ===
                    activeConversationId;

                  return (
                    <li
                      className={[
                        "group flex items-center gap-1",
                        "rounded-md",
                        isActive
                          ? "bg-muted"
                          : "hover:bg-muted/60",
                      ].join(" ")}
                      key={conversation.id}
                    >
                      <button
                        aria-pressed={isActive}
                        className={[
                          "min-w-0 flex-1 overflow-hidden",
                          "px-2 py-2 text-left",
                          "text-foreground",
                        ].join(" ")}
                        disabled={isSubmitting}
                        onClick={() => {
                          openConversation(
                            conversation.id,
                          );
                        }}
                        title={conversation.title}
                        type="button"
                      >
                        <span className="block truncate text-sm font-medium text-foreground">
                          {conversation.title ||
                            "Untitled conversation"}
                        </span>

                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {dateFormatter.format(
                            new Date(
                              conversation.updatedAt,
                            ),
                          )}
                        </span>
                      </button>

                      <button
                        aria-label={
                          `Delete conversation: ` +
                          conversation.title
                        }
                        className={[
                          "mr-1 size-auto shrink-0 rounded-md p-2",
                          "text-muted-foreground",
                          "hover:bg-background",
                          "hover:text-destructive",
                          "focus-visible:outline-none",
                          "focus-visible:ring-2",
                          "focus-visible:ring-ring",
                        ].join(" ")}
                        disabled={isSubmitting}
                        onClick={() => {
                          deleteConversation(
                            conversation.id,
                          );
                        }}
                        title="Delete conversation"
                        type="button"
                      >
                        <Trash2
                          aria-hidden="true"
                          className="size-4"
                        />
                      </button>
                    </li>
                  );
                },
              )}
            </ul>
          )}
        </div>
      </nav>
    </aside>
  );
}

export default Sidebar;
