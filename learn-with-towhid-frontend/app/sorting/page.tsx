"use client";

import { useRouter } from "next/navigation";

const ALGORITHMS = [
  { name: "Bubble Sort", desc: "The classic. Watch elements elegantly bubble up to their correct positions.", difficulty: "Beginner", time: "O(n²)", color: "from-pink-500 to-rose-500" },
  { name: "Selection Sort", desc: "Methodical and precise. Scans the abyss to find the absolute minimum.", difficulty: "Beginner", time: "O(n²)", color: "from-orange-500 to-amber-500" },
  { name: "Insertion Sort", desc: "Like sorting a hand of glowing playing cards, one fluid move at a time.", difficulty: "Beginner", time: "O(n²)", color: "from-emerald-400 to-cyan-400" },
  { name: "Merge Sort", desc: "Divide, conquer, and weave back together. A beautiful symphony of logic.", difficulty: "Intermediate", time: "O(n log n)", color: "from-blue-500 to-indigo-500" },
  { name: "Quick Sort", desc: "Fast, chaotic, yet perfectly balanced around a single pivot point.", difficulty: "Intermediate", time: "O(n log n)", color: "from-violet-500 to-purple-500" },
];

export default function SortingMenu() {
  const router = useRouter();

  const startVisualization = (name: string) => {
    const slug = name.toLowerCase().replace(/\s+/g, "-");
    router.push(`/sorting/animate/${slug}`);
  };

  return (
    // Deep dark background with hidden overflow for the glowing orbs
    <div className="relative min-h-screen bg-[#030712] overflow-hidden flex flex-col items-center py-24 px-6 sm:px-12 font-sans selection:bg-indigo-500/30">
      
      {/* Ambient Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-fuchsia-600/20 blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 text-center mb-20 space-y-6 max-w-3xl">
        <div className="inline-flex items-center justify-center px-4 py-1.5 mb-4 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
          <span className="text-xs font-medium tracking-widest text-indigo-300 uppercase">Interactive Learning</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white drop-shadow-lg">
          Master the <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-fuchsia-400 animate-gradient-x">
            Algorithms
          </span>
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
          Experience the elegance of computer science. Select an algorithm below to step into a stunning, interactive visual environment.
        </p>
      </div>

      {/* Glassmorphism Grid */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 w-full max-w-7xl">
        {ALGORITHMS.map((algo) => (
          <div 
            key={algo.name} 
            onClick={() => startVisualization(algo.name)}
            className="group relative cursor-pointer"
          >
            {/* Hover Glow Effect behind the card */}
            <div className={`absolute -inset-0.5 bg-gradient-to-r ${algo.color} rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-700 ease-out`} />
            
            {/* The Actual Glass Card */}
            <div className="relative h-full flex flex-col justify-between bg-white/[0.03] backdrop-blur-xl border border-white/10 p-8 rounded-2xl hover:bg-white/[0.06] transition-all duration-500 ease-out">
              
              <div>
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-3xl font-bold text-slate-100 group-hover:text-white transition-colors duration-300">
                    {algo.name}
                  </h2>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 backdrop-blur-sm">
                    {algo.time}
                  </span>
                </div>
                <p className="text-slate-400 font-light leading-relaxed mb-8">
                  {algo.desc}
                </p>
              </div>

              {/* Card Footer / Action */}
              <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/10">
                <span className={`text-sm font-medium bg-clip-text text-transparent bg-gradient-to-r ${algo.color}`}>
                  {algo.difficulty}
                </span>
                
                {/* Custom glowing arrow button */}
                <div className={`flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-tr ${algo.color} shadow-lg opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300`}>
                  <svg className="w-5 h-5 text-white transform group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>
      
    </div>
  );
}