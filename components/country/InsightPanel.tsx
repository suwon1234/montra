/* InsightPanel — 국가 맥락에 맞는 한국어 카피.
   KR과 그 외 두 갈래로 분기. 라온이 친근한 톤. */
import type { MontraMarket } from '@/lib/focus-markets';

interface InsightPanelProps {
  market: MontraMarket;
}

export default function InsightPanel({ market }: InsightPanelProps) {
  const isOrigin = market.code === 'kr';

  if (isOrigin) {
    return (
      <section className="c-insight">
        <div className="c-insight-grid">
          <div>
            <h3>
              이번 주 <span className="hl">한국</span> 트렌드는 뭐가 있을까요?
            </h3>
            <p>
              라온이가 매주 한국에서 직접 골라온 신호들이에요. 음식·패션·뷰티·챌린지까지
              한 주 사이에 의미 있게 움직인 항목만 카드에 담았어요.
            </p>
            <p>
              한국에서 새로 뜨는 건 다음 주 다른 나라에서 보일 수 있는 단서예요.
              그래서 라온이는 한국 안에서 자리 잡는 상품·메뉴·곡 단위를 가장 먼저
              챙겨봐요.
            </p>
          </div>
          <div className="quote-fox">
            <img src="/montra-assets/fox-thinking.png" alt="라온이" />
            <div className="quote-bubble">
              &ldquo;한국에서 뜨면
              <br />
              다른 나라에서도
              <br />
              곧 보이게 돼요!&rdquo;
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="c-insight">
      <div className="c-insight-grid">
        <div>
          <h3>
            라온이가 본 <span className="hl">{market.name_ko}</span>, 어떤
            분위기예요?
          </h3>
          <p>
            최근 {market.name_ko}에서 한국 콘텐츠와 K-푸드, K-뷰티 관련 신호가
            함께 늘고 있어요. 라온이가 매주 들여다보면서 의미 있게 움직인 것만
            추려 카드에 담아두었어요.
          </p>
          <p>
            현지에서 어떤 게 잘 받아들여지고 있는지, 어떤 카테고리가 빠르게
            자리잡고 있는지 알 수 있어요. 카드 상단의 점수가 높을수록 라온이가
            더 인상 깊게 본 트렌드예요.
          </p>
        </div>
        <div className="quote-fox">
          <img src="/montra-assets/fox-thinking.png" alt="라온이" />
          <div className="quote-bubble">
            &ldquo;{market.name_ko}는 라온이가
            <br />
            매주 들여다보는 곳!
            <br />
            신호 변화 놓치지 마세요&rdquo;
          </div>
        </div>
      </div>
    </section>
  );
}
