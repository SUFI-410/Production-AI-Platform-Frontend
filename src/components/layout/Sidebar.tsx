function Sidebar() {
  return (
    <aside className="sidebar">
      <button className="new-chat-button">
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
