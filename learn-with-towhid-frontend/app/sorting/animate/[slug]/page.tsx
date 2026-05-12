"use client";

import { useState, useEffect, use, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

import ALGO_DATA from "./algo-data"; 
import { VizItem, VizState } from "./types"; 
import { 
  bubbleSortGenerator, 
  selectionSortGenerator,
  insertionSortGenerator,
  mergeSortGenerator,
  quickSortGenerator
} from "./generators";

const generateSafeId = () => `box-${Math.random().toString(36).substring(2, 10)}-${Date.now()}`; 
const ALL_SLUGS = ["bubble-sort", "selection-sort", "insertion-sort", "merge-sort", "quick-sort"];


// 1. Add this function to define which paths should be pre-rendered
export async function generateStaticParams() {
  const slugs = ["bubble-sort", "selection-sort", "insertion-sort", "merge-sort", "quick-sort"];
  
  return slugs.map((slug) => ({
    slug: slug,
  }));
}

// 2. (Optional) Prevent Next.js from trying to render slugs not in the list above
export const dynamicParams = false;


export default function AlgorithmVisualizerPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const { slug } = use(params);
  const currentAlgo = ALGO_DATA[slug as keyof typeof ALGO_DATA] || ALGO_DATA["bubble-sort"];
  
  const [vizState, setVizState] = useState<VizState>({
    array: [],
    active: [],
    sorted: [],
    message: "Ready to sort"
  });

  const [history, setHistory] = useState<VizState[]>([]);
  const [customInput, setCustomInput] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSorted, setIsSorted] = useState(false);
  const [activeTab, setActiveTab] = useState("Python");
  const [nextAlgo, setNextAlgo] = useState("");

  // --- NEW: Professional Toast Notification State ---
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' | 'info' } | null>(null);

  const generatorRef = useRef<Generator<VizState, VizState, unknown> | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null); 
  
  const animationSpeed = slug === "merge-sort" ? 1000 : 500; 

  // --- Helper to trigger the notification ---
  const showToast = (message: string, type: 'error' | 'success' | 'info' = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000); // Auto dismiss after 4 seconds
  };

  const generateRandomArray = useCallback(() => {
    const newArr = Array.from({ length: 12 }, () => ({
      id: generateSafeId(), 
      value: Math.floor(Math.random() * 90) + 10,
      pos: undefined,
      level: undefined
    }));
    
    setVizState({ array: newArr, active: [], sorted: [], message: "Generated new random data" });
    setHistory([]); 
    setIsPlaying(false);
    setIsSorted(false);
    generatorRef.current = null;
  }, []);

  // --- UPDATED: Strict Input Validation ---
  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = customInput.split(",").map(n => parseInt(n.trim())).filter(n => !isNaN(n));
    
    if (parsed.length === 0) {
      showToast("Please enter valid numbers separated by commas.", "error");
      return;
    }
    
    if (parsed.length > 15) {
      showToast("To keep the visualization readable, please limit your data to a maximum of 15 items.", "error");
      return;
    }

    if (parsed.some(n => n > 999 || n < -99)) {
      showToast("Please keep numbers between -99 and 999 so they fit inside the boxes.", "error");
      return;
    }

    const newArr = parsed.map(val => ({
      id: generateSafeId(),
      value: val
    }));

    setVizState({ array: newArr, active: [], sorted: [], message: "Custom data loaded successfully!" });
    setHistory([]);
    setCustomInput("");
    setIsPlaying(false);
    setIsSorted(false);
    generatorRef.current = null;
    showToast("Custom array loaded!", "success");
  };

  const togglePlay = () => {
    if (isSorted) return; 

    if (!generatorRef.current) {
      switch (slug) {
        case "bubble-sort":
          generatorRef.current = bubbleSortGenerator(vizState.array);
          break;
        case "selection-sort":
          generatorRef.current = selectionSortGenerator(vizState.array);
          break;
        case "insertion-sort":
          generatorRef.current = insertionSortGenerator(vizState.array);
          break;
        case "merge-sort":
          generatorRef.current = mergeSortGenerator(vizState.array);
          break;
        case "quick-sort":
          generatorRef.current = quickSortGenerator(vizState.array);
          break;
        default:
          generatorRef.current = bubbleSortGenerator(vizState.array);
      }
    }
    
    setIsPlaying(!isPlaying);
  };
  
  const resetVisualizer = () => generateRandomArray();

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        if (generatorRef.current) {
          const result = generatorRef.current.next();
          
          if (!result.done) {
            setVizState(result.value); 
            setHistory(prev => [...prev, result.value]); 
          } else {
            setVizState(result.value);
            setIsPlaying(false);
            setIsSorted(true);
            generatorRef.current = null;
            showToast("Sorting complete!", "success"); // Notify user when finished
            if (timerRef.current) clearInterval(timerRef.current);
          }
        }
      }, animationSpeed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, animationSpeed]);

  useEffect(() => {
    generateRandomArray();
    const others = ALL_SLUGS.filter(s => s !== slug);
    setNextAlgo(others[Math.floor(Math.random() * others.length)]);
  }, [slug, generateRandomArray]);

  useEffect(() => {
    if (!scrollContainerRef.current || vizState.active.length === 0) return;

    const container = scrollContainerRef.current;
    const activeItems = vizState.active.map(idx => vizState.array[idx]).filter(Boolean);
    if (activeItems.length === 0) return;

    const xPositions = activeItems.map((item, idx) => {
      const actualIdx = vizState.array.findIndex(arrItem => arrItem.id === item.id);
      return (item.pos !== undefined ? item.pos : (actualIdx > -1 ? actualIdx : 0)) * 80;
    });
    const yPositions = activeItems.map(item => (item.level !== undefined ? item.level : 0) * 80);

    const minX = Math.min(...xPositions);
    const maxX = Math.max(...xPositions) + 80;
    const minY = Math.min(...yPositions);
    const maxY = Math.max(...yPositions) + 80;

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const targetScrollLeft = centerX - (container.clientWidth / 2);
    const targetScrollTop = centerY - (container.clientHeight / 2) + 40; 

    container.scrollTo({
      left: Math.max(0, targetScrollLeft),
      top: Math.max(0, targetScrollTop),
      behavior: "smooth"
    });

  }, [vizState.active, vizState.array]);


  return (
    <div className="relative min-h-screen bg-[#030712] text-slate-200 font-sans p-6 md:p-12 selection:bg-indigo-500/30">
      
      {/* Background Ambience */}
      <div className="fixed top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-900/20 blur-[150px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-fuchsia-900/20 blur-[150px] pointer-events-none" />

      {/* --- NEW: Professional Toast Notification UI --- */}
      {toast && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[100] transition-all duration-300">
          <div className={`px-6 py-3 rounded-full shadow-2xl backdrop-blur-xl border flex items-center gap-3
            ${toast.type === 'error' ? 'bg-rose-500/20 border-rose-500/50 text-rose-200' 
            : toast.type === 'success' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200'
            : 'bg-indigo-500/20 border-indigo-500/50 text-indigo-200'}`}
          >
            {toast.type === 'error' && <span className="text-lg">⚠️</span>}
            {toast.type === 'success' && <span className="text-lg">✨</span>}
            <span className="font-medium tracking-wide text-sm">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-12">
        <button onClick={() => router.push('/sorting')} className="text-slate-400 hover:text-white transition-colors flex items-center gap-2">
          ← Back to Menu
        </button>
        <h1 className={`text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r ${currentAlgo.color}`}>
          {currentAlgo.name}
        </h1>
      </div>

      {/* --- UPDATED: Full Width Layout System --- */}
      <div className="relative z-10 flex flex-col gap-8 w-full">
        
        {/* ROW 1: Full Width Visualizer Canvas */}
        <div className="w-full bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl flex flex-col items-center shadow-2xl relative overflow-hidden">
          
          <div className="absolute top-6 z-20 text-lg font-mono text-indigo-300 bg-indigo-900/80 backdrop-blur-md px-6 py-2 rounded-full border border-indigo-500/50 shadow-lg transition-all">
            {vizState.message}
          </div>

          {vizState.array.length === 0 && <div className="text-slate-500 my-48">Generate data to begin</div>}
          
          <div 
            ref={scrollContainerRef}
            className="relative w-full h-[450px] overflow-auto custom-scrollbar mt-12 p-8 pt-20"
          >
            <div 
              className="relative mx-auto transition-all duration-500" 
              style={{ 
                width: `${Math.max(vizState.array.length * 80, 500)}px`,
                height: `${(Math.max(...vizState.array.map(item => item.level || 0), 0) + 2) * 80}px`,
                minHeight: '150px'
              }}
            >
              
              <div className="absolute top-[-30px] flex text-xs text-slate-500 font-mono w-full">
                 {vizState.array.map((_, idx) => (
                   <div key={idx} className="flex justify-center" style={{ width: '64px', marginRight: '16px' }}>
                     [{idx}]
                   </div>
                 ))}
              </div>

              {vizState.array.map((item, index) => {
                const isActive = vizState.active.includes(index);
                const isFullySorted = vizState.sorted.includes(index);
                
                const actualIdx = vizState.array.findIndex(arrItem => arrItem.id === item.id);
                const xPos = (item.pos !== undefined ? item.pos : (actualIdx > -1 ? actualIdx : index)) * 80;
                const yPos = (item.level !== undefined ? item.level : 0) * 80;
                
                return (
                  <div 
                    key={item.id}
                    style={{ transform: `translate(${xPos}px, ${yPos}px)` }}
                    className={`absolute top-0 w-16 h-16 flex items-center justify-center text-2xl font-bold rounded-xl border-2 transition-transform duration-500 ease-in-out shadow-lg
                      ${isActive 
                        ? 'bg-rose-500/20 border-rose-400 text-rose-300 scale-110 z-10' 
                        : isFullySorted 
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                          : 'bg-white/5 border-white/20 text-slate-300' 
                      }
                    `}
                  >
                    {item.value}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ROW 2: History (If applicable) */}
        {slug !== "merge-sort" && history.length > 0 && (
          <div className="w-full bg-white/[0.02] border border-white/10 p-6 rounded-3xl backdrop-blur-md">
            <h3 className="text-sm text-slate-400 uppercase tracking-widest mb-4">Execution History</h3>
            <div className="max-h-[250px] overflow-y-auto custom-scrollbar flex flex-col gap-3 pr-2">
              {history.map((step, stepIdx) => (
                <div key={stepIdx} className="flex items-center gap-4 opacity-50 hover:opacity-100 transition-opacity">
                  <span className="text-xs font-mono text-slate-500 w-8">#{stepIdx + 1}</span>
                  <div className="flex gap-2">
                    {step.array.map((item, i) => (
                      <div 
                        key={item.id + stepIdx} 
                        className={`w-8 h-8 flex items-center justify-center text-xs font-bold rounded border 
                          ${step.active.includes(i) ? 'bg-rose-500/20 border-rose-400 text-rose-300' 
                          : step.sorted.includes(i) ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                          : 'bg-white/5 border-white/20 text-slate-300'}`}
                      >
                        {item.value}
                      </div>
                    ))}
                  </div>
                  <span className="text-xs text-slate-400 ml-4 truncate">{step.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ROW 3: Controls, Inputs, and Code Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
          
          {/* Controls & Inputs (Takes 2/3 of space on desktop) */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="bg-white/[0.02] border border-white/10 p-6 rounded-3xl backdrop-blur-md flex flex-col justify-between">
              <h3 className="text-sm text-slate-400 uppercase tracking-widest mb-4">Playback Controls</h3>
              <div className="flex gap-4 mb-4">
                <button 
                  onClick={togglePlay} 
                  disabled={isSorted}
                  className={`flex-1 py-4 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg ${isPlaying ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 hover:bg-emerald-500/30'}`}
                >
                  {isPlaying ? "⏸ Pause Animation" : isSorted ? "✅ Sorted" : "▶ Play Animation"}
                </button>
                <button onClick={resetVisualizer} className="flex-1 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all shadow-lg">
                  🔄 Reset State
                </button>
              </div>
              <button onClick={generateRandomArray} className="w-full py-4 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/50 rounded-xl transition-all shadow-lg">
                🎲 Generate Random Data
              </button>
            </div>

            <div className="bg-white/[0.02] border border-white/10 p-6 rounded-3xl backdrop-blur-md flex flex-col justify-between">
              <div>
                <h3 className="text-sm text-slate-400 uppercase tracking-widest mb-4">Inject Custom Data</h3>
                <p className="text-xs text-slate-500 mb-4 leading-relaxed">Enter a list of numbers separated by commas (max 15 items). Numbers must be between -99 and 999 to display correctly.</p>
              </div>
              <form onSubmit={handleCustomSubmit} className="flex flex-col gap-4">
                <input 
                  type="text" 
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="e.g. 45, 12, 88, 3" 
                  className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
                />
                <button type="submit" className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all text-slate-300 shadow-lg">
                  Inject Data
                </button>
              </form>
            </div>

          </div>

          {/* Code Snippet Container (Takes 1/3 of space on desktop) */}
          <div className="lg:col-span-1 bg-white/[0.02] border border-white/10 rounded-3xl overflow-hidden backdrop-blur-xl h-[350px] flex flex-col shadow-2xl">
            <div className="flex border-b border-white/10 bg-black/20">
              {["Python", "JavaScript"].map(lang => (
                <button 
                  key={lang}
                  onClick={() => setActiveTab(lang)}
                  className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === lang ? 'text-white border-b-2 border-indigo-500 bg-white/5' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  {lang}
                </button>
              ))}
            </div>
            <div className="relative flex-1 p-6 overflow-auto custom-scrollbar">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(currentAlgo.code[activeTab as keyof typeof currentAlgo.code]);
                  showToast("Code copied to clipboard!", "info");
                }}
                className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 text-slate-400 hover:text-white transition-all text-xs"
              >
                📋 Copy
              </button>
              <pre className="text-sm font-mono text-emerald-400 whitespace-pre-wrap">
                <code>{currentAlgo.code[activeTab as keyof typeof currentAlgo.code]}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>

      {nextAlgo && (
        <div className="relative z-10 mt-16 bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/20 rounded-3xl p-10 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
          <div>
            <h4 className="text-2xl font-bold text-white mb-2">Mastered {currentAlgo.name}?</h4>
            <p className="text-indigo-200">Wanna learn how <span className="font-bold text-white capitalize">{nextAlgo.replace('-', ' ')}</span> works under the hood?</p>
          </div>
          <button 
            onClick={() => router.push(`/sorting/animate/${nextAlgo}`)}
            className="px-8 py-4 bg-white text-indigo-950 font-bold rounded-full hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.3)] whitespace-nowrap z-10"
          >
            Explore Next →
          </button>
        </div>
      )}

    </div>
  );
}