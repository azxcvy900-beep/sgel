import React from 'react';
import { Search, Filter, Sparkles } from 'lucide-react';

export function EvidenceFilter({ 
  searchQuery, 
  setSearchQuery, 
  selectedDifficulty, 
  setSelectedDifficulty,
  selectedTag,
  setSelectedTag,
  availableTags
}) {
  const difficulties = [
    { id: 'all', label: 'جميع المستويات' },
    { id: 'مبتدئ', label: 'مبتدئ', color: 'text-emerald-400' },
    { id: 'متمرس', label: 'متمرس', color: 'text-amber-400' },
    { id: 'خبير جنائي', label: 'خبير جنائي', color: 'text-rose-400' }
  ];

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5 mb-10 shadow-2xl space-y-4">
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        
        {/* Search Bar */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث بالعنوان، رقم القضية، أو نوع اللغز..."
            className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-stone-200 placeholder-stone-500 text-xs sm:text-sm focus:outline-none focus:border-amber-400/60 focus:bg-white/[0.06] transition"
          />
        </div>

        {/* Difficulty Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {difficulties.map((diff) => {
            const isActive = selectedDifficulty === diff.id;
            return (
              <button
                key={diff.id}
                onClick={() => setSelectedDifficulty(diff.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-amber-400 text-dark-950 font-black shadow-lg shadow-amber-950/20'
                    : 'bg-white/[0.03] text-stone-300 border border-white/[0.06] hover:bg-white/[0.07] hover:text-white'
                }`}
              >
                <span>{diff.label}</span>
              </button>
            );
          })}
        </div>

      </div>

      {/* Tags Filter */}
      {availableTags && availableTags.length > 0 && (
        <div className="flex items-center gap-2 pt-3 border-t border-white/[0.06] overflow-x-auto pb-1 text-xs">
          <span className="text-stone-400 flex items-center gap-1 shrink-0 text-[11px] font-mono">
            <Filter className="w-3.5 h-3.5" />
            <span>التصنيفات:</span>
          </span>

          <button
            onClick={() => setSelectedTag('all')}
            className={`px-3 py-1 rounded-lg shrink-0 text-xs transition ${
              selectedTag === 'all'
                ? 'bg-white/[0.1] text-amber-300 font-bold'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            الكل
          </button>

          {availableTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag === selectedTag ? 'all' : tag)}
              className={`px-3 py-1 rounded-lg shrink-0 text-xs transition ${
                selectedTag === tag
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold'
                  : 'text-stone-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
