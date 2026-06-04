/* CountryFooter — 원본 country-page.jsx 푸터를 Next.js Link로 변환 */
import Link from 'next/link';

export default function CountryFooter() {
  return (
    <footer className="c-footer">
      <h3>다른 나라도 궁금하세요?</h3>
      <p>라온이가 매주 25개국 트렌드를 골라드려요.</p>
      <Link href="/" className="btn">
        전체 25개국 보러가기
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </Link>
    </footer>
  );
}
