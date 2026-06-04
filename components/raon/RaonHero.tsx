export default function RaonHero() {
  return (
    <section className="raon-hero">
      <div className="raon-hero-card">
        <div className="doodles" aria-hidden="true">
          <svg
            className="doodle-star"
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
          >
            <path
              d="M16 2 L19 13 L30 16 L19 19 L16 30 L13 19 L2 16 L13 13 Z"
              fill="#F26B3A"
              stroke="#161616"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
          <svg
            className="doodle-spark"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M12 2 V8 M12 16 V22 M2 12 H8 M16 12 H22"
              stroke="#161616"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          </svg>
          <svg
            className="doodle-heart"
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
          >
            <path
              d="M14 24 C14 24 4 17 4 10.5 C4 7 7 5 9.5 5 C11.5 5 13 6 14 7.5 C15 6 16.5 5 18.5 5 C21 5 24 7 24 10.5 C24 17 14 24 14 24 Z"
              fill="#FFD7D7"
              stroke="#161616"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className="raon-hero-text">
          <div className="raon-hello">
            <span className="pulse" />안녕! 만나서 반가워요
          </div>
          <h1 className="raon-name">
            <span className="script">라온</span>이에요
          </h1>
          <p className="raon-tagline">
            저는 MONTRA의 글로벌 트렌드 탐험가예요. 매주 25개국을 돌며 새로운 트렌드를 모아오죠.
            오늘은 어디부터 같이 가볼까요?
          </p>
          <div className="raon-meta">
            <span className="chip">
              <span className="dot" />Curious Explorer
            </span>
            <span className="chip mint">
              <span className="dot" />Trend Tracker
            </span>
            <span className="chip sky">
              <span className="dot" />K-Curator
            </span>
            <span className="chip pink">
              <span className="dot" />Always-On
            </span>
          </div>
          <div className="raon-stats-mini">
            <div className="stat">
              <div className="num">25</div>
              <div className="lbl">Countries</div>
            </div>
            <div className="stat">
              <div className="num">7d</div>
              <div className="lbl">Refresh Cycle</div>
            </div>
            <div className="stat">
              <div className="num">∞</div>
              <div className="lbl">Curiosity</div>
            </div>
          </div>
        </div>

        <div className="raon-portrait">
          <div className="frame-bg" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="fox-main"
            src="/montra-assets/fox-happy.png"
            alt="라온이"
          />
          <div className="speech">반가워요! 🎒</div>
          <div className="badge-floaty b1">🌏 25개국 담당</div>
          <div className="badge-floaty b2">⚡ 매주 갱신</div>
          <div className="badge-floaty b3">🦊 MBTI: ENFP</div>
        </div>
      </div>
    </section>
  );
}
