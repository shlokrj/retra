export function SiteFooter() {
  return (
    <footer className="mx-auto flex max-w-6xl flex-col gap-2 px-5 pb-8 pt-4 text-sm font-light text-[color:var(--muted)] sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <p>Research demo. Not a medical diagnosis.</p>
      <p>
        Made by{" "}
        <a
          href="https://shlok.fyi/"
          target="_blank"
          rel="noreferrer"
          className="site-credit-link font-medium"
        >
          shlok.fyi
        </a>
      </p>
    </footer>
  );
}
