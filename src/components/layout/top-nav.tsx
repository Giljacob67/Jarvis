import Link from "next/link";

const links = [
  { href: "/chat", label: "Chat" },
  { href: "/tasks", label: "Tasks" },
  { href: "/calendar", label: "Calendar" },
  { href: "/settings", label: "Settings" },
];

export function TopNav() {
  return (
    <nav
      style={{
        display: "flex",
        gap: 16,
        padding: "14px 16px",
        background: "#0f172a",
        color: "#e2e8f0",
      }}
    >
      {links.map((item) => (
        <Link key={item.href} href={item.href}>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}