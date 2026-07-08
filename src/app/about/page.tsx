"use client";

import "@/styles/lwyrd-ds.css";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import MarketingNav from "@/components/marketing/MarketingNav";
import MarketingFooter from "@/components/marketing/MarketingFooter";

const ease = [0.25, 0.46, 0.45, 0.94] as const;

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.58, ease } },
};

const beat = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
};

// Real headshots can drop in later at /marketing/Photos/<file> — set `photo`
// on a founder and the monogram falls back automatically.
const founders = [
  { name: "Jai Malhotra", role: "Co-Founder", initials: "JM", photo: "" },
  { name: "Aidan Berkeley", role: "Co-Founder", initials: "AB", photo: "" },
  { name: "Rahul Kochar", role: "Co-Founder", initials: "RK", photo: "" },
];

export default function AboutPage() {
  return (
    <div className="lwyrd-ds ds-page about-page">
      <MarketingNav current="about" />
      <main className="ds-main">
        {/* ── Hero: faces + thesis ── */}
        <section className="about-beat about-hero">
          <div className="ds-shell about-wrap">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease }}
              className="about-hero-inner"
            >
              <span className="marketing-eyebrow">Our story</span>
              <h1>
                We built LWYRD because finding the right lawyer shouldn&apos;t be
                this hard.
              </h1>
              <p className="about-lede">
                Three of us, building together since high school, who kept
                running into the same broken problem until we decided to fix it.
              </p>
            </motion.div>

            <motion.div
              className="about-founders"
              variants={container}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
            >
              {founders.map((f) => (
                <motion.div key={f.name} variants={item} className="about-founder">
                  <div className="about-founder-photo">
                    {f.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={f.photo} alt={f.name} />
                    ) : (
                      <span aria-hidden="true">{f.initials}</span>
                    )}
                  </div>
                  <p className="about-founder-name">{f.name}</p>
                  <p className="about-founder-role">{f.role}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── The note ── */}
        <section className="about-beat about-note">
          <div className="ds-shell about-wrap about-note-wrap">
            <motion.div
              variants={beat}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              className="about-note-block"
            >
              <h2>This started with a squash club.</h2>
              <p>
                It was the place our high school team practiced, the kind of
                neighborhood spot run by people who had poured everything into
                it. We knew them. So when we found out that businesses like
                theirs were owed money through a legal settlement, real money
                that could change things for them, we brought it to them. They
                had no idea it existed. Nobody had ever told them. People had
                approached them before, claiming to want to help, but never in a
                way that actually got them anywhere. We did it differently, and
                it worked.
              </p>
              <p>
                That cracked something open. We started seeing the same thing
                everywhere. Small businesses, local operators, people who were
                owed things or protected by things, with no clear path to the
                legal help that would get them there. The problem was never a
                shortage of lawyers. It was that the right lawyer and the person
                who needed them almost never found each other. It was a matching
                problem. And when the match happened, it changed everything.
              </p>
              <p>
                So we spent the next stretch of our lives connecting people to
                the right legal help, one situation at a time. It taught us the
                shape of the problem from the inside. But it also showed us we
                were only solving a narrow slice of something much bigger.
              </p>
            </motion.div>

            <motion.div
              variants={beat}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              className="about-note-block"
            >
              <h2>Then we tried to start LWYRD, and we became the customer.</h2>
              <p>
                We needed a lawyer to form the company. It should have been
                simple. It wasn&apos;t. We were referred to a lawyer in the wrong
                state, then another one, also the wrong state. Then someone who
                didn&apos;t practice the kind of law we needed at all. Then attorneys
                quoting five hundred dollars an hour, then two thousand, for a
                matter that needed neither. One wanted to bill by the hour for
                something we wanted done at a fixed price. Every referral came
                from someone who meant well. Not one of them was right, and
                finding the one that was cost us weeks and real money.
              </p>
              <p>
                We had just spent a long time helping other people find the legal
                help they couldn&apos;t find on their own, and here we were, stuck in
                the exact same maze. That was the moment it became undeniable. So
                we built the thing we wished we&apos;d had.
              </p>
            </motion.div>

            <motion.div
              variants={beat}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              className="about-note-block"
            >
              <h2>LWYRD is that thing.</h2>
              <p>
                You tell us your situation in plain terms, and we match you to
                the firms actually built for it, with the reasons each one fits
                and everything you need to reach out. No sorting through
                directories. No guessing. No paying two thousand an hour for
                something that needed two hundred. The right lawyer for what
                you&apos;re actually facing, found the way it should have been all
                along.
              </p>
              <p className="about-signoff">— Jai, Aidan, and Rahul</p>
            </motion.div>
          </div>
        </section>

        {/* ── Closing CTA ── */}
        <section className="about-beat about-cta">
          <div className="ds-shell about-wrap">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-70px" }}
              transition={{ duration: 0.6, ease }}
              className="navy-panel about-cta-panel"
            >
              <div className="about-cta-copy">
                <h2>Find the right lawyer for what you&apos;re facing.</h2>
                <p>
                  Tell us your situation in plain terms. About five minutes, no
                  legal jargon, no cost.
                </p>
              </div>
              <a href="/get-matched" className="btn about-cta-btn">
                Get matched <ArrowRight size={15} />
              </a>
            </motion.div>
          </div>
        </section>
      </main>
      <MarketingFooter />

      <style>{`
        .about-page{background:#fff}
        .about-beat{padding:var(--sec) 0}
        .about-wrap{max-width:var(--maxw);padding-top:0;padding-bottom:0}

        /* hero */
        .about-hero{padding-top:clamp(76px,10vw,124px);padding-bottom:clamp(52px,7vw,84px)}
        .about-hero-inner{max-width:920px}
        .about-hero-inner h1{font-size:clamp(2.15rem,4.6vw,3.7rem);line-height:1.06;margin:.75rem 0 0;max-width:20ch}
        .about-lede{color:var(--muted);font-size:1.1rem;line-height:1.62;margin-top:1.35rem;max-width:60ch}

        .about-founders{
          display:grid;
          grid-template-columns:1fr;
          gap:20px;
          margin-top:clamp(44px,6vw,72px);
        }
        .about-founder{display:flex;flex-direction:column;align-items:center;text-align:center}
        .about-founder-photo{
          width:clamp(128px,20vw,168px);
          height:clamp(128px,20vw,168px);
          border-radius:50%;
          overflow:hidden;
          display:flex;
          align-items:center;
          justify-content:center;
          background:var(--navy-tint);
          border:1px solid var(--navy-tint-2);
          box-shadow:var(--shadow-sm);
        }
        .about-founder-photo img{width:100%;height:100%;object-fit:cover}
        .about-founder-photo span{
          font-family:var(--display);
          font-size:clamp(2rem,3.4vw,2.7rem);
          color:var(--navy);
          letter-spacing:.02em;
        }
        .about-founder-name{
          font-family:var(--display);
          font-weight:700;
          color:var(--ink);
          font-size:1.12rem;
          line-height:1.25;
          margin-top:18px;
        }
        .about-founder-role{color:var(--muted);font-size:.9rem;margin-top:3px}

        /* the note */
        .about-note{background:var(--paper-alt);border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
        .about-note-wrap{max-width:720px}
        .about-note-block + .about-note-block{margin-top:clamp(40px,6vw,64px)}
        .about-note-block h2{
          font-size:clamp(1.5rem,3vw,2.15rem);
          line-height:1.16;
          max-width:22ch;
          margin-bottom:1.15rem;
        }
        .about-note-block p{
          color:var(--ink-2);
          font-size:1.075rem;
          line-height:1.75;
          max-width:66ch;
        }
        .about-note-block p + p{margin-top:1.25rem}
        .about-signoff{
          color:var(--muted)!important;
          font-family:var(--display);
          font-style:italic;
          font-size:1.05rem!important;
          margin-top:1.6rem!important;
        }

        /* cta */
        .about-cta-panel{
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:28px;
          padding:clamp(30px,4vw,48px);
        }
        .about-cta-copy h2{font-size:clamp(1.6rem,3vw,2.3rem);line-height:1.14;max-width:20ch}
        .about-cta-copy p{color:rgba(255,255,255,.72);font-size:1rem;line-height:1.6;margin-top:.85rem;max-width:48ch}
        .about-cta-btn{
          flex-shrink:0;
          background:#fff;
          color:var(--navy);
        }
        .about-cta-btn:hover{transform:translateY(-1px)}

        @media(min-width:760px){
          .about-founders{grid-template-columns:repeat(3,1fr);gap:clamp(24px,3vw,44px)}
        }
        @media(max-width:640px){
          .about-beat{padding:64px 0}
          .about-hero{padding-top:54px}
          .about-hero-inner h1{font-size:clamp(2rem,9vw,2.6rem)}
          .about-cta-panel{flex-direction:column;align-items:flex-start;gap:22px}
          .about-cta-btn{width:100%;justify-content:center}
        }
      `}</style>
    </div>
  );
}
