import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Search, MapPin, ArrowRight, X, User, Command, Volume2, AlertCircle, CornerDownLeft, ArrowUp, ArrowDown, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { resolveNavigationQuery, updateSearchData } from '../data/searchEngine';

const SearchSystem = ({ onResultsChange, onSearchFocus, currentFloor }) => {
  const [query, setQuery] = useState('');
  const [resolution, setResolution] = useState(null); 
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isResolving, setIsResolving] = useState(false);

  // Sync Search Engine with Firestore Data
  useEffect(() => {
    const layoutsRef = collection(db, "layouts");
    const unsub = onSnapshot(layoutsRef, (snap) => {
      const dynamicData = {};
      snap.forEach(doc => {
        const data = doc.data();
        if (data.floorId) {
          dynamicData[data.floorId] = data;
        }
      });
      console.log("[SearchSystem] Search data refreshed from Firestore");
      updateSearchData(dynamicData);
    });
    return () => unsub();
  }, []);
  
  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Popular Searches
  const popular = ["LH-110", "BTL-05", "Staff Room", "Lift", "Karuna Pandit"];

  // Casual quotes for placeholder
  const quotes = [
    "Where to, captain?",
    "Lost? Let me guide you...",
    "Finding a room? Easy peasy.",
    "BTL05 is just a search away.",
    "Tell me where you want to be.",
    "Navigator at your service.",
    "Seeking someone? Type their name."
  ];
  const [placeholder] = useState(() => quotes[Math.floor(Math.random() * quotes.length)]);

  // Resolve query through the Intent-Aware Engine
  useEffect(() => {
    if (!query.trim()) {
      setResolution(null);
      setIsResolving(false);
      return;
    }

    setIsResolving(true);
    // Instant resolution for local data
    const result = resolveNavigationQuery(query, { currentFloor });
    setResolution(result);
    setIsResolving(false);
    setSelectedIndex(0);

    if (onResultsChange) {
      const hasResults = result && (result.confidence_score >= 20 || (result.alternatives && result.alternatives.length > 0));
      if (hasResults) {
        const ids = [
          result.confidence_score >= 10 ? result.id : null, 
          ...(result.alternatives?.map(a => a.id) || [])
        ].filter(Boolean);
        onResultsChange(ids);
      } else {
        onResultsChange(null);
      }
    }
  }, [query, currentFloor, onResultsChange]);

  useEffect(() => {
    if (onSearchFocus) onSearchFocus(isFocused);
  }, [isFocused, onSearchFocus]);

  // Close results on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e) => {
    const totalItems = (resolution?.alternatives?.length || 0) + (resolution ? 1 : 0);
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < totalItems - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter') {
      if (selectedIndex === 0 && resolution?.url) {
        handleSelect(resolution);
      } else if (resolution?.alternatives?.[selectedIndex - 1]) {
        handleSelect(resolution.alternatives[selectedIndex - 1]);
      }
    } else if (e.key === 'Escape') {
      setIsFocused(false);
      inputRef.current?.blur();
    }
  };

  const handleSelect = useCallback((item) => {
    if (!item.url) return;
    navigate(item.url);
    setQuery('');
    setIsFocused(false);
    inputRef.current?.blur();
  }, [navigate]);

  return (
    <div ref={searchRef} className="relative w-full max-w-[700px] mx-auto z-[200]">
      {/* Modern High-Performance Search Bar */}
      <div className="relative group">
        {/* Glow effect */}
        <div className={`absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl transition-opacity duration-500 pointer-events-none
          ${isFocused ? 'opacity-100' : 'opacity-0'}`} />
        
        <div className={`relative flex items-center bg-white/80 dark:bg-black/40 backdrop-blur-3xl border transition-all duration-500 rounded-2xl overflow-hidden shadow-2xl
          ${isFocused ? 'border-blue-500/50 ring-4 ring-blue-500/10' : 'border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10'}`}>
          
          <div className="pl-5 pr-2">
            {isResolving ? (
              <div className="w-4 h-4 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
            ) : (
              <Search className={`w-4 h-4 transition-colors duration-500 ${isFocused ? 'text-blue-500' : 'text-black/20 dark:text-white/20'}`} />
            )}
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full py-4 bg-transparent outline-none text-[13px] font-orbitron font-black uppercase tracking-widest text-black dark:text-white placeholder:text-black/20 dark:placeholder:text-white/10"
          />

          <div className="flex items-center gap-2 pr-4">
            <AnimatePresence>
              {query && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                  onMouseDown={(e) => { e.preventDefault(); setQuery(''); }}
                  className="p-1.5 hover:bg-red-500/10 text-black/20 dark:text-white/20 hover:text-red-500 rounded-lg transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                </motion.button>
              )}
            </AnimatePresence>
            
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 bg-black/5 dark:bg-white/5 rounded-md border border-black/5 dark:border-white/10">
              <Command className="w-2.5 h-2.5 text-black/40 dark:text-white/30" />
              <span className="text-[9px] font-orbitron font-black text-black/40 dark:text-white/30">K</span>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Command Palette Results */}
      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="absolute top-full left-0 right-0 mt-3 bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-3xl border border-black/10 dark:border-white/10 rounded-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] overflow-hidden z-[150]"
          >
            <div className="max-h-[480px] overflow-y-auto custom-scrollbar">
              {!query.trim() ? (
                <div className="p-8">
                  <div className="flex items-center gap-2 px-4 mb-4">
                    <Sparkles className="w-3 h-3 text-blue-500" />
                    <span className="text-[9px] font-orbitron font-black text-black/40 dark:text-white/30 uppercase tracking-[0.2em]">Popular Searches</span>
                  </div>
                  <div className="flex flex-wrap gap-2 px-4">
                    {popular.map((term) => (
                      <button
                        key={term}
                        onClick={() => setQuery(term)}
                        className="px-4 py-2 bg-black/5 dark:bg-white/5 hover:bg-blue-500/10 border border-black/5 dark:border-white/5 rounded-xl text-[10px] font-orbitron font-black text-black/40 dark:text-white/30 hover:text-blue-500 transition-all uppercase tracking-widest"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                  <div className="mt-8 pt-8 border-t border-black/5 dark:border-white/5 text-center">
                    <div className="text-[11px] font-orbitron font-black text-black/30 dark:text-white/20 uppercase tracking-[0.3em]">Neural Engine Ready</div>
                    <p className="text-[9px] text-black/15 dark:text-white/10 mt-2 uppercase tracking-widest font-bold">Search for Rooms, Labs, or Faculty members</p>
                  </div>
                </div>
              ) : (
                <div className="p-2">
                  {resolution && (
                    <div className="contents">
                      {/* Top Result */}
                      <div className="px-4 py-2 text-[9px] font-orbitron font-black text-blue-500 uppercase tracking-[0.2em]">Best Match</div>
                      <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleSelect(resolution)}
                        onMouseEnter={() => setSelectedIndex(0)}
                        className={`w-full text-left p-4 rounded-xl transition-all relative overflow-hidden group mb-1 border
                          ${selectedIndex === 0 ? 'bg-blue-500/10 border-blue-500/30' : 'bg-transparent border-transparent hover:bg-black/5 dark:hover:bg-white/5'}`}
                      >
                        <div className="flex items-center gap-5">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500
                            ${selectedIndex === 0 ? 'bg-blue-500 text-white shadow-xl shadow-blue-500/40 rotate-3' : 'bg-black/5 dark:bg-white/10 text-black/30 dark:text-white/40'}`}>
                            {resolution.category_tags.includes('faculty') ? <User className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h4 className={`text-[14px] font-orbitron font-black tracking-[0.05em] truncate ${selectedIndex === 0 ? 'text-blue-500' : 'text-black dark:text-white'}`}>
                              {resolution.title}
                            </h4>
                            <p className="text-[10px] text-black/50 dark:text-white/40 mt-1 uppercase font-bold tracking-tight line-clamp-1">
                              {resolution.description}
                            </p>
                            {resolution.directions && resolution.directions !== 'TBD' && (
                              <div className="flex items-center gap-2 mt-2">
                                <div className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded text-[8px] font-orbitron font-black text-blue-500 uppercase tracking-widest">
                                  Quick Path
                                </div>
                                <p className="text-[9px] text-black/30 dark:text-white/20 italic truncate flex-1">
                                  {resolution.directions}
                                </p>
                              </div>
                            )}
                          </div>

                          {selectedIndex === 0 && (
                            <div className="flex flex-col items-end gap-2">
                              <CornerDownLeft className="w-4 h-4 text-blue-500 opacity-50" />
                              {resolution.directions && resolution.directions !== 'TBD' && (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const utterance = new SpeechSynthesisUtterance(`${resolution.title} is ${resolution.description}. Directions: ${resolution.directions}`);
                                    window.speechSynthesis.speak(utterance);
                                  }}
                                  className="p-1.5 bg-blue-500/10 hover:bg-blue-500 text-blue-500 hover:text-white rounded-lg transition-all"
                                >
                                  <Volume2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </button>

                      {/* Alternatives Section */}
                      {resolution.alternatives && resolution.alternatives.length > 0 && (
                        <div className="mt-4">
                          <div className="px-4 py-2 text-[9px] font-orbitron font-black text-black/30 dark:text-white/20 uppercase tracking-[0.2em] border-t border-black/5 dark:border-white/5">Other Matches</div>
                          <div className="grid grid-cols-1 gap-1 mt-1">
                            {resolution.alternatives.map((alt, idx) => (
                              <button
                                key={idx}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => handleSelect(alt)}
                                onMouseEnter={() => setSelectedIndex(idx + 1)}
                                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all text-left border
                                  ${selectedIndex === idx + 1 ? 'bg-black/5 dark:bg-white/10 border-black/5 dark:border-white/10' : 'bg-transparent border-transparent hover:bg-black/5 dark:hover:bg-white/5'}`}
                              >
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all
                                  ${selectedIndex === idx + 1 ? 'bg-blue-500/20 text-blue-500' : 'bg-black/5 dark:bg-white/10 text-black/30 dark:text-white/40'}`}>
                                  {alt.category_tags.includes('faculty') ? <User className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-[11px] font-orbitron font-black tracking-widest text-black/70 dark:text-white/70">{alt.title}</div>
                                  <div className="text-[8px] text-black/30 dark:text-white/20 uppercase font-bold mt-0.5">{alt.description.split('.')[0]}</div>
                                  {alt.directions && alt.directions !== 'TBD' && (
                                    <div className="text-[8px] text-blue-500/50 italic mt-0.5 truncate">{alt.directions}</div>
                                  )}
                                </div>
                                <div className="text-[9px] font-mono text-black/20 dark:text-white/10">{alt.confidence_score}%</div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {(!resolution || resolution.confidence_score === 0) && (
                    <div className="p-8 text-center">
                      <AlertCircle className="w-8 h-8 text-black/10 dark:text-white/10 mx-auto mb-3" />
                      <div className="text-[11px] font-orbitron font-black text-black/30 dark:text-white/20 uppercase tracking-[0.2em]">No direct matches found</div>
                      <p className="text-[9px] text-black/20 dark:text-white/10 mt-2 uppercase">Try searching for a room number or faculty name</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer hints */}
            <div className="px-4 py-3 bg-black/5 dark:bg-white/5 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="flex flex-col gap-0.5">
                    <ArrowUp className="w-2 h-2 text-black/30 dark:text-white/20" />
                    <ArrowDown className="w-2 h-2 text-black/30 dark:text-white/20" />
                  </div>
                  <span className="text-[8px] font-orbitron font-black text-black/30 dark:text-white/20 uppercase">Navigate</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CornerDownLeft className="w-2.5 h-2.5 text-black/30 dark:text-white/20" />
                  <span className="text-[8px] font-orbitron font-black text-black/30 dark:text-white/20 uppercase">Select</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="px-1.5 py-0.5 bg-black/10 dark:bg-white/10 rounded text-[7px] font-mono text-black/40 dark:text-white/30">ESC</div>
                <span className="text-[8px] font-orbitron font-black text-black/30 dark:text-white/20 uppercase">Close</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchSystem;
