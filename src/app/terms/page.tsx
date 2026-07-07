import LegalNoticePage from "@/components/legal/LegalNoticePage";

export const metadata = { title: "Terms of Service | LWYRD" };

export default function TermsPage() {
  return (
    <LegalNoticePage title="Terms of Service" updated="July 6, 2026">
      <p>
        LWYRD provides a matching and referral platform that helps users find
        independent law firms. LWYRD is not a law firm and does not provide
        legal advice, legal opinions, or representation.
      </p>
      <p>
        Use of the site does not create an attorney-client relationship with
        LWYRD or with any listed firm. Any legal engagement is between you and
        the independent law firm you choose to contact or hire.
      </p>
      <p>
        By using LWYRD, you agree to provide accurate information and to use the
        platform only for lawful purposes.
      </p>
    </LegalNoticePage>
  );
}
