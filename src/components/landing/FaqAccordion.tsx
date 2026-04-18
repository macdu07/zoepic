"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { StaggerContainer, StaggerItem } from "@/components/core/AnimatedSection";

interface FaqItem {
  question: string;
  answer: string;
}

export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <StaggerContainer className="space-y-3" staggerDelay={0.07} delay={0.05}>
      {items.map((faq, index) => (
        <StaggerItem key={index} variant="fadeLeft">
          <div className="border border-border/50 rounded-xl bg-card/40 backdrop-blur-sm overflow-hidden">
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-primary/5 transition-colors"
              aria-expanded={openIndex === index}
            >
              <span className="text-sm font-semibold pr-4">{faq.question}</span>
              <ChevronRight
                className={`h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform duration-200 ${
                  openIndex === index ? "rotate-90" : ""
                }`}
                aria-hidden="true"
              />
            </button>
            {openIndex === index && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
}
