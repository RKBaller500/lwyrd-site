import ConsultationsClient from "./ConsultationsClient";

export const metadata = { title: "Consultations | LWYRD" };

export default function ConsultationsPage() {
  return <ConsultationsClient bookingUrl={process.env.NEXT_PUBLIC_CONSULTATION_BOOKING_URL ?? ""} />;
}
