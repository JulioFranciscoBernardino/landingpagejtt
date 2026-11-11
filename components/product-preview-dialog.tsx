"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ProductPreviewImage = {
  src: string;
  /** Intrinsic dimensions of the source file — avoids layout shift. */
  width: number;
  height: number;
  alt: string;
  label: string;
};

type ProductPreviewDialogProps = {
  images: ProductPreviewImage[];
  productName: string;
  expandLabel: string;
  closeLabel: string;
  screensLabel: string;
  screensShort: string;
  previousLabel: string;
  nextLabel: string;
};

/**
 * ProductPreviewDialog — thumbnail button that expands system screenshots
 * into an accessible lightbox. Single images open directly; products with
 * multiple screens get thumbnails and arrow-key navigation.
 */
export function ProductPreviewDialog({
  images,
  productName,
  expandLabel,
  closeLabel,
  screensLabel,
  screensShort,
  previousLabel,
  nextLabel,
}: ProductPreviewDialogProps) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  // Portal target only exists on the client — subscribe-free store that is
  // false during SSR/hydration and true afterwards (no setState-in-effect).
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const reduce = useReducedMotion();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const multiple = images.length > 1;
  const cover = images[0];
  const current = images[Math.min(active, images.length - 1)];

  const close = useCallback(() => setOpen(false), []);
  const openDialog = useCallback(() => {
    setActive(0);
    setOpen(true);
  }, []);
  const go = useCallback(
    (step: number) => {
      setActive((index) => (index + step + images.length) % images.length);
    },
    [images.length],
  );

  // Escape closes, arrows navigate; body scroll locks while open.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const trigger = triggerRef.current;
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      trigger?.focus();
    };
  }, [open, close, go]);

  const duration = reduce ? 0 : 0.25;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={openDialog}
        aria-haspopup="dialog"
        aria-label={`${expandLabel} — ${productName}${multiple ? ` (${images.length} ${screensShort})` : ""}`}
        className="group relative block aspect-[16/10] w-full cursor-zoom-in focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4F7CFF]"
      >
        <Image
          src={cover.src}
          alt={cover.alt}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          quality={85}
          className="object-cover object-top"
        />
        <span
          aria-hidden="true"
          className="absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-[#050505]/85 px-3 py-1.5 text-[11px] tracking-wider text-white uppercase opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
        >
          <Expand size={13} />
          {expandLabel}
        </span>
        {multiple ? (
          <span
            aria-hidden="true"
            className="absolute top-3 left-3 inline-flex items-center rounded-full border border-white/15 bg-[#050505]/85 px-2.5 py-1 text-[11px] font-medium tracking-wider text-white backdrop-blur-sm"
          >
            {images.length} {screensShort}
          </span>
        ) : null}
      </button>

      {/* Portalled to <body>: ancestors use transform/filter for scroll
          reveals, which would trap a nested `fixed` overlay inside the
          card's stacking context (broken position, siblings painting above). */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-label={`${productName} — ${screensLabel}`}
                onClick={close}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration }}
                className="fixed inset-0 z-[100] flex cursor-zoom-out items-center justify-center bg-[#050505]/90 p-4 backdrop-blur-sm sm:p-8"
              >
                <motion.figure
                  onClick={(e) => e.stopPropagation()}
                  initial={reduce ? undefined : { scale: 0.96, y: 12 }}
                  animate={reduce ? undefined : { scale: 1, y: 0 }}
                  exit={reduce ? undefined : { scale: 0.98, y: 8 }}
                  transition={{ duration }}
                  className="relative flex max-h-full w-fit max-w-full cursor-default flex-col"
                >
                  <div className="relative w-fit max-w-full">
                    <Image
                      src={current.src}
                      alt={current.alt}
                      width={current.width}
                      height={current.height}
                      sizes="90vw"
                      quality={95}
                      priority
                      className={cn(
                        "h-auto w-auto max-w-[92vw] rounded-xl border border-[#242424] object-contain shadow-[0_32px_80px_-24px_rgba(79,124,255,0.4)]",
                        multiple ? "max-h-[64vh]" : "max-h-[82vh]",
                      )}
                    />
                    {multiple ? (
                      <>
                        <button
                          type="button"
                          onClick={() => go(-1)}
                          aria-label={previousLabel}
                          className="absolute top-1/2 left-3 inline-flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-[#050505]/85 text-white backdrop-blur-sm transition-colors hover:border-[#4F7CFF]/50 hover:bg-[#1c1c1c] focus-visible:outline-2 focus-visible:outline-[#4F7CFF]"
                        >
                          <ChevronLeft size={20} />
                        </button>
                        <button
                          type="button"
                          onClick={() => go(1)}
                          aria-label={nextLabel}
                          className="absolute top-1/2 right-3 inline-flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-[#050505]/85 text-white backdrop-blur-sm transition-colors hover:border-[#4F7CFF]/50 hover:bg-[#1c1c1c] focus-visible:outline-2 focus-visible:outline-[#4F7CFF]"
                        >
                          <ChevronRight size={20} />
                        </button>
                      </>
                    ) : null}
                  </div>

                  <figcaption className="font-technical mt-3 text-center text-xs tracking-[0.2em] text-[#8A8A8A] uppercase">
                    {productName}
                    {current.label ? ` · ${current.label}` : ""}
                  </figcaption>
                  <p aria-live="polite" className="sr-only">
                    {current.label}
                  </p>

                  {multiple ? (
                    <div
                      role="group"
                      aria-label={screensLabel}
                      className="mt-4 flex max-w-[92vw] snap-x gap-2 overflow-x-auto pb-1"
                    >
                      {images.map((image, index) => (
                        <button
                          key={image.src}
                          type="button"
                          onClick={() => setActive(index)}
                          aria-label={image.label}
                          aria-pressed={index === active}
                          className={cn(
                            "relative aspect-[16/10] w-20 shrink-0 cursor-pointer snap-start overflow-hidden rounded-md border transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4F7CFF]",
                            index === active
                              ? "border-[#4F7CFF] opacity-100"
                              : "border-[#242424] opacity-60 hover:opacity-100",
                          )}
                        >
                          <Image
                            src={image.src}
                            alt=""
                            fill
                            sizes="80px"
                            quality={60}
                            className="object-cover object-top"
                          />
                        </button>
                      ))}
                    </div>
                  ) : null}

                  <button
                    ref={closeRef}
                    type="button"
                    onClick={close}
                    aria-label={closeLabel}
                    className="absolute -top-3 -right-3 inline-flex size-9 cursor-pointer items-center justify-center rounded-full border border-[#242424] bg-[#141414] text-white transition-colors hover:border-[#4F7CFF]/50 hover:bg-[#1c1c1c] focus-visible:outline-2 focus-visible:outline-[#4F7CFF]"
                  >
                    <X size={16} />
                  </button>
                </motion.figure>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
