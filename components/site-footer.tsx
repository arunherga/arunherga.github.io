import { ArrowUp } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="site-footer wrap">
      <div><span className="footer-name">Arun Balakrishna Bhat</span><span>© {new Date().getFullYear()} · Built with curiosity, shipped with care.</span></div>
      <a href="#top">Back to top <ArrowUp size={16} /></a>
    </footer>
  );
}
