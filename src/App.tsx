/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  SkipBack, 
  SkipForward, 
  RotateCcw, 
  Download as DownloadIcon, 
  Settings, 
  BarChart3, 
  HelpCircle, 
  Gauge, 
  LayoutDashboard,
  Info
} from 'lucide-react';

// --- Types ---
type Algorithm = 'Quick Sort' | 'Merge Sort' | 'Bubble Sort' | 'Heap Sort';

interface Stats {
  comparisons: number;
  swaps: number;
  time: number;
}

export default function App() {
  const [algorithm, setAlgorithm] = useState<Algorithm>('Quick Sort');
  const [speed, setSpeed] = useState(50);
  const [arraySize, setArraySize] = useState(50);
  const [array, setArray] = useState<number[]>([]);
  const [activeIndices, setActiveIndices] = useState<number[]>([]);
  const [pivotIndex, setPivotIndex] = useState<number | null>(null);
  const [sortedIndices, setSortedIndices] = useState<Set<number>>(new Set());
  const [isPlaying, setIsPlaying] = useState(false);
  const [stats, setStats] = useState<Stats>({ comparisons: 0, swaps: 0, time: 0 });
  const [activeLine, setActiveLine] = useState(0);

  // Stop ref to kill execution if needed
  const isStopping = useRef(false);

  // Initialize array
  const generateArray = () => {
    const newArray = Array.from({ length: arraySize }, () => Math.floor(Math.random() * 90) + 10);
    setArray(newArray);
    setSortedIndices(new Set());
    setActiveIndices([]);
    setPivotIndex(null);
    setStats({ comparisons: 0, swaps: 0, time: 0 });
    setIsPlaying(false);
    isStopping.current = false;
  };

  useEffect(() => {
    generateArray();
  }, [arraySize]);

  const delay = () => new Promise(resolve => setTimeout(resolve, Math.max(1, 100 - speed)));

  // --- Quick Sort Implementation for Visualization ---
  async function quickSort(arr: number[], low: number, high: number) {
    if (low < high) {
      setActiveLine(2);
      const pi = await partition(arr, low, high);
      if (isStopping.current) return;
      await quickSort(arr, low, pi - 1);
      await quickSort(arr, pi + 1, high);
    } else if (low === high) {
      setSortedIndices(prev => new Set([...prev, low]));
    }
  }

  async function partition(arr: number[], low: number, high: number) {
    setActiveLine(7);
    const pivot = arr[high];
    setPivotIndex(high);
    let i = low - 1;

    for (let j = low; j < high; j++) {
      if (isStopping.current) return low;
      setActiveIndices([j, high]);
      setStats(prev => ({ ...prev, comparisons: prev.comparisons + 1 }));
      await delay();

      if (arr[j] < pivot) {
        i++;
        [arr[i], arr[j]] = [arr[j], arr[i]];
        setArray([...arr]);
        setStats(prev => ({ ...prev, swaps: prev.swaps + 1 }));
        await delay();
      }
    }
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    setArray([...arr]);
    setStats(prev => ({ ...prev, swaps: prev.swaps + 1 }));
    setPivotIndex(null);
    setSortedIndices(prev => new Set([...prev, i + 1]));
    await delay();
    return i + 1;
  }

  const handleStart = async () => {
    if (isPlaying) {
      isStopping.current = true;
      setIsPlaying(false);
      return;
    }
    setIsPlaying(true);
    isStopping.current = false;
    const arrayCopy = [...array];
    const startTime = Date.now();
    
    // Update time periodically
    const timer = setInterval(() => {
      setStats(prev => ({ ...prev, time: parseFloat(((Date.now() - startTime) / 1000).toFixed(1)) }));
    }, 100);

    await quickSort(arrayCopy, 0, arrayCopy.length - 1);
    
    clearInterval(timer);
    setIsPlaying(false);
    setActiveIndices([]);
    setPivotIndex(null);
    // Mark all as sorted if not stopped
    if (!isStopping.current) {
        setSortedIndices(new Set(array.map((_, i) => i)));
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-on-surface font-sans selection:bg-primary/30">
      {/* Sidebar Rail */}
      <nav className="w-20 border-r border-white/10 flex flex-col items-center py-8 gap-10 bg-surface z-50">
        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-on-primary font-black shadow-[0_0_20px_rgba(6,182,212,0.5)] cursor-pointer">
          <BarChart3 className="w-7 h-7" />
        </div>
        <div className="flex flex-col gap-10 opacity-40">
          <Settings className="w-6 h-6 hover:text-primary transition-colors cursor-pointer" />
          <Gauge className="w-6 h-6 hover:text-primary transition-colors cursor-pointer" />
          <LayoutDashboard className="w-6 h-6 hover:text-primary transition-colors cursor-pointer" />
          <HelpCircle className="w-6 h-6 hover:text-primary transition-colors cursor-pointer" />
        </div>
        <div className="mt-auto mb-4 opacity-20">
          <div className="w-1 h-12 bg-white rounded-full mx-auto"></div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Top Header */}
        <header className="h-20 border-b border-white/10 flex items-center justify-between px-10 glass-panel z-10">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-[0.3em] text-primary font-bold">System Status: Active</span>
            <h1 className="text-xl font-light tracking-tight">Algorithm Lab <span className="opacity-30">/</span> <span className="text-white">{algorithm.replace(' ', '_')}</span></h1>
          </div>
          <div className="flex gap-4">
            <button className="px-5 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all">Export Data</button>
            <button className="px-7 py-2 bg-primary border border-cyan-400 rounded-full text-[10px] font-bold text-black hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all uppercase tracking-widest">Sign Up</button>
          </div>
        </header>

        {/* Content Region */}
        <div className="flex-1 flex flex-col p-8 gap-8 overflow-y-auto">
          {/* Top Visualization & Controls Grid */}
          <div className="grid grid-cols-12 gap-8 h-[550px] min-h-[550px]">
            {/* Visualizer Canvas */}
            <section className="col-span-9 bg-gradient-to-br from-[#121212] to-[#050505] rounded-3xl border border-white/10 relative overflow-hidden shadow-2xl flex items-center justify-center p-8 canvas-grid">
              <div className="w-full h-full flex items-end justify-center gap-[2px]">
                {array.map((value, idx) => {
                  const isActive = activeIndices.includes(idx);
                  const isPivot = pivotIndex === idx;
                  const isSorted = sortedIndices.has(idx);
                  
                  let bgColor = "rgba(255, 255, 255, 0.15)";
                  if (isPivot) bgColor = "var(--color-tertiary)";
                  if (isActive) bgColor = "rgba(6, 182, 212, 0.6)";
                  if (isSorted) bgColor = "var(--color-secondary)";

                  return (
                    <motion.div
                      key={idx}
                      layout
                      className="flex-1 rounded-t-sm relative max-w-[20px]"
                      style={{ 
                        height: `${value}%`,
                        backgroundColor: bgColor,
                        boxShadow: (isActive || isPivot) ? `0 0 15px ${bgColor}` : 'none'
                      }}
                      initial={false}
                      transition={{ type: 'spring', stiffness: 500, damping: 30, mass: 0.8 }}
                    >
                      {(isActive || isPivot) && (
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-on-background/90 text-white text-[10px] font-mono px-2 py-1 rounded border border-white/10 shadow-xl whitespace-nowrap z-10">
                          {value}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* HUD / Label Overlay */}
              <div className="absolute top-6 left-6 flex gap-2">
                <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[10px] border border-white/10 font-bold uppercase tracking-wider">Live Visualization</span>
                <span className="px-3 py-1 bg-primary/20 backdrop-blur-md rounded-full text-[10px] border border-primary/50 text-primary font-bold">V1.28-STABLE</span>
              </div>

              {/* Play Controls Overlay */}
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-black/80 backdrop-blur-xl p-4 px-8 rounded-full border border-white/10 shadow-2xl">
                <button 
                  onClick={generateArray}
                  className="p-2 text-white/40 hover:text-primary transition-colors"
                >
                  <SkipBack className="w-5 h-5" />
                </button>
                <button 
                  onClick={handleStart}
                  className="w-16 h-16 bg-primary text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(6,182,212,0.3)]"
                >
                  {isPlaying ? (
                    <div className="flex gap-1.5">
                      <div className="w-1.5 h-7 bg-black rounded-full" />
                      <div className="w-1.5 h-7 bg-black rounded-full" />
                    </div>
                  ) : (
                    <Play className="w-9 h-9 fill-black ml-1.5" />
                  )}
                </button>
                <button className="p-2 text-white/40 hover:text-primary transition-colors">
                  <SkipForward className="w-5 h-5" />
                </button>
                <div className="w-[1px] h-6 bg-white/10 mx-2" />
                <button 
                  onClick={generateArray}
                  className="p-2 text-white/40 hover:text-red-500 transition-colors"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              </div>
            </section>

            {/* Sidebar Controls Panel */}
            <aside className="col-span-3 flex flex-col gap-6">
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex-1 flex flex-col justify-between backdrop-blur-xl">
                <div className="space-y-6">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-white/40 block mb-3">Algorithm Selection</span>
                    <select 
                      value={algorithm}
                      onChange={(e) => setAlgorithm(e.target.value as Algorithm)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm font-medium focus:ring-1 focus:ring-primary outline-none appearance-none"
                    >
                      <option className="bg-[#080808]">Quick Sort</option>
                      <option className="bg-[#080808]">Merge Sort</option>
                      <option className="bg-[#080808]">Bubble Sort</option>
                      <option className="bg-[#080808]">Heap Sort</option>
                    </select>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-white/40 block mb-3">Execution Speed</span>
                    <input 
                      type="range" 
                      min="1" 
                      max="100" 
                      value={speed}
                      onChange={(e) => setSpeed(Number(e.target.value))}
                      className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-primary" 
                    />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-white/40 block mb-3">Data Set Size</span>
                    <input 
                      type="range" 
                      min="10" 
                      max="200" 
                      value={arraySize}
                      onChange={(e) => setArraySize(Number(e.target.value))}
                      className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-primary" 
                    />
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-white/5 space-y-4">
                  <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Efficiency Rating</span>
                    <span className="text-xl font-light text-primary">A++</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>

          {/* Bottom Analysis & Code Section */}
          <div className="grid grid-cols-12 gap-8 h-[350px] min-h-[350px]">
            {/* Stats Panel */}
            <div className="col-span-3 glass-panel rounded-3xl p-8 flex flex-col justify-between overflow-hidden relative">
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
              <div className="text-[10px] uppercase tracking-widest text-white/40 mb-2">Live Telemetry</div>
              <div className="h-[1px] w-full bg-white/10 mb-6"></div>
              
              <div className="space-y-6">
                <div>
                  <div className="text-[10px] text-white/30 uppercase mb-1">Comparisons</div>
                  <div className="text-3xl font-light tracking-tight">{stats.comparisons}</div>
                </div>
                <div>
                  <div className="text-[10px] text-white/30 uppercase mb-1">Swaps / Shifts</div>
                  <div className="text-3xl font-light tracking-tight text-secondary">{stats.swaps}</div>
                </div>
                <div>
                  <div className="text-[10px] text-white/30 uppercase mb-1">Execution Time</div>
                  <div className="text-3xl font-light tracking-tight">{stats.time}<span className="text-sm opacity-30 ml-1">ms</span></div>
                </div>
              </div>
            </div>

            {/* Code Panel */}
            <div className="col-span-6 bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 flex flex-col relative overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] uppercase tracking-widest text-white/40">Source Code_Kernel</span>
                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-white/20"></div>
                  <div className="w-2 h-2 rounded-full bg-primary/40"></div>
                  <div className="w-2 h-2 rounded-full bg-white/20"></div>
                </div>
              </div>
              <div className="font-mono text-sm leading-relaxed overflow-y-auto custom-scrollbar pr-4">
                {[
                  "function quicksort(array, low, high)",
                  "  if low < high",
                  "    pivot_index := partition(array, low, high)",
                  "    quicksort(array, low, pivot_index)",
                  "    quicksort(array, pivot_index + 1, high)",
                  "",
                  "function partition(array, low, high)",
                  "  pivot := array[high]",
                  "  i := low - 1",
                  "  for j from low to high - 1",
                  "    if array[j] < pivot",
                  "      i := i + 1",
                  "      swap array[i] with array[j]",
                  "  swap array[i + 1] with array[high]",
                  "  return i + 1"
                ].map((line, idx) => (
                  <div 
                    key={idx} 
                    className={`px-4 py-0.5 -mx-4 transition-all ${
                      (idx === activeLine) ? 'bg-primary/20 border-l-2 border-primary text-white' : 'text-white/30'
                    }`}
                  >
                    <span className="inline-block w-6 opacity-20 select-none">{idx + 1}</span>
                    {line}
                  </div>
                ))}
              </div>
            </div>

            {/* Complexity & Info Cards */}
            <div className="col-span-3 flex flex-col gap-6">
              <div className="flex-1 glass-panel rounded-3xl p-6 flex flex-col justify-center border-l-4 border-l-primary/50">
                <div className="text-[10px] uppercase tracking-widest text-white/40 mb-3">Time Complexity</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-light tracking-tight text-primary">O(n log n)</span>
                  <span className="text-[10px] opacity-30 uppercase font-bold">AVG</span>
                </div>
              </div>
              <div className="flex-1 glass-panel rounded-3xl p-6 flex flex-col justify-center border-l-4 border-l-secondary/50">
                <div className="text-[10px] uppercase tracking-widest text-white/40 mb-3">Space Complexity</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-light tracking-tight text-secondary">O(log n)</span>
                  <span className="text-[10px] opacity-30 uppercase font-bold">STK</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Status */}
        <footer className="h-12 border-t border-white/10 bg-black flex items-center px-10 justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-secondary shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
              <span className="text-[9px] uppercase tracking-[0.2em] text-white/60 font-bold">Kernel Synced</span>
            </div>
            <span className="text-[9px] uppercase tracking-[0.2em] text-white/30">Last Update: Just Now</span>
          </div>
          <div className="text-[9px] uppercase tracking-[0.2em] text-white/40 font-mono">
            AlgoVisual_Kernel v.4.0.28-STABLE
          </div>
        </footer>
      </main>
    </div>
  );
}
