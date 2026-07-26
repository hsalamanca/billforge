import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-ink text-paper">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-10 md:flex-row md:items-end md:justify-between md:px-8">
        <div>
          <p className="font-display text-2xl">Billforge</p>
          <p className="mt-2 max-w-md text-sm text-paper/70">
            Professional invoices and quotes for freelancers who want to get paid — not learn
            accounting software.
          </p>
        </div>
        <div className="flex gap-5 text-sm text-paper/80">
          <Link href="/pricing">Pricing</Link>
          <Link href="/app">Studio</Link>
          <a href="mailto:hello@billforge.app">Contact</a>
        </div>
      </div>
    </footer>
  );
}
