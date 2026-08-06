import { useChatStore } from "../../store/chatStore";

function Sidebar() {
  const isSubmitting = useChatStore(
    (state) => state.isSubmitting,
  );

  const resetChat = useChatStore(
    (state) => state.resetChat,
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

      <nav className="sidebar-menu">
        <div className="sidebar-section">
          <h3>Recent Chats</h3>

          <ul>
            <li>No conversations yet</li>
          </ul>
        </div>
      </nav>
    </aside>
  );
}

export default Sidebar;
