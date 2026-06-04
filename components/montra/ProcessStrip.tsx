import Reveal from './Reveal';

const steps = [
  {
    num: '01',
    title: '신호 자동 수집',
    desc: '25개국 커머스·소셜·검색 데이터에서 변화가 큰 항목을 추려옵니다.',
  },
  {
    num: '02',
    title: '알고리즘이 정렬',
    desc: '거래량·증가율·확산 속도를 점수화해 의미 있는 신호만 남겨요.',
  },
  {
    num: '03',
    title: '한국 맥락으로 변환',
    desc: '들어올 가능성·나갈 가능성을 한국 시장 기준으로 자동 분류합니다.',
  },
  {
    num: '04',
    title: '매주 자동 갱신',
    desc: '지난 주 식어버린 신호는 빠지고, 새로 뜨는 항목으로 교체돼요.',
  },
];

export default function ProcessStrip() {
  return (
    <section className="mt-process">
      <Reveal>
        <div className="mt-eyebrow">어떻게 작동하냐면요</div>
        <h2 className="mt-section-title">
          내가 설정한 알고리즘이,
          <br />
          <span style={{ color: 'var(--orange-300)' }}>매주 25개국</span>을 훑습니다
        </h2>
        <p className="mt-section-sub">
          뉴스·SNS·쇼핑·검색 트래픽을 동시에 보고, 한 주 사이에 의미 있게 움직인 신호만
          자동으로 추려서 보여드려요.
        </p>
      </Reveal>
      <div className="mt-process-grid">
        {steps.map((s, i) => (
          <Reveal key={s.num} delay={i * 80}>
            <div className="mt-process-step">
              <div className="num">{s.num}</div>
              <div className="title">{s.title}</div>
              <div className="desc">{s.desc}</div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
