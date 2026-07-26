import Link from "next/link";

export function SiteNav({ solid = false }: { solid?: boolean }) {
  return (
    <header
      className={
        solid
          ? "border-b border-line bg-paper/90 backdrop-blur"
          : "absolute inset-x-0 top-0 z-20"
      }
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 md:px-8">
        <Link href="/" className="font-display text-2xl font-semibold tracking-tight text-inherit">
          Billforge
        </Link>
        <nav className="flex items-center gap-5 text-sm font-medium">
          <Link href="/pricing" className="opacity-80 hover:opacity-100">
            Pricing
          </Link>
          <Link
            href="/app"
            className={
              solid
                ? "rounded-[2px] bg-ink px-3.5 py-2 text-paper"
                : "rounded-[2px] bg-brass px-3.5 py-2 text-ink"
            }
          >
            Open studio
          </Link>
        </nav>
      </div>
    </header>
  );
}
