"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { SectionHeading } from "@/components/section-heading";
import { Reveal } from "@/components/reveal";
import { ProductPreviewDialog } from "@/components/product-preview-dialog";
import { useLanguage } from "@/components/language-provider";

/**
 * Real system screenshots per product. Cards without an entry keep the
 * placeholder panel until their asset exists in public/. Products with
 * multiple screens open a gallery in the lightbox.
 */
type PreviewImage = {
  src: string;
  width: number;
  height: number;
  label: { pt: string; en: string };
};

const PREVIEWS: Record<string, { images: PreviewImage[] }> = {
  Vendono: {
    images: [
      { src: "/vendono.png", width: 1777, height: 885, label: { pt: "Visão geral", en: "Overview" } },
    ],
  },
  "Pode Deixar": {
    images: [
      {
        src: "/pode-deixar.png",
        width: 1861,
        height: 927,
        label: { pt: "Visão geral", en: "Overview" },
      },
    ],
  },
  AuAuAgenda: {
    images: [
      {
        src: "/auau-agenda-cliente.png",
        width: 1600,
        height: 1000,
        label: { pt: "Área do cliente", en: "Customer area" },
      },
      {
        src: "/auau-agenda-agendamento.png",
        width: 1600,
        height: 1000,
        label: { pt: "Novo agendamento", en: "New booking" },
      },
      {
        src: "/auau-agenda-gestao.png",
        width: 1600,
        height: 1000,
        label: { pt: "Agenda da gestão", en: "Staff schedule" },
      },
      {
        src: "/auau-agenda-servicos.png",
        width: 1600,
        height: 1000,
        label: { pt: "Catálogo de serviços", en: "Service catalog" },
      },
    ],
  },
};
/**
 * Products — JTT-owned systems.
 * Content-integrity rule: descriptions are grounded in the product docs;
 * no launch claims, metrics or availability beyond the documented status.
 */
export function Products() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { t, locale } = useLanguage();
  const copy = t.products;
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [0.94, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [80, 0]);
  const glowOpacity = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section id="products" aria-label="Products" className="relative scroll-mt-20 overflow-hidden bg-[#0D0D0D]">
      {/* travelling ambient glow */}
      <motion.div
        aria-hidden="true"
        style={reduce ? { opacity: 0 } : { opacity: glowOpacity }}
        className="pointer-events-none absolute -top-32 left-1/2 h-96 w-[60rem] -translate-x-1/2 rounded-full bg-[#4F7CFF]/10 blur-[120px]"
      />
      <div className="relative mx-auto w-full max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
        <SectionHeading
          index="05"
          eyebrow={copy.eyebrow}
          title={copy.title}
          description={copy.description}
          direction="down"
        />
        <motion.div
          ref={ref}
          style={reduce ? undefined : { scale, y }}
          className="mt-12 grid gap-5 md:grid-cols-2"
        >
          {copy.items.map((p, i) => {
            const status = "status" in p ? p.status : copy.inDevelopment;
            const price = "price" in p ? p.price : null;
            const href = "href" in p ? p.href : null;

            return (
              <Reveal key={p.name} direction="down" delay={i * 0.08} className="h-full">
                <article className="flex h-full flex-col rounded-2xl border border-[#242424] bg-[#141414] p-8 transition-colors duration-500 hover:border-[#4F7CFF]/30">
                  <p className="font-technical inline-flex flex-wrap items-center gap-2 text-xs tracking-[0.2em] text-[#4F7CFF] uppercase">
                    {p.name}
                    <span className="text-[#8A8A8A]">· {p.tagline}</span>
                    <span className="rounded-full border border-[#4F7CFF]/40 bg-[#4F7CFF]/10 px-3 py-0.5 text-[11px] tracking-wider text-white normal-case">
                      {status}
                    </span>
                  </p>
                  <p className="mt-5 flex-1 text-sm leading-6 text-[#8A8A8A] sm:text-base sm:leading-7">
                    {p.text}
                  </p>
                  {price ? (
                    <p className="mt-6 flex items-baseline justify-between gap-4 border-t border-[#242424] pt-5">
                      <span className="font-technical text-[11px] tracking-[0.2em] text-[#8A8A8A] uppercase">
                        {copy.priceLabel}
                      </span>
                      <span className="font-display text-xl font-semibold tracking-tight text-white">
                        {price}
                      </span>
                    </p>
                  ) : null}
                  {/* System preview — real screenshot opens in a lightbox when available. */}
                  <div className="mt-8 overflow-hidden rounded-xl border border-[#242424] bg-[#0D0D0D]">
                    {(() => {
                      const preview = PREVIEWS[p.name];
                      return preview ? (
                        <ProductPreviewDialog
                          images={preview.images.map((image) => ({
                            src: image.src,
                            width: image.width,
                            height: image.height,
                            label: image.label[locale],
                            alt:
                              locale === "pt"
                                ? `Prévia do sistema ${p.name}: ${image.label.pt}`
                                : `${p.name} system preview: ${image.label.en}`,
                          }))}
                          productName={p.name}
                          expandLabel={copy.expandPreview}
                          closeLabel={copy.closePreview}
                          screensLabel={copy.screensLabel}
                          screensShort={copy.screensShort}
                          previousLabel={copy.previousScreen}
                          nextLabel={copy.nextScreen}
                        />
                      ) : (
                        <div
                          aria-hidden="true"
                          className="relative flex aspect-[16/10] items-center justify-center"
                          style={{
                            backgroundImage:
                              "radial-gradient(ellipse 70% 60% at 50% 40%, rgba(79,124,255,0.18), transparent 70%), repeating-linear-gradient(to right, rgba(255,255,255,0.05) 0 1px, transparent 1px 48px), repeating-linear-gradient(to bottom, rgba(255,255,255,0.04) 0 1px, transparent 1px 48px)",
                          }}
                        >
                          <span className="font-display text-5xl font-semibold tracking-tight text-white/15">
                            {p.name.charAt(0)}
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                  {href ? (
                    <Link
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${copy.openDemo} — ${p.name}`}
                      className="mt-4 inline-flex items-center gap-1.5 text-sm text-white underline-offset-4 hover:text-[#4F7CFF] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4F7CFF]"
                    >
                      {copy.openDemo} <ArrowUpRight size={15} />
                    </Link>
                  ) : null}
                </article>
              </Reveal>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
