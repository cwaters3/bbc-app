import { getCurrentCycle } from '@/lib/cycles';
import TopNav from '../top-nav';
import RulesAccordion from './accordion';
import { RULE_SECTIONS } from './content';

export const dynamic = 'force-dynamic';

export default async function RulesPage() {
  const cycle = await getCurrentCycle();

  return (
    <div>
      <div className="text-center pt-6 px-5">
        <h1 className="font-display text-moss-dark text-[34px]">The Boys Book Club</h1>
      </div>
      <TopNav active="Rules" chapterNumber={cycle?.cycleNumber} />

      <div className="max-w-xl mx-auto px-4 py-5 pb-14">
        <RulesAccordion sections={RULE_SECTIONS} defaultOpenIndex={0} />
      </div>
    </div>
  );
}
