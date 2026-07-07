import LegalNoticePage from "@/components/legal/LegalNoticePage";

export const metadata = { title: "Privacy Policy | LWYRD" };

export default function PrivacyPage() {
  return (
    <LegalNoticePage title="Privacy Policy" updated="July 6, 2026">
      <p>
        LWYRD uses account, intake, and usage information to provide legal
        matching, maintain platform security, improve the service, and respond
        to support requests.
      </p>
      <p>
        Intake answers are used to generate matches and are not shared with law
        firms unless you choose to contact a firm or otherwise ask LWYRD to make
        an introduction.
      </p>
      <p>
        For privacy questions or deletion requests, contact the LWYRD team
        through the contact page.
      </p>
    </LegalNoticePage>
  );
}
