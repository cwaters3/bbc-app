'use client';

import { useState, type ReactNode } from 'react';

export type RuleSection = {
  title: string;
  subtitle?: string;
  content: ReactNode;
};

export default function RulesAccordion({
  sections,
  defaultOpenIndex = 0,
}: {
  sections: RuleSection[];
  defaultOpenIndex?: number | null;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(defaultOpenIndex);

  return (
    <div>
      {sections.map((section, i) => {
        const isOpen = openIndex === i;
        return (
          <div
            key={section.title}
            className="bg-card border border-border rounded-xl shadow-card mb-3 overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="w-full flex items-center gap-2.5 p-3.5 text-left"
              aria-expanded={isOpen}
            >
              <span className="flex-1">
                <span className="font-bold text-[14.5px] text-ink">{section.title}</span>
                {section.subtitle && (
                  <span className="block text-[11px] text-muted-2 font-semibold uppercase tracking-wide mt-0.5">
                    {section.subtitle}
                  </span>
                )}
              </span>
              <svg
                className={`flex-shrink-0 text-muted-2 transition-transform duration-200 ${
                  isOpen ? 'rotate-180' : ''
                }`}
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M6 9l6 6 6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            {isOpen && <div className="px-3.5 pb-4">{section.content}</div>}
          </div>
        );
      })}
    </div>
  );
}
