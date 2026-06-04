import RFade from './RFade';

export default function StoryAndFacts() {
  return (
    <section className="raon-section">
      <RFade>
        <div className="raon-section-eyebrow">Profile · 자기소개</div>
        <h2 className="raon-section-title">저는 이런 친구예요</h2>
      </RFade>
      <div className="raon-story">
        <RFade delay={80}>
          <div className="story-card">
            <div className="label">Raon&apos;s Note</div>
            <p className="big-quote">
              &ldquo;안녕하세요, 라온이에요! 🦊
              <br />
              세계 곳곳에서 매주 <span className="accent">새로운 트렌드</span>가 톡톡 튀어나오고 있어요.
              <br />
              그걸 여러분과 <span className="accent">같이 탐험하는 게</span> 제 일이에요.
              <br />
              우리, 얼른 함께 가요!&rdquo;
            </p>
            <span className="signature">— 라온 🦊</span>
            <div className="pattern" />
          </div>
        </RFade>
        <RFade delay={160}>
          <div className="fact-card">
            <div className="fact-row">
              <span className="k">이름</span>
              <span className="v">
                라온 <span className="accent">/ Raon</span>
              </span>
            </div>
            <div className="fact-row">
              <span className="k">뜻</span>
              <span className="v">즐거운 (순우리말)</span>
            </div>
            <div className="fact-row">
              <span className="k">출생</span>
              <span className="v">2026, 경기도 화성시</span>
            </div>
            <div className="fact-row">
              <span className="k">직업</span>
              <span className="v">글로벌 트렌드 탐험가</span>
            </div>
            <div className="fact-row">
              <span className="k">담당 영역</span>
              <span className="v">25개국 · 7일 주기</span>
            </div>
            <div className="fact-row">
              <span className="k">좋아하는 것</span>
              <span className="v">
                망고 🥭 <span className="accent">최애!</span>
              </span>
            </div>
          </div>
        </RFade>
      </div>
    </section>
  );
}
