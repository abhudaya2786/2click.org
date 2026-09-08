import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  ArrowRight, 
  Tag, 
  Search, 
  Sparkles, 
  FileText, 
  ShieldCheck, 
  Building2,
  TrendingDown
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { UniversalCaseIntakeModal } from '../components/common/UniversalCaseIntakeModal';

interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  publishDate: string;
  author: string;
  featured?: boolean;
}

export const BlogResearchPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);

  const articles: Article[] = [
    {
      id: 'art-01',
      slug: 'house-construction-cost-in-lucknow-2026-guide',
      title: 'How to Estimate House Construction Cost in Lucknow (2026 Guide & Rates per Sq. Ft.)',
      excerpt: 'A comprehensive breakdown of current material costs (M25 RMC, Fe550D rebar, AAC blocks) and labor rates across Gomti Nagar, Shaheed Path, and Vrindavan Yojna.',
      category: 'Cost & BOQ',
      readTime: '6 min read',
      publishDate: 'Feb 2026',
      author: 'Er. Arvind Verma (Chartered Engineer)',
      featured: true
    },
    {
      id: 'art-02',
      slug: 'what-is-normalized-boq-contractor-markup-prevention',
      title: 'What is a Normalized BOQ? Why 80% of Homeowners Overpay Contractors in India',
      excerpt: 'Learn how un-standardized contractor lump-sum contracts hide 20-35% inflated margins, and how CPWD schedule of rates standardizes line items.',
      category: 'Cost & BOQ',
      readTime: '5 min read',
      publishDate: 'Feb 2026',
      author: 'BuildEco Commercial Audit Team'
    },
    {
      id: 'art-03',
      slug: 'land-development-feasibility-checklist-up',
      title: 'Land Development Feasibility Checklist: 12 Due-Diligence Tests in Uttar Pradesh',
      excerpt: 'Before purchasing or plotting land in Lucknow or Eastern UP, verify 30-year non-encumbrance, LDA/GDA zoning, SPT N-values, and flood plain levels.',
      category: 'Land Intelligence',
      readTime: '8 min read',
      publishDate: 'Jan 2026',
      author: 'Ar. Sneha Roy (Urban Planner)'
    },
    {
      id: 'art-04',
      slug: 'up-solar-rooftop-subsidy-pm-surya-ghar-roi',
      title: 'Uttar Pradesh Solar Rooftop Subsidy 2026: PM Surya Ghar Yojana ROI & Net Metering',
      excerpt: 'Calculate how central ₹78,000 + UP State ₹30,000 subsidies bring a 3 kW solar system cost down to under ₹1.2 Lakhs with a 2.8 year payback.',
      category: 'Clean Energy',
      readTime: '4 min read',
      publishDate: 'Feb 2026',
      author: 'Clean Energy Division'
    },
    {
      id: 'art-05',
      slug: 'vastu-vs-structural-engineering-harmony',
      title: 'Architectural Vastu vs. Structural Engineering: Achieving Harmony Without Compromise',
      excerpt: 'How bioclimatic sun-path analysis and structural column grids can align seamlessly with cardinal direction principles without risking seismic ductility.',
      category: 'Engineering',
      readTime: '5 min read',
      publishDate: 'Jan 2026',
      author: 'Er. Arvind Verma & Ar. Sneha Roy'
    }
  ];

  const categories = ['all', 'Cost & BOQ', 'Land Intelligence', 'Clean Energy', 'Engineering'];

  const filteredArticles = articles.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          a.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || a.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
      
      {/* 1. Header */}
      <section className="pt-10 pb-16 bg-gradient-to-b from-[#FFFFFF] to-[#EAF6FB] border-b border-[var(--color-border)]">
        <div className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          
          <div className="inline-flex items-center gap-2">
            <Badge variant="primary" size="md" icon={<BookOpen className="w-3.5 h-3.5" />}>
              Research & Knowledge Hub
            </Badge>
            <span className="text-xs font-mono font-bold text-[var(--color-brand-brown)] bg-[#EAF7FC] px-2.5 py-1 rounded-full border border-[#C6DEE8]">
              SEO Content & Technical Guides
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--color-text)] tracking-tight leading-tight">
                Construction Guides, Land Intelligence & <br className="hidden sm:inline" />
                <span className="text-[var(--color-primary)]">Engineering Research</span>
              </h1>
              
              <p className="text-base text-[var(--color-text-muted)] max-w-2xl leading-relaxed">
                Objective, data-backed guides for property owners, developers, and investors in Uttar Pradesh. Clear CPWD rates, municipal bye-laws, and technical benchmarks.
              </p>

              {/* Search & Filter */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2 max-w-xl">
                <div className="relative flex-1">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search articles (e.g. Lucknow cost, BOQ, Solar...)"
                    leftIcon={<Search className="w-4 h-4 text-[var(--color-text-subtle)]" />}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                      selectedCategory === cat
                        ? 'bg-[var(--color-primary)] text-white'
                        : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] border border-[var(--color-border)] hover:border-[#1697C4]'
                    }`}
                  >
                    {cat === 'all' ? 'All Categories' : cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-4 bg-[var(--color-surface)] p-6 rounded-2xl border border-[var(--color-border)] shadow-xs space-y-3 text-xs">
              <div className="font-bold text-[var(--color-text)] text-sm uppercase">Editorial Standards</div>
              <p className="text-[var(--color-text-muted)] leading-relaxed">
                All guides are authored and verified by Council of Architecture (CoA) architects, Chartered Engineers (IEI), and licensed geotech consultants.
              </p>
              <div className="pt-2 border-t border-[#F0F2EC] flex items-center gap-2 text-[var(--color-primary)] font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Zero sponsored contractor bias.</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. Articles Grid */}
      <section className="py-14 sm:py-20 max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map(article => (
            <div 
              key={article.id} 
              className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6 space-y-4 shadow-2xs hover:border-[#1697C4] transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[var(--color-primary)] bg-[var(--color-primary-subtle)] px-2.5 py-0.5 rounded-full">
                    {article.category}
                  </span>
                  <span className="text-[var(--color-text-subtle)] flex items-center gap-1 text-[11px]">
                    <Clock className="w-3 h-3" />
                    {article.readTime}
                  </span>
                </div>

                <h3 className="font-extrabold text-base text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors leading-snug">
                  {article.title}
                </h3>

                <p className="text-xs text-[var(--color-text-muted)] leading-relaxed line-clamp-3">
                  {article.excerpt}
                </p>
              </div>

              <div className="pt-3 border-t border-[#F0F2EC] flex items-center justify-between text-xs">
                <span className="text-[11px] text-[var(--color-text-subtle)] font-medium">{article.author}</span>
                <button
                  onClick={() => setIsIntakeOpen(true)}
                  className="font-bold text-[var(--color-primary)] group-hover:underline flex items-center gap-1"
                >
                  <span>Read Guide</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </section>

      {/* Universal Case Intake Modal */}
      <UniversalCaseIntakeModal
        isOpen={isIntakeOpen}
        onClose={() => setIsIntakeOpen(false)}
        defaultObjective="Research Inquiry & Project Planning"
        defaultCategory="General Advisory"
      />
    </div>
  );
};
