export default function StayTunedCallout() {
  return (
    <div className="bg-[#0A0F1C] py-14 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Thin rule above */}
        <div className="border-t border-[#1F2A3D] mb-10" />

        {/* Editorial text */}
        <div className="text-center">
          <p
            className="text-[#E6EAF2] tracking-widest text-4xl sm:text-5xl"
            style={{ fontFamily: '"Lora", Georgia, serif', fontWeight: 400 }}
          >
            Stay Tuned
          </p>

          {/* Decorative divider */}
          <div className="flex items-center justify-center gap-3 mt-4">
            <div className="h-px w-12 bg-white/50" />
            <div className="w-2.5 h-2.5 rounded-full border border-[#002452]/40" />
            <div className="h-px w-12 bg-white/50" />
          </div>
        </div>
      </div>
    </div>
  );
}
