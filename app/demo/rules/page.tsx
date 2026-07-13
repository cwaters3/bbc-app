import Link from 'next/link';
import TopNav from '../../top-nav';
import RulesAccordion from '../../rules/accordion';
import { RULE_SECTIONS } from '../../rules/content';
import { DEMO_CLUB_NAME, DEMO_CHAPTER_NUMBER } from '@/lib/demo/fixtures';

export default function DemoRulesPage() {
  return (
    <div>
      <div className="bg-apricot-tint text-apricot-dark text-center text-xs font-semibold py-1.5">
        🎭 Demo — fictional data, nothing here is saved
      </div>
      <div className="text-center pt-6 px-5">
        <h1 className="font-display text-moss-dark text-[34px]">{DEMO_CLUB_NAME}</h1>
      </div>
      <TopNav active="Rules" chapterNumber={DEMO_CHAPTER_NUMBER} basePath="/demo" />

      <div className="max-w-xl mx-auto px-4 py-5 pb-14">
        <RulesAccordion sections={RULE_SECTIONS} defaultOpenIndex={0} />

        <div className="mt-8 pt-4 border-t border-border flex items-center justify-between">
          <span className="text-xs text-muted-2">Demo mode</span>
          <Link href="/login" className="text-xs font-semibold text-moss-dark">
            Exit demo →
          </Link>
        </div>
      </div>
    </div>
  );
}
