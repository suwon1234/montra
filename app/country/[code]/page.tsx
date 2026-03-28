'use client';

import { use, useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  Globe,
  Search,
  Layers,
  ShoppingBag,
  Utensils,
  Tag,
  Trophy,
  TrendingUp,
  Sparkles,
  Flame,
  Bookmark,
  ChevronDown,
  ArrowRight,
  X,
} from 'lucide-react';
import MiniTrendChart from '@/components/MiniTrendChart';
import type { HeatStatus } from '@/lib/types';
import { useTrendHistory } from '@/hooks/useTrendHistory';

// ─── Country Themes (dark, per-nation accent colors) ──────────────────────
const COUNTRY_THEMES: Record<string, { primary: string; secondary: string; bg: string; glow: string }> = {
  US: { primary: '#3b82f6', secondary: '#ef4444', bg: '#020617', glow: 'rgba(59, 130, 246, 0.15)' },
  KR: { primary: '#f43f5e', secondary: '#8b5cf6', bg: '#09090b', glow: 'rgba(244, 63, 94, 0.15)' },
  JP: { primary: '#dc2626', secondary: '#ffffff', bg: '#0c0a09', glow: 'rgba(220, 38, 38, 0.15)' },
  FR: { primary: '#f59e0b', secondary: '#1d4ed8', bg: '#0a0a0a', glow: 'rgba(245, 158, 11, 0.15)' },
  GB: { primary: '#2563eb', secondary: '#b91c1c', bg: '#0f172a', glow: 'rgba(37, 99, 235, 0.15)' },
  DE: { primary: '#eab308', secondary: '#000000', bg: '#030712', glow: 'rgba(234, 179, 8, 0.15)' },
  CN: { primary: '#dc2626', secondary: '#f59e0b', bg: '#0c0a09', glow: 'rgba(220, 38, 38, 0.15)' },
  IT: { primary: '#059669', secondary: '#dc2626', bg: '#022c22', glow: 'rgba(5, 150, 105, 0.15)' },
  ES: { primary: '#dc2626', secondary: '#f59e0b', bg: '#0c0a09', glow: 'rgba(220, 38, 38, 0.15)' },
  BR: { primary: '#059669', secondary: '#f59e0b', bg: '#022c22', glow: 'rgba(5, 150, 105, 0.15)' },
  IN: { primary: '#ea580c', secondary: '#059669', bg: '#0a0a0a', glow: 'rgba(234, 88, 12, 0.15)' },
  AU: { primary: '#2563eb', secondary: '#f59e0b', bg: '#0f172a', glow: 'rgba(37, 99, 235, 0.15)' },
  TH: { primary: '#2563eb', secondary: '#dc2626', bg: '#0f172a', glow: 'rgba(37, 99, 235, 0.15)' },
  MX: { primary: '#059669', secondary: '#dc2626', bg: '#022c22', glow: 'rgba(5, 150, 105, 0.15)' },
  TR: { primary: '#dc2626', secondary: '#ffffff', bg: '#0c0a09', glow: 'rgba(220, 38, 38, 0.15)' },
  SA: { primary: '#059669', secondary: '#ffffff', bg: '#022c22', glow: 'rgba(5, 150, 105, 0.15)' },
  NL: { primary: '#ea580c', secondary: '#ffffff', bg: '#0a0a0a', glow: 'rgba(234, 88, 12, 0.15)' },
  SE: { primary: '#2563eb', secondary: '#f59e0b', bg: '#0f172a', glow: 'rgba(37, 99, 235, 0.15)' },
  NG: { primary: '#059669', secondary: '#ffffff', bg: '#022c22', glow: 'rgba(5, 150, 105, 0.15)' },
  ZA: { primary: '#059669', secondary: '#f59e0b', bg: '#022c22', glow: 'rgba(5, 150, 105, 0.15)' },
  EG: { primary: '#f59e0b', secondary: '#000000', bg: '#0a0a0a', glow: 'rgba(245, 158, 11, 0.15)' },
  NZ: { primary: '#000000', secondary: '#dc2626', bg: '#09090b', glow: 'rgba(0, 0, 0, 0.3)' },
  RU: { primary: '#2563eb', secondary: '#dc2626', bg: '#0f172a', glow: 'rgba(37, 99, 235, 0.15)' },
  CA: { primary: '#dc2626', secondary: '#ffffff', bg: '#0c0a09', glow: 'rgba(220, 38, 38, 0.15)' },
  AR: { primary: '#0ea5e9', secondary: '#f59e0b', bg: '#0c4a6e', glow: 'rgba(14, 165, 233, 0.15)' },
  PH: { primary: '#2563eb', secondary: '#dc2626', bg: '#0f172a', glow: 'rgba(37, 99, 235, 0.15)' },
  VN: { primary: '#dc2626', secondary: '#f59e0b', bg: '#0c0a09', glow: 'rgba(220, 38, 38, 0.15)' },
  SG: { primary: '#dc2626', secondary: '#ffffff', bg: '#0c0a09', glow: 'rgba(220, 38, 38, 0.15)' },
  TW: { primary: '#2563eb', secondary: '#dc2626', bg: '#0f172a', glow: 'rgba(37, 99, 235, 0.15)' },
  MY: { primary: '#2563eb', secondary: '#f59e0b', bg: '#0f172a', glow: 'rgba(37, 99, 235, 0.15)' },
  ID: { primary: '#dc2626', secondary: '#ffffff', bg: '#0c0a09', glow: 'rgba(220, 38, 38, 0.15)' },
  PK: { primary: '#059669', secondary: '#ffffff', bg: '#022c22', glow: 'rgba(5, 150, 105, 0.15)' },
  PL: { primary: '#dc2626', secondary: '#ffffff', bg: '#0c0a09', glow: 'rgba(220, 38, 38, 0.15)' },
  NO: { primary: '#dc2626', secondary: '#2563eb', bg: '#0c0a09', glow: 'rgba(220, 38, 38, 0.15)' },
  HK: { primary: '#dc2626', secondary: '#ffffff', bg: '#0c0a09', glow: 'rgba(220, 38, 38, 0.15)' },
  PT: { primary: '#059669', secondary: '#dc2626', bg: '#022c22', glow: 'rgba(5, 150, 105, 0.15)' },
  CH: { primary: '#dc2626', secondary: '#ffffff', bg: '#0c0a09', glow: 'rgba(220, 38, 38, 0.15)' },
  GR: { primary: '#2563eb', secondary: '#ffffff', bg: '#0f172a', glow: 'rgba(37, 99, 235, 0.15)' },
  AT: { primary: '#dc2626', secondary: '#ffffff', bg: '#0c0a09', glow: 'rgba(220, 38, 38, 0.15)' },
  IE: { primary: '#059669', secondary: '#ffffff', bg: '#022c22', glow: 'rgba(5, 150, 105, 0.15)' },
  AE: { primary: '#059669', secondary: '#ffffff', bg: '#022c22', glow: 'rgba(5, 150, 105, 0.15)' },
  IL: { primary: '#2563eb', secondary: '#ffffff', bg: '#0f172a', glow: 'rgba(37, 99, 235, 0.15)' },
  KE: { primary: '#059669', secondary: '#000000', bg: '#022c22', glow: 'rgba(5, 150, 105, 0.15)' },
};
const DEFAULT_THEME = { primary: '#8b5cf6', secondary: '#ffffff', bg: '#09090b', glow: 'rgba(139, 92, 246, 0.15)' };

