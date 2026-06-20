import Link from "next/link";

export function Header() {
  return (
    <header className="topbar">
      <div className="shell nav">
        <Link href="/" className="brand" aria-label="PhoneBase">
          <span className="brand-mark">P</span>
          <span>PhoneBase</span>
        </Link>
        <nav className="nav-links" aria-label="Navegacao principal">
          <Link href="/celulares">Celulares</Link>
          <Link href="/comparar">Comparar</Link>
          <Link href="/admin">Admin</Link>
        </nav>
        <div className="search">Busque celulares, tablets e TVs</div>
      </div>
    </header>
  );
}
