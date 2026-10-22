"use client";

import * as React from "react";
import { motion } from "framer-motion";

export function CampusEvolutionSection() {
  return (
    <section
      id="campus-evolution"
      className="bg-background text-foreground border-t border-border transition-colors relative overflow-hidden"
    >
      {/* ========================================================
          YEAR ONE — 2025 BLOCK
          ======================================================== */}
      <div className="min-h-[55vh] sm:min-h-[65vh] flex items-center py-20 sm:py-28 md:py-32 border-b border-border/70 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
            {/* Left: 2025 Big Outline Serif Numeral (Theme-adaptive currentColor stroke) */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5 select-none transform-gpu will-change-transform"
            >
              <div className="sticky top-28">
                <svg
                  className="w-full max-w-[320px] sm:max-w-[380px] lg:max-w-[420px] h-auto overflow-visible select-none text-foreground"
                  viewBox="0 0 320 120"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-label="2025"
                >
                  <text
                    x="0"
                    y="98"
                    fontFamily='Georgia, Cambria, "Times New Roman", Times, serif'
                    fontSize="120"
                    fontStyle="italic"
                    fontWeight="300"
                    letterSpacing="-0.03em"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    opacity="0.8"
                  >
                    2025
                  </text>
                </svg>
              </div>
            </motion.div>

            {/* Right: Year One Narrative & Bullets */}
            <motion.div
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-7 space-y-4 transform-gpu will-change-transform"
            >
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground">
                Year one — founded with the first batch
              </h3>

              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl pt-1">
                The college commenced its operations in 2025, welcoming its first batch of students and marking the beginning of a new academic chapter. The year focused on establishing academic foundations, encouraging learning, and fostering collaboration among students.
              </p>

              {/* Bullets (Exactly 2 items requested by user) */}
              <ul className="mt-8 pt-2 space-y-4 max-w-2xl">
                <motion.li
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-start gap-3 text-xs sm:text-sm text-muted-foreground leading-relaxed"
                >
                  <span className="text-muted-foreground/60 select-none font-light shrink-0">—</span>
                  <span>
                    Github workshops were done at IST alongside the college&apos;s first-ever batch
                  </span>
                </motion.li>

                <motion.li
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: 0.26, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-start gap-3 text-xs sm:text-sm text-muted-foreground leading-relaxed"
                >
                  <span className="text-muted-foreground/60 select-none font-light shrink-0">—</span>
                  <span>
                    First workshops run by mentors: Getting Started with Open Source, Web Development Bootcamp, and Git &amp; GitHub Workflows
                  </span>
                </motion.li>
              </ul>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ========================================================
          YEAR TWO — 2026 BLOCK (Appears on Scroll)
          ======================================================== */}
      <div className="min-h-[55vh] sm:min-h-[65vh] flex items-center py-20 sm:py-28 md:py-32 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
            {/* Left: 2026 Big Outline Serif Numeral (Theme-adaptive currentColor stroke) */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5 select-none transform-gpu will-change-transform"
            >
              <div className="sticky top-28">
                <svg
                  className="w-full max-w-[320px] sm:max-w-[380px] lg:max-w-[420px] h-auto overflow-visible select-none text-foreground"
                  viewBox="0 0 320 120"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-label="2026"
                >
                  <text
                    x="0"
                    y="98"
                    fontFamily='Georgia, Cambria, "Times New Roman", Times, serif'
                    fontSize="120"
                    fontStyle="italic"
                    fontWeight="300"
                    letterSpacing="-0.03em"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    opacity="0.8"
                  >
                    2026
                  </text>
                </svg>
              </div>
            </motion.div>

            {/* Right: Year Two Narrative & Bullets */}
            <motion.div
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-7 space-y-4 transform-gpu will-change-transform"
            >
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground">
                Year two — scaling campus open-source velocity
              </h3>

              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl pt-1">
                From first commits to production ecosystems. 2026 marks the launch of ZenithenOpen, genuine USN student verification, and competitive open-source leaderboards.
              </p>

              {/* Bullets for 2026 */}
              <ul className="mt-8 pt-2 space-y-4 max-w-2xl">
                <motion.li
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-start gap-3 text-xs sm:text-sm text-muted-foreground leading-relaxed"
                >
                  <span className="text-muted-foreground/60 select-none font-light shrink-0">—</span>
                  <span>
                    ZenithenOpen platform launched powering 80+ student developers across Computer Science, Information Science, and Electronics departments
                  </span>
                </motion.li>

                <motion.li
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: 0.26, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-start gap-3 text-xs sm:text-sm text-muted-foreground leading-relaxed"
                >
                  <span className="text-muted-foreground/60 select-none font-light shrink-0">—</span>
                  <span>
                    Direct campus repository gateways: ZenithenOpen and First-PR with curated Good First Issues and mentor pairing
                  </span>
                </motion.li>

                <motion.li
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: 0.34, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-start gap-3 text-xs sm:text-sm text-muted-foreground leading-relaxed"
                >
                  <span className="text-muted-foreground/60 select-none font-light shrink-0">—</span>
                  <span>
                    Student competition arena with automated PR scoring, weekly sprints, and verified First-PR milestone badges
                  </span>
                </motion.li>
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
