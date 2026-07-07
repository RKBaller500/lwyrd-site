import Link from "next/link";
import Image from "next/image";

/**
 * Shared marketing/site footer — React reproduction of the new_designs footer.
 * Styled by the design CSS (inline on ported pages, or lwyrd-ds.css on
 * hand-built redesigned pages).
 */
export default function MarketingFooter() {
  return (
    <footer>
      <div className="wrap">
        <div className="foot-grid">
          <div className="foot-brand">
            <Link href="/" className="brand" aria-label="LWYRD home">
              <Image
                src="/marketing/Logos/LWYRD_White.png"
                alt="LWYRD"
                width={140}
                height={26}
                className="brand-logo"
                style={{ width: 140, height: "auto" }}
              />
            </Link>
            <p>
              The trusted front door to legal help, matching people and
              businesses to vetted law firms.
            </p>
          </div>

          <div className="foot-col">
            <h4>Product</h4>
            <Link href="/product/matching">Matching</Link>
            <Link href="/product/consultations">Consultations</Link>
            <a href="#" aria-disabled="true" className="soon-disabled" tabIndex={-1}>
              LWYRD Chatbot (Soon)
            </a>
          </div>

          <div className="foot-col">
            <h4>Clients</h4>
            <Link href="/clients/startups">Startups</Link>
            <Link href="/clients/smbs">SMBs</Link>
            <Link href="/clients/individuals">Individuals</Link>
          </div>

          <div className="foot-col">
            <h4>Company</h4>
            <Link href="/for-law-firms">Law Firms</Link>
            <Link href="/about">About Us</Link>
            <Link href="/blog">Blog</Link>
          </div>

          <div className="foot-col">
            <h4>Help Center</h4>
            <Link href="/faq">FAQ</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </div>

        <div className="foot-legal">
          <p className="foot-disclaimer">
            LWYRD is not a law firm and does not provide legal advice, legal
            opinions, or representation. LWYRD provides a matching and referral
            service that connects users with independent law firms. Use of this
            site does not create an attorney-client relationship. LWYRD may
            receive a referral fee from partner law firms in connection with
            matched engagements, in accordance with applicable rules of
            professional conduct. This site may constitute attorney advertising.
            Prior results do not guarantee a similar outcome.
          </p>
          <div className="foot-bottom">
            <span>© 2026 LWYRD. All rights reserved.</span>
            <div className="fb-links">
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms</Link>
              <Link href="/disclosures">Disclosures</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