// ─── Category definitions ─────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'all', label: 'All', icon: Layers },
  { id: 'fashion', label: 'Fashion', icon: ShoppingBag },
  { id: 'products', label: 'Products', icon: ShoppingBag },
  { id: 'food', label: 'Food', icon: Utensils },
  { id: 'brands', label: 'Brands', icon: Tag },
  { id: 'challenges', label: 'Challenges', icon: Trophy },
];

// ─── Category Emoji map ──────────────────────────────────────────────────
const CATEGORY_EMOJI: Record<string, string> = {
  fashion: '\uD83D\uDC57',
  products: '\uD83D\uDED2',
  food: '\uD83C\uDF7D\uFE0F',
  brands: '\uD83C\uDFF7\uFE0F',
  challenges: '\uD83D\uDD25',
};

// ─── Status color helpers ────────────────────────────────────────────────
function getStatusColor(status: string): string {
  const s = status === 'steady' ? 'stable' : status;
  if (s === 'rising') return '#22c55e';
  if (s === 'new') return '#a78bfa';
  return '#9ca3af'; // stable → gray
}

function getStatusBg(status: string): string {
  const s = status === 'steady' ? 'stable' : status;
  if (s === 'rising') return 'rgba(34,197,94,0.1)';
  if (s === 'new') return 'rgba(167,139,250,0.1)';
  return 'rgba(156,163,175,0.1)'; // stable → gray bg
}

