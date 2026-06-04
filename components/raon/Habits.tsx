import RFade from './RFade';

interface Habit {
  e: string;
  h: string;
  d: string;
}

const HABITS: Habit[] = [
  { e: '🌍', h: '월요일 — 세계 한 바퀴', d: '25개국 데이터에서 변화가 큰 항목부터 훑어봐요.' },
  { e: '🔍', h: '화·수 — 트렌드 검증', d: '급등한 키워드가 진짜 의미 있는지 점수로 정렬합니다.' },
  { e: '📓', h: '목 — 한국 맥락 정리', d: '한국 시장에서 어떻게 읽힐지 한국어로 풀어 적어요.' },
  { e: '📬', h: '금 — 매주 발행', d: '정리한 트렌드를 카드로 만들어서 여러분께 전달!' },
];

export default function Habits() {
  return (
    <section className="raon-section">
      <RFade>
        <div className="raon-section-eyebrow">A Week with Raon</div>
        <h2 className="raon-section-title">
          라온이의 <span className="hl">일주일</span>
        </h2>
        <p className="raon-section-sub">
          매주 같은 리듬으로 움직여요. 월요일 아침에 세계를 훑고, 금요일에 정리해서 여러분께 가져다 드려요.
        </p>
      </RFade>
      <div className="habits-wrap">
        {HABITS.map((t, i) => (
          <RFade key={i} delay={i * 80}>
            <div className="habit-tile">
              <div className="emoji-circle">{t.e}</div>
              <div className="h">{t.h}</div>
              <div className="d">{t.d}</div>
            </div>
          </RFade>
        ))}
      </div>
    </section>
  );
}
