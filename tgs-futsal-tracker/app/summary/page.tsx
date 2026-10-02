"use client";

import { useEffect, useState } from "react";
import Confetti from "@/components/Confetti";

const AWARDS = [
  { icon: "⚽", label: "Top Scorer",    name: "Sajjad",  team: "Gregorian Thunders" },
  { icon: "🌟", label: "MVP",           name: "Yeasin",  team: "Warhawks De 19"     },
  { icon: "🧤", label: "Best Goalkeeper",name: "Maruf",  team: "Gregorian Thunders" },
  { icon: "🛡️", label: "Best Defender", name: "Jahid",   team: "Gregorian Thunders" },
];

export default function SummaryPage() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Slight delay so confetti fires after paint
    const t = setTimeout(() => setShow(true), 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="space-y-12 pb-12">
      {show && <Confetti />}

      {/* ── Champion banner ── */}
      <section
        className="rounded-none text-center py-14 px-6 border-4 border-amber -mx-4 sm:mx-0"
        style={{
          background:
            "linear-gradient(135deg, #0E2A3F 0%, #1F6A99 35%, #2C84B6 50%, #1F6A99 65%, #0E2A3F 100%)",
        }}
      >
        <p
          className="text-xs font-semibold tracking-[0.25em] uppercase mb-4"
          style={{ color: "#F2B705" }}
        >
          🏆 Gregorian Abdur Rahim Memorial Futsal Tournament 2026
        </p>

        <p className="text-amber font-display text-lg tracking-widest mb-2" style={{ color: "#F2B705" }}>
          CHAMPIONS
        </p>

        <h1
          className="font-display leading-none mb-3"
          style={{
            fontSize: "clamp(2.8rem, 8vw, 5.5rem)",
            background: "linear-gradient(135deg, #F2B705 0%, #FFE066 40%, #F2B705 70%, #D9A404 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
            color: "transparent",
            filter: "drop-shadow(0 2px 8px rgba(242,183,5,0.4))",
          }}
        >
          Gregorian Thunders
        </h1>

        <p className="text-4xl mb-6">⚡🏆⚡</p>

        <div
          className="inline-block border border-white/30 px-6 py-3 mt-2"
          style={{ background: "rgba(255,255,255,0.08)" }}
        >
          <p className="text-xs tracking-widest uppercase mb-1" style={{ color: "rgba(255,255,255,0.6)" }}>
            Runners-up
          </p>
          <p className="font-display text-2xl text-white">Warhawks De 19</p>
          <p className="text-lg mt-1">🥈</p>
        </div>
      </section>

      {/* ── Individual awards ── */}
      <section>
        <h2 className="font-display text-2xl text-ink text-center mb-6">
          Individual Awards
        </h2>

        <div className="grid sm:grid-cols-2 gap-4">
          {AWARDS.map((award, i) => (
            <div
              key={award.label}
              className="relative overflow-hidden border-l-4 p-5"
              style={{
                borderLeftColor: i % 2 === 0 ? "#2C84B6" : "#F2B705",
                background:
                  i % 2 === 0
                    ? "linear-gradient(135deg, #EEF5FA 0%, #FFFFFF 100%)"
                    : "linear-gradient(135deg, #FFF8E7 0%, #FFFFFF 100%)",
              }}
            >
              {/* large faded background icon */}
              <span
                aria-hidden="true"
                className="absolute right-4 top-2 text-6xl select-none pointer-events-none"
                style={{ opacity: 0.12 }}
              >
                {award.icon}
              </span>

              <p
                className="text-xs font-bold tracking-widest uppercase mb-2"
                style={{ color: i % 2 === 0 ? "#1F6A99" : "#8A6500" }}
              >
                {award.icon} {award.label}
              </p>
              <p className="font-display text-3xl text-ink leading-none">
                {award.name}
              </p>
              <p className="text-sm mt-1" style={{ color: "#5B6B62" }}>
                {award.team}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Memorial note ── */}
      <p className="text-center text-xs text-[#5B6B62] tracking-wide border-t border-[#D6E3EC] pt-6">
        In memory of Gregorian Abdur Rahim · Dbox Sports Complex, October 2, 2026
      </p>
    </div>
  );
}