// ─── Interfaces ───────────────────────────────────────────────────────────
interface PageProps {
  params: Promise<{ code: string }>;
}

interface ApiTrend {
  id: string;
  name: string;
  description: string;
  heat_score: number;
  heat_status: string;
  search_score: number;
  social_score: number;
  ecommerce_score: number;
  news_score: number;
  tags: string[];
  last_updated_at: string;
  country: { code: string; name_ko: string; name_en: string; flag_emoji: string };
  category: { slug: string; name_ko: string; name_en: string; emoji: string };
}

interface ApiCountry {
  code: string;
  name_ko: string;
  name_en: string;
  name_local?: string;
  flag_emoji: string;
  region?: string;
  rising_count: number;
  total_trends: number;
  top_trend?: string;
}

// ─── Utils ────────────────────────────────────────────────────────────────

function getPrice(tags: string[]): string {
  return tags.find(t => /[$\u20A9\u00A5\u00A3\u20AC\u0E3F\u20B9]|AED|R\$|kr|R\s/.test(t)) || '';
}

function getBrand(tags: string[]): string {
  return tags.find(t => !(/[$\u20A9\u00A5\u00A3\u20AC\u0E3F\u20B9]|AED|R\$|kr|R\s/.test(t)) && !t.startsWith('★')) || '';
}

function mapStatus(status: string): string {
  if (status === 'steady') return 'stable';
  return status;
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'rising') return <TrendingUp className="w-3 h-3" />;
  if (status === 'new') return <Sparkles className="w-3 h-3" />;
  return <Flame className="w-3 h-3" />;
}

function getCurrentMonth(): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const now = new Date();
  return `${months[now.getMonth()]} ${now.getFullYear()}`;
}

// ─── Main Component ───────────────────────────────────────────────────────

