// app/sorting/animate/[slug]/VisualizerClient.tsx
"use client";

import { useState, useEffect, use, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

import ALGO_DATA from "./algo-data"; 
import { VizState } from "./types"; 
import { 
  bubbleSortGenerator, 
  selectionSortGenerator,
  insertionSortGenerator,
  mergeSortGenerator,
  quickSortGenerator
} from "./generators";

const generateSafeId = () => `box-${Math.random().toString(36).substring(2, 10)}-${Date.now()}`; 
const ALL_SLUGS = ["bubble-sort", "selection-sort", "insertion-sort", "merge-sort", "quick-sort"];

export default function VisualizerClient({ params }: { params: Promise<{ slug: string }> }) {
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
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' | 'info' } | null>(null);

  const generatorRef = useRef<Generator<VizState, VizState, unknown> | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null); 
  
  const animationSpeed = slug === "merge-sort" ? 1000 : 500; 

  const showToast = (message: string, type: 'error' | 'success' | 'info' = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
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

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = customInput.split(",").map(n => parseInt(n.trim())).filter(n => !isNaN(n));
    
    if (parsed.length === 0) {
      showToast("Please enter valid numbers separated by commas.", "error");
      return;
    }
    
    if (parsed.length > 15) {
      showToast("Limit your data to a maximum of 15 items.", "error");
      return;
    }

    const newArr = parsed.map(val => ({ id: generateSafeId(), value: val }));
    setVizState({ array: newArr, active: [], sorted: [], message: "Custom data loaded!" });
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
      const generators: Record<string, Function> = {
        "bubble-sort": bubbleSortGenerator,
        "selection-sort": selectionSortGenerator,
        "insertion-sort": insertionSortGenerator,
        "merge-sort": mergeSortGenerator,
        "quick-sort": quickSortGenerator
      };
      const genFunc = generators[slug] || bubbleSortGenerator;
      generatorRef.current = genFunc(vizState.array);
    }
    setIsPlaying(!isPlaying);
  };
  
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
            showToast("Sorting complete!", "success");
            if (timerRef.current) clearInterval(timerRef.current);
          }
        }
      }, animationSpeed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, animationSpeed]);

  useEffect(() => {
    generateRandomArray();
    const others = ALL_SLUGS.filter(s => s !== slug);
    setNextAlgo(others[Math.floor(Math.random() * others.length)]);
  }, [slug, generateRandomArray]);

  return (
    <div className="relative min-h-screen bg-[#030712] text-slate-200 font-sans p-6 md:p-12">
      {/* Toast and UI elements remain the same as your original fullContent */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] transition-all">
          <div className={`px-6 py-3 rounded-full border shadow-2xl backdrop-blur-xl ${toast.type === 'error' ? 'bg-rose-500/20 border-rose-500/50' : 'bg-emerald-500/20 border-emerald-500/50'}`}>
            {toast.message}
          </div>
        </div>
      )}

      <div className="relative z-10 flex items-center justify-between mb-12">
        <button onClick={() => router.push('/sorting')} className="text-slate-400 hover:text-white flex items-center gap-2">← Back</button>
        <h1 className={`text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r ${currentAlgo.color}`}>{currentAlgo.name}</h1>
      </div>

      <div className="relative z-10 flex flex-col gap-8 w-full">
        {/* Visualizer Canvas */}
        <div className="w-full bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex flex-col items-center">
            <div className="text-lg font-mono text-indigo-300 bg-indigo-900/80 px-6 py-2 rounded-full mb-8">{vizState.message}</div>
            <div ref={scrollContainerRef} className="w-full h-[400px] overflow-auto flex items-center justify-center">
                <div className="relative" style={{ width: `${vizState.array.length * 80}px`, height: '100px' }}>
                    {vizState.array.map((item, index) => {
                        const isActive = vizState.active.includes(index);
                        const isSortedIdx = vizState.sorted.includes(index);
                        return (
                            <div key={item.id} 
                                 className={`absolute w-16 h-16 flex items-center justify-center text-xl font-bold rounded-xl border-2 transition-all duration-500 ${isActive ? 'bg-rose-500/20 border-rose-400 scale-110' : isSortedIdx ? 'bg-emerald-500/20 border-emerald-500' : 'bg-white/5 border-white/20'}`}
                                 style={{ left: `${index * 80}px` }}>
                                {item.value}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white/[0.02] border border-white/10 p-6 rounded-3xl flex gap-4">
                <button onClick={togglePlay} className="flex-1 py-4 bg-emerald-500/20 text-emerald-400 rounded-xl font-bold">{isPlaying ? "Pause" : "Play"}</button>
                <button onClick={generateRandomArray} className="flex-1 py-4 bg-white/5 rounded-xl">New Array</button>
            </div>
            <div className="bg-white/[0.02] border border-white/10 p-6 rounded-3xl">
                <form onSubmit={handleCustomSubmit} className="flex gap-2">
                    <input value={customInput} onChange={e => setCustomInput(e.target.value)} placeholder="10, 20, 30" className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4" />
                    <button type="submit" className="px-6 py-2 bg-indigo-500/20 rounded-xl">Inject</button>
                </form>
            </div>
        </div>
      </div>
    </div>
  );
}