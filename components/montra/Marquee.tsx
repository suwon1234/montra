const items = [
  { kr: '마라샹궈 컵', lang: 'KR → JP' },
  { kr: '한국 떡볶이 컵누들', lang: 'KR → US' },
  { kr: '콜드브루 농축액', lang: 'KR → CN' },
  { kr: '할랄 한식 도시락', lang: 'ID 국내' },
  { kr: '한식 핫소스', lang: 'GB 국내' },
  { kr: 'K-뷰티 마스크팩 묶음', lang: 'BR 국내' },
  { kr: '한국식 카페 디저트', lang: 'TH 국내' },
  { kr: '한국 라면 매운맛', lang: 'MX 국내' },
];

export default function Marquee() {
  const all = [...items, ...items];
  return (
    <div className="mt-marquee">
      <div className="track">
        {all.map((it, i) => (
          <div key={i} className="item">
            <span className="dot" />
            <span>{it.kr}</span>
            <span className="lang">{it.lang}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
