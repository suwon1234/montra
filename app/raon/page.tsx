import type { Metadata } from 'next';
import Link from 'next/link';
import RaonHero from '@/components/raon/RaonHero';
import MoodBoard from '@/components/raon/MoodBoard';
import StoryAndFacts from '@/components/raon/StoryAndFacts';
import Habits from '@/components/raon/Habits';
import CTAFooter from '@/components/raon/CTAFooter';
import './raon.css';

export const metadata: Metadata = {
  title: '라온 · MONTRA 글로벌 트렌드 탐험가',
  description:
    '라온이는 MONTRA의 글로벌 트렌드 탐험가예요. 매주 25개국을 돌며 새로운 트렌드를 모아옵니다.',
};

export default function RaonPage() {
  return (
    <div className="raon-page">
      <header className="raon-header">
        <Link className="raon-back" href="/">
          <span className="arrow">←</span>
          <span>메인으로</span>
        </Link>
        <div className="wordmark">MONTRA</div>
      </header>
      <RaonHero />
      <MoodBoard />
      <StoryAndFacts />
      <Habits />
      <CTAFooter />
    </div>
  );
}