export default function CountryPage({ params }: PageProps) {
  const { code } = use(params);
  const upperCode = code.toUpperCase();
  const theme = COUNTRY_THEMES[upperCode] || DEFAULT_THEME;

  const [trends, setTrends] = useState<ApiTrend[]>([]);
  const [countries, setCountries] = useState<ApiCountry[]>([]);
  const [countryInfo, setCountryInfo] = useState<ApiCountry | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [countrySelectorOpen, setCountrySelectorOpen] = useState(false);
  const [selectedTrend, setSelectedTrend] = useState<ApiTrend | null>(null);
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [trendsRes, countriesRes] = await Promise.all([
          fetch(`/api/trends?country=${upperCode}&limit=100`),
          fetch('/api/countries'),
        ]);
        const trendsJson = await trendsRes.json();
        const countriesJson = await countriesRes.json();

        if (!cancelled) {
          setTrends(trendsJson.data ?? []);
          const allCountries = countriesJson.data ?? [];
          setCountries(allCountries);
          const found = allCountries.find((c: ApiCountry) => c.code === upperCode);
          setCountryInfo(found ?? null);
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [upperCode]);

  // Fetch real trend history data (batch, once per trend list)
  const trendIds = useMemo(() => trends.map(t => t.id), [trends]);
  const { historyMap } = useTrendHistory(trendIds);

  const toggleBookmark = useCallback((id: string) => {
    setBookmarked(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Filter + sort
  const filteredTrends = useMemo(() => {
    let result: ApiTrend[];

    if (activeCategory === 'all') {
      result = trends;
    } else {
      result = trends.filter(t => t.category.slug === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
      );
    }

    return result.sort((a, b) => b.heat_score - a.heat_score);
  }, [trends, activeCategory, searchQuery]);

  const risingCount = trends.filter(t => t.heat_status === 'rising').length;
  const avgVelocity = trends.length > 0
    ? Math.round(trends.reduce((sum, t) => sum + t.heat_score, 0) / trends.length)
    : 0;

  // Available categories from data
  const availableCategorySlugs = useMemo(() => {
    const slugs = new Set(trends.map(t => t.category.slug));
    return CATEGORIES.filter(c =>
      c.id === 'all' || slugs.has(c.id)
    );
  }, [trends]);

  // ─── Loading State ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.bg }}>
        <div className="text-center">
          <div
            className="w-12 h-12 border-2 border-white/10 rounded-full animate-spin mx-auto mb-4"
            style={{ borderTopColor: theme.primary }}
          />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
            Loading Intelligence
          </p>
        </div>
      </div>
    );
  }

  // ─── Not Found State ──────────────────────────────────────────────────
  if (!countryInfo && trends.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.bg }}>
        <div className="text-center">
          <h1 className="text-4xl font-serif italic text-white mb-4">Region Not Found</h1>
          <p className="text-white/40 text-sm mb-8">No trend intelligence available for this market.</p>
          <Link
            href="/"
            className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 hover:text-white transition-colors"
          >
            Back to MONTRA
          </Link>
        </div>
      </div>
    );
  }

  const countryName = countryInfo?.name_en || trends[0]?.country.name_en || upperCode;
  const flag = countryInfo?.flag_emoji || trends[0]?.country.flag_emoji || '';

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.bg }}>
      {/* ─── Sticky Header ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-black/40 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-14 flex items-center justify-between gap-4">
          {/* Left: Country selector + Logo */}
          <div className="flex items-center gap-4">
            {/* Country Selector */}
            <div className="relative">
              <button
                onClick={() => setCountrySelectorOpen(!countrySelectorOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
              >
                <Globe className="w-3.5 h-3.5 text-white/50" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">
                  {flag} {upperCode}
                </span>
                <ChevronDown className="w-3 h-3 text-white/30" />
              </button>

              {countrySelectorOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 max-h-80 overflow-y-auto bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl p-2 custom-scrollbar z-50">
                  {countries.map(c => (
                    <Link
                      key={c.code}
                      href={`/country/${c.code.toLowerCase()}`}
                      onClick={() => setCountrySelectorOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${
                        c.code === upperCode
                          ? 'bg-white/10'
                          : 'hover:bg-white/5'
                      }`}
                    >
                      <span className="text-lg">{c.flag_emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-white/80 truncate">{c.name_en}</div>
                        <div className="text-[9px] text-white/30">{c.total_trends} trends</div>
                      </div>
                      {c.code === upperCode && (
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.primary }} />
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Logo */}
            <Link href="/" className="hidden sm:flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
                MONTRA
              </span>
              <span className="text-white/10">|</span>
              <span className="text-[9px] font-medium text-white/25 tracking-wider">
                Vector: {upperCode}
              </span>
            </Link>
          </div>

          {/* Right: Search + Category filters */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search trends..."
                className="w-36 md:w-52 pl-9 pr-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-medium uppercase tracking-wider text-white/70 placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors"
              />
            </div>

            {/* Category Filters (desktop only) */}
            <div className="hidden lg:flex items-center gap-1">
              {availableCategorySlugs.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-200"
                  style={
                    activeCategory === cat.id
                      ? { color: theme.primary, backgroundColor: theme.primary + '15' }
                      : { color: 'rgba(255,255,255,0.35)' }
                  }
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile category filters */}
        <div className="lg:hidden border-t border-white/5">
          <div className="max-w-7xl mx-auto px-4 py-2 flex gap-1 overflow-x-auto scrollbar-hide">
            {availableCategorySlugs.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className="shrink-0 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-200"
                style={
                  activeCategory === cat.id
                    ? { color: theme.primary, backgroundColor: theme.primary + '15' }
                    : { color: 'rgba(255,255,255,0.35)' }
                }
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Click outside to close country selector */}
      {countrySelectorOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setCountrySelectorOpen(false)}
        />
      )}

      {/* ─── Hero Section ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Background glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full blur-[120px] animate-glow-pulse pointer-events-none"
          style={{ backgroundColor: theme.glow }}
        />

        <div className="relative max-w-7xl mx-auto px-4 md:px-8 pt-16 md:pt-24 pb-12 md:pb-16">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            {/* Left: Title */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30">
                  Market Pulse
                </div>
                <div className="w-12 h-px bg-white/10" />
                <div className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30">
                  {getCurrentMonth()}
                </div>
              </div>
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[100px] font-serif italic text-white leading-[0.9] tracking-tight">
                <span className="block">The Future</span>
                <span className="block" style={{ color: theme.primary }}>Of Culture</span>
              </h1>
              <div className="mt-6 flex items-center gap-3">
                <span className="text-3xl">{flag}</span>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
                  {countryName}
                </span>
              </div>
            </div>

            {/* Right: Stats counters */}
            <div className="flex gap-3">
              <div className="px-6 py-4 rounded-[32px] bg-white/[0.04] border border-white/10 backdrop-blur-sm">
                <div className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 mb-1">
                  Active Trends
                </div>
                <div className="text-3xl font-black text-white tabular-nums">
                  {filteredTrends.length}
                </div>
              </div>
              <div className="px-6 py-4 rounded-[32px] bg-white/[0.04] border border-white/10 backdrop-blur-sm">
                <div className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 mb-1">
                  Rising
                </div>
                <div className="text-3xl font-black tabular-nums" style={{ color: theme.primary }}>
                  {risingCount}
                </div>
              </div>
              <div className="hidden sm:block px-6 py-4 rounded-[32px] bg-white/[0.04] border border-white/10 backdrop-blur-sm">
                <div className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 mb-1">
                  Avg Score
                </div>
                <div className="text-3xl font-black text-white/60 tabular-nums">
                  {avgVelocity}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Trend Cards Grid ──────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 pb-20">
        {/* Curated Intelligence label + total count */}
        <div className="flex items-center gap-3 mb-8">
          <div className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30">
            Curated Intelligence
          </div>
          <div className="w-8 h-px bg-white/10" />
          <div className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20">
            {filteredTrends.length} trends
          </div>
        </div>

        {filteredTrends.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredTrends.map((trend, index) => {
              const rank = index + 1;
              const price = getPrice(trend.tags);
              const brand = getBrand(trend.tags);
              const displayStatus = mapStatus(trend.heat_status);
              const isBookmarked = bookmarked.has(trend.id);
              const catEmoji = CATEGORY_EMOJI[trend.category.slug] || trend.category.emoji;
              const statusColor = getStatusColor(trend.heat_status);
              const statusBg = getStatusBg(trend.heat_status);

              // ── Rank-based styling tiers ──
              const isHero = rank === 1;
              const isTop3 = rank >= 2 && rank <= 3;
              // rank >= 4 is default tier

              const cardMinH = isHero ? 'min-h-[480px]' : 'min-h-[420px]';
              const colSpan = isHero ? 'md:col-span-2' : '';
              const titleClass = isHero
                ? 'text-4xl md:text-5xl lg:text-6xl font-serif italic'
                : isTop3
                  ? 'text-3xl md:text-4xl font-serif italic'
                  : 'text-2xl font-serif';
              const descClamp = isHero ? 'line-clamp-4' : 'line-clamp-3';
              const rankSize = isHero ? 'text-[200px]' : isTop3 ? 'text-[140px]' : 'text-[100px]';
              const borderStyle = isHero
                ? { borderColor: theme.primary + '4D' } // ~30% opacity
                : isTop3
                  ? { borderColor: 'rgba(255,255,255,0.15)' }
                  : { borderColor: 'rgba(255,255,255,0.10)' };

              return (
                <div
                  key={trend.id}
                  className={`group relative rounded-[48px] bg-gradient-to-br from-white/[0.07] to-transparent border ${cardMinH} p-8 flex flex-col justify-between cursor-pointer transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:-translate-y-2 hover:border-white/20 ${colSpan}`}
                  style={{
                    ...borderStyle,
                    ...(isHero ? { boxShadow: `0 0 80px ${theme.glow}, 0 0 160px ${theme.glow}` } : {}),
                  }}
                  onClick={() => setSelectedTrend(trend)}
                >
                  {/* Rank watermark */}
                  <div className={`absolute top-6 right-8 ${rankSize} font-black text-white/[0.03] leading-none select-none pointer-events-none`}>
                    {String(rank).padStart(2, '0')}
                  </div>

                  {/* Hero: No.1 badge */}
                  {isHero && (
                    <div
                      className="absolute top-6 left-8 flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-[0.2em] border"
                      style={{
                        color: theme.primary,
                        borderColor: theme.primary + '55',
                        backgroundColor: theme.primary + '15',
                      }}
                    >
                      <span className="text-base">&#x1F3C6;</span>
                      No.1
                    </div>
                  )}

                  {/* Top section */}
                  <div className={isHero ? 'mt-12' : ''}>
                    {/* Badges */}
                    <div className="flex items-center gap-2 mb-5 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border"
                        style={{
                          color: theme.primary,
                          borderColor: theme.primary + '33',
                          backgroundColor: theme.primary + '10',
                        }}
                      >
                        {catEmoji} {trend.category.name_en}
                      </span>
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em]"
                        style={{
                          color: statusColor,
                          backgroundColor: statusBg,
                        }}
                      >
                        <StatusIcon status={trend.heat_status} />
                        {displayStatus}
                      </span>
                      {/* Challenge badge */}
                      {(trend.category.slug === 'challenges' || trend.tags.includes('challenge')) && (
                        <span
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em]"
                          style={{
                            color: '#f97316',
                            backgroundColor: 'rgba(249, 115, 22, 0.1)',
                          }}
                        >
                          {'\uD83D\uDD25'} Challenge
                        </span>
                      )}
                      {/* Price pill */}
                      {price && (
                        <span
                          className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold border"
                          style={{
                            color: theme.primary,
                            borderColor: theme.primary + '33',
                            backgroundColor: theme.primary + '08',
                          }}
                        >
                          {price}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className={`${titleClass} text-white/90 leading-tight mb-3 line-clamp-2`}>
                      <span className="group-hover:text-[var(--hover-color)] transition-colors duration-300"
                        style={{ '--hover-color': theme.primary } as React.CSSProperties}
                      >
                        {trend.name}
                      </span>
                    </h3>

                    {/* Description */}
                    <p className={`text-white/40 text-sm leading-relaxed ${descClamp} mb-4`}>
                      {trend.description}
                    </p>

                    {/* Brand (price already shown as pill above) */}
                    {brand && (
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-[10px] font-medium text-white/25 tracking-wider uppercase">
                          {brand}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Bottom section */}
                  <div>
                    {/* Trend Chart (30-day social) */}
                    <div className="mb-4">
                      <MiniTrendChart
                        trend={{
                          social_score: trend.social_score,
                          heat_status: trend.heat_status as HeatStatus,
                        }}
                        historyData={historyMap[trend.id]}
                        height={isHero ? 100 : isTop3 ? 88 : 72}
                        theme="dark"
                      />
                    </div>

                    {/* Footer: Score + Analyze */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[9px] font-black uppercase tracking-[0.3em] text-white/25 mb-0.5">
                          Velocity Score
                        </div>
                        <div className={`${isHero ? 'text-3xl' : 'text-2xl'} font-black tabular-nums`} style={{ color: theme.primary }}>
                          {trend.heat_score}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Bookmark */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBookmark(trend.id);
                          }}
                          className="p-2 rounded-full hover:bg-white/5 transition-colors"
                        >
                          <Bookmark
                            className={`w-4 h-4 transition-colors ${
                              isBookmarked ? 'fill-current' : ''
                            }`}
                            style={{ color: isBookmarked ? theme.primary : 'rgba(255,255,255,0.2)' }}
                          />
                        </button>

                        {/* Analyze button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTrend(trend);
                          }}
                          className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] transition-colors"
                          style={{ color: theme.primary }}
                        >
                          Analyze
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-32">
            <p className="text-white/20 text-lg font-serif italic">No trends found</p>
            <p className="text-white/10 text-sm mt-2">Try a different category or search term</p>
          </div>
        )}
      </section>

      {/* ─── Footer ────────────────────────────────────────────────────── */}
      <footer className="bg-black border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60 mb-4">
                MONTRA
              </div>
              <p className="text-[11px] text-white/20 leading-relaxed">
                Real-time global trend intelligence. Tracking viral products, emerging brands, and cultural shifts across 100+ markets.
              </p>
            </div>

            {/* Intelligence */}
            <div>
              <div className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 mb-4">
                Intelligence
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[11px] text-white/20 hover:text-white/40 transition-colors cursor-pointer">Trend Analysis</span>
                <span className="text-[11px] text-white/20 hover:text-white/40 transition-colors cursor-pointer">Market Reports</span>
                <span className="text-[11px] text-white/20 hover:text-white/40 transition-colors cursor-pointer">Category Insights</span>
              </div>
            </div>

            {/* Reports */}
            <div>
              <div className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 mb-4">
                Reports
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[11px] text-white/20 hover:text-white/40 transition-colors cursor-pointer">Weekly Digest</span>
                <span className="text-[11px] text-white/20 hover:text-white/40 transition-colors cursor-pointer">Regional Reports</span>
                <span className="text-[11px] text-white/20 hover:text-white/40 transition-colors cursor-pointer">Velocity Index</span>
              </div>
            </div>

            {/* Company */}
            <div>
              <div className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 mb-4">
                Company
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[11px] text-white/20 hover:text-white/40 transition-colors cursor-pointer">About</span>
                <span className="text-[11px] text-white/20 hover:text-white/40 transition-colors cursor-pointer">API</span>
                <span className="text-[11px] text-white/20 hover:text-white/40 transition-colors cursor-pointer">Contact</span>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-[9px] text-white/15 tracking-wider">
              &copy; {new Date().getFullYear()} MONTRA. All rights reserved.
            </div>
            <div className="text-[9px] text-white/15 tracking-wider">
              Curated by MONTRA Intelligence
            </div>
          </div>
        </div>
      </footer>

      {/* ─── Trend Detail Modal ────────────────────────────────────────── */}
      {selectedTrend && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={() => setSelectedTrend(null)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

          {/* Modal content */}
          <div
            className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-[48px] bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 p-8 md:p-12 custom-scrollbar"
            onClick={e => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedTrend(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-white/40" />
            </button>

            {/* Category + Status */}
            <div className="flex items-center gap-2 mb-6">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border"
                style={{
                  color: theme.primary,
                  borderColor: theme.primary + '33',
                  backgroundColor: theme.primary + '10',
                }}
              >
                {selectedTrend.category.emoji} {selectedTrend.category.name_en}
              </span>
              <span
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em]"
                style={{
                  color: mapStatus(selectedTrend.heat_status) === 'rising' ? '#22c55e' : mapStatus(selectedTrend.heat_status) === 'new' ? '#a78bfa' : '#f59e0b',
                  backgroundColor: mapStatus(selectedTrend.heat_status) === 'rising' ? 'rgba(34,197,94,0.1)' : mapStatus(selectedTrend.heat_status) === 'new' ? 'rgba(167,139,250,0.1)' : 'rgba(245,158,11,0.1)',
                }}
              >
                <StatusIcon status={selectedTrend.heat_status} />
                {mapStatus(selectedTrend.heat_status)}
              </span>
            </div>

            {/* Title */}
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif italic text-white leading-[1.1] mb-6">
              {selectedTrend.name}
            </h2>

            {/* Description */}
            <p className="text-white/50 text-base leading-relaxed mb-8">
              {selectedTrend.description}
            </p>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="rounded-[24px] bg-white/[0.04] border border-white/5 p-5 text-center">
                <div className="text-[9px] font-black uppercase tracking-[0.3em] text-white/25 mb-2">
                  Velocity Index
                </div>
                <div className="text-3xl font-black tabular-nums" style={{ color: theme.primary }}>
                  {selectedTrend.heat_score}
                </div>
              </div>
              <div className="rounded-[24px] bg-white/[0.04] border border-white/5 p-5 text-center">
                <div className="text-[9px] font-black uppercase tracking-[0.3em] text-white/25 mb-2">
                  Global Rank
                </div>
                <div className="text-3xl font-black text-white/80 tabular-nums">
                  #{filteredTrends.findIndex(t => t.id === selectedTrend.id) + 1}
                </div>
              </div>
              <div className="rounded-[24px] bg-white/[0.04] border border-white/5 p-5 text-center">
                <div className="text-[9px] font-black uppercase tracking-[0.3em] text-white/25 mb-2">
                  Market Value
                </div>
                <div className="text-3xl font-black text-white/80">
                  {getPrice(selectedTrend.tags) || '—'}
                </div>
              </div>
            </div>

            {/* Trend Chart (30-day social) */}
            <div className="rounded-[24px] bg-white/[0.03] border border-white/5 p-4">
              <MiniTrendChart
                trend={{
                  social_score: selectedTrend.social_score,
                  heat_status: selectedTrend.heat_status as HeatStatus,
                }}
                historyData={historyMap[selectedTrend.id]}
                height={100}
                theme="dark"
              />
            </div>

            {/* Tags */}
            {selectedTrend.tags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {selectedTrend.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full bg-white/5 text-[10px] font-medium text-white/30 border border-white/5"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
