import LegalNoticePage from "@/components/legal/LegalNoticePage";

export const metadata = { title: "Disclosures | LWYRD" };

export default function DisclosuresPage() {
  return (
    <LegalNoticePage title="Disclosures" updated="July 6, 2026">
      <p>
        LWYRD is not a law firm and does not provide legal advice, legal
        opinions, or representation. LWYRD connects users with independent law
        firms through a matching and referral service.
      </p>
      <p>
        LWYRD may receive a referral fee from partner law firms in connection
        with matched engagements, subject to applicable rules of professional
        conduct.
      </p>
      <p>
        This site may constitute attorney advertising. Prior results do not
        guarantee a similar outcome.
      </p>
    </LegalNoticePage>
  );
}
