import RFade from './RFade';

interface Mood {
  num: string;
  img: string;
  label: string;
  when: string;
}

const MOODS: Mood[] = [
  { num: '01', img: 'fox-happy', label: '신난 라온', when: '새 트렌드를 발견했을 때' },
  { num: '02', img: 'fox-surprised', label: '깜짝 라온', when: '엄청난 트렌드를 발견했을 때' },
  { num: '03', img: 'fox-thinking', label: '고민 라온', when: '어떻게 정리할지 고민할 때' },
  { num: '04', img: 'fox-excited', label: '들뜬 라온', when: '한국에 들어올 만한 걸 찾았을 때' },
  { num: '05', img: 'fox-winking', label: '윙크 라온', when: '여러분께 살짝 귀띔할 때' },
  { num: '06', img: 'fox-confused', label: '갸우뚱 라온', when: '데이터가 애매할 때' },
];

export default function MoodBoard() {
  return (
    <section className="raon-section">
      <RFade>
        <div className="raon-section-eyebrow">Raon&apos;s Mood Board</div>
        <h2 className="raon-section-title">
          여섯 가지 표정으로 만나는 <span className="hl">라온이</span>
        </h2>
        <p className="raon-section-sub">
          라온이는 매주 다양한 표정으로 여러분과 만나요. 기분에 따라 어떤 트렌드를 가져오는지 살짝 엿볼까요?
        </p>
      </RFade>
      <div className="mood-grid">
        {MOODS.map((m, i) => (
          <RFade key={m.num} delay={i * 70}>
            <div className="mood-card">
              <div className="mood-num">{m.num}</div>
              <div className="face">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/montra-assets/${m.img}.png`} alt={m.label} />
              </div>
              <div className="mood-label">{m.label}</div>
              <div className="mood-when">{m.when}</div>
            </div>
          </RFade>
        ))}
      </div>
    </section>
  );
}
