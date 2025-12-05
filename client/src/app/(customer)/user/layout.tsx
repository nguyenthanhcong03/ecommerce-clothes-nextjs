export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="user-account-layout">
      <div className="sidebar">
        <nav>
          {/* User navigation will be implemented here */}
          <p>User Navigation Menu</p>
        </nav>
      </div>
      <div className="content">{children}</div>
    </div>
  );
}
