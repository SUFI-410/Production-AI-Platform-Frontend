import { useHealth } from "../../hooks/useHealth";

function Header() {
  const { data, isLoading, isError } = useHealth();

  let status = "Checking...";
  let statusClass = "status-dot";

  if (isError) {
    status = "Offline";
    statusClass = "status-dot offline";
  } else if (!isLoading && data) {
    status = data.status;
    statusClass = "status-dot online";
  }

  return (
    <header className="app-header">
      <div className="header-brand">
        <h1>Production AI Platform</h1>

        <span className="version">
          {data?.version ?? "--"}
        </span>
      </div>

      <div className="header-status">
        <span className={statusClass} />

        <span>{status}</span>
      </div>
    </header>
  );
}

export default Header;
