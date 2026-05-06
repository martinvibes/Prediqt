import Link from 'next/link';
import { QMark } from './q-mark';

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto max-w-[1280px] px-6 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <QMark size={20} />
            <span className="font-display text-xl tracking-crunch">prediqt</span>
            <span className="label-micro ml-3">v0.1 · sepolia testnet</span>
          </div>
          <div className="flex items-center gap-6 label-micro">
            <Link href="https://www.zama.ai/" target="_blank" className="hover:text-ink">
              Powered by Zama FHE
            </Link>
            <span className="text-ink-ghost">·</span>
            <span>Bet privately. With anyone. On anything.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
