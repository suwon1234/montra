import Link from 'next/link';
import RFade from './RFade';

export default function CTAFooter() {
  return (
    <section className="raon-cta-footer">
      <RFade>
        <div className="cta-panel">
          <div>
            <h3>
              이번 주 트렌드,
              <br />
              <span className="accent">라온이랑 같이 보러</span> 갈까요?
            </h3>
            <p>매주 갱신되는 25개국 트렌드를 라온이가 정리해서 보여드려요.</p>
          </div>
          <Link className="btn" href="/">
            트렌드 보러 가기 <span>→</span>
          </Link>
        </div>
      </RFade>
    </section>
  );
}
