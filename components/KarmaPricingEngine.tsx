"use client";
import { useState, useEffect } from "react";
import { calculateKarma, KarmaInputs } from "@/lib/karma-engine";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Brain, Dumbbell, Clock, ChevronDown, HelpCircle } from "lucide-react";

export function KarmaPricingEngine({ onChange }: { onChange: (karma: number, inputs: KarmaInputs) => void }) {
  const [inputs, setInputs] = useState<KarmaInputs>({
    hours: 1,
    mentalEffort: 3,
    physicalEffort: 2,
    urgent: false
  });
  const [guideOpen, setGuideOpen] = useState(false);

  const currentKarma = calculateKarma(inputs);

  useEffect(() => {
    onChange(currentKarma, inputs);
  }, [currentKarma, inputs, onChange]);

  const effortScale = [1, 2, 3, 4, 5];

  const mentalLevels: Record<number, { label: string; desc: string }> = {
    1: { label: "Mindless", desc: "Zero specialized knowledge. (e.g., picking up coffee, simple copy-pasting)" },
    2: { label: "Easy", desc: "Minimal thought needed. Familiar tasks for most." },
    3: { label: "Focused", desc: "Requires concentration & baseline knowledge. (e.g., proofreading, basic math tutoring)" },
    4: { label: "Complex", desc: "Significant expertise or deep focus required." },
    5: { label: "Specialized", desc: "Rigorous academic or technical expertise. (e.g., debugging C++, advanced neuroscience tutoring)" },
  };

  const physicalLevels: Record<number, { label: string; desc: string }> = {
    1: { label: "Stationary", desc: "Zero physical exertion. Done sitting at a laptop. (e.g., online tutoring)" },
    2: { label: "Light", desc: "Minimal movement. Short walks within a building." },
    3: { label: "Active", desc: "Moderate movement across campus. (e.g., delivering a library book)" },
    4: { label: "Strenuous", desc: "Sustained physical effort or heavy items." },
    5: { label: "Heavy Labor", desc: "Rigorous exertion. (e.g., moving heavy dorm furniture up stairs)" },
  };

  return (
    <div className="card-surface p-6 space-y-8 glass relative overflow-hidden">
      
      {/* Background glow */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      
      {/* Top Bar: Computed Karma */}
      <div className="flex items-center justify-between pb-4 border-b border-white/5">
        <h3 className="font-medium text-lg text-foreground flex items-center gap-2">
          Pricing Engine <span className="text-xs text-muted-foreground bg-white/5 px-2 py-1 rounded">Auto</span>
        </h3>
        <div className="flex flex-col items-end">
          <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Estimated Karma</span>
          <div className="flex items-baseline gap-1">
            <AnimatePresence mode="popLayout">
              <motion.span
                key={currentKarma}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                className="text-4xl font-black karma-gradient"
              >
                {currentKarma}
              </motion.span>
            </AnimatePresence>
            <span className="text-lg text-primary">⚡</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Estimated Time */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm font-medium">
            <span className="flex items-center gap-2"><Clock size={16} /> Estimated Time</span>
            <span className="text-primary">{inputs.hours} {inputs.hours === 1 ? 'hour' : 'hours'}</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="5"
            step="0.5"
            value={inputs.hours}
            onChange={(e) => setInputs({ ...inputs, hours: parseFloat(e.target.value) })}
            className="w-full h-2 bg-input rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground font-medium">
            <span>30m</span>
            <span>5h+</span>
          </div>
        </div>

        {/* Mental Effort */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm font-medium">
            <span className="flex items-center gap-2"><Brain size={16} /> Mental Effort</span>
            <span className="text-indigo-400 text-xs font-bold">
              {inputs.mentalEffort} — {mentalLevels[inputs.mentalEffort].label}
            </span>
          </div>
          <div className="flex gap-2">
            {effortScale.map(level => (
              <button
                key={`mental-${level}`}
                type="button"
                onClick={() => setInputs({ ...inputs, mentalEffort: level })}
                className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
                  inputs.mentalEffort === level
                    ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/50"
                    : "bg-input text-muted-foreground border border-transparent hover:bg-white/10"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Physical Effort */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm font-medium">
            <span className="flex items-center gap-2"><Dumbbell size={16} /> Physical Effort</span>
            <span className="text-emerald-400 text-xs font-bold">
              {inputs.physicalEffort} — {physicalLevels[inputs.physicalEffort].label}
            </span>
          </div>
          <div className="flex gap-2">
            {effortScale.map(level => (
              <button
                key={`physical-${level}`}
                type="button"
                onClick={() => setInputs({ ...inputs, physicalEffort: level })}
                className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
                  inputs.physicalEffort === level
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50"
                    : "bg-input text-muted-foreground border border-transparent hover:bg-white/10"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Urgency Toggle */}
        <button
          type="button"
          onClick={() => setInputs({ ...inputs, urgent: !inputs.urgent })}
          className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
            inputs.urgent
              ? "bg-red-500/10 border-red-500/30 text-red-500"
              : "bg-input border-transparent text-muted-foreground hover:bg-white/5"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${inputs.urgent ? 'bg-red-500/20' : 'bg-black/20'}`}>
              <Zap size={20} className={inputs.urgent ? 'text-red-500' : 'opacity-50'} />
            </div>
            <div className="text-left">
              <div className="font-bold">Urgent Request</div>
              <div className="text-xs opacity-70">Requires immediate attention</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold px-2 py-1 rounded ${inputs.urgent ? 'bg-red-500/20' : 'bg-white/10'}`}>
              +20 Karma
            </span>
            <div className={`w-10 h-6 rounded-full p-1 transition-colors ${inputs.urgent ? 'bg-red-500' : 'bg-black/40'}`}>
              <motion.div 
                className="w-4 h-4 rounded-full bg-white shadow"
                animate={{ x: inputs.urgent ? 16 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </div>
          </div>
        </button>

        {/* Effort Guide Accordion */}
        <div className="rounded-xl border border-white/10 overflow-hidden">
          <button
            type="button"
            onClick={() => setGuideOpen(!guideOpen)}
            className="w-full flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-white/10 transition-colors text-sm"
          >
            <span className="flex items-center gap-2 font-semibold text-muted-foreground">
              <HelpCircle size={15} className="text-primary/70" />
              How to calculate effort levels?
            </span>
            <motion.div animate={{ rotate: guideOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown size={16} className="text-muted-foreground" />
            </motion.div>
          </button>

          <AnimatePresence initial={false}>
            {guideOpen && (
              <motion.div
                key="guide"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="px-4 py-4 space-y-5 bg-black/20 border-t border-white/5">

                  {/* Mental Effort Scale */}
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-3 flex items-center gap-1.5">
                      🧠 Mental Effort Scale
                    </p>
                    <div className="space-y-2">
                      {[
                        { lvl: 1, label: "Mindless", desc: "Requires zero specialized knowledge or deep focus.", example: "picking up a coffee, simple copy-pasting" },
                        { lvl: 3, label: "Focused", desc: "Requires concentration and baseline knowledge.", example: "proofreading a standard essay, basic math tutoring" },
                        { lvl: 5, label: "Highly Specialized", desc: "Requires rigorous academic or technical expertise.", example: "debugging complex C++ code, tutoring advanced engineering or neuroscience" },
                      ].map(({ lvl, label, desc, example }) => (
                        <div key={lvl} className="flex gap-3 items-start">
                          <span className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-md bg-indigo-500/20 text-indigo-400 text-xs font-black flex items-center justify-center border border-indigo-500/30">
                            {lvl}
                          </span>
                          <div>
                            <span className="text-xs font-bold text-foreground">{label}: </span>
                            <span className="text-xs text-muted-foreground">{desc} </span>
                            <span className="text-xs text-indigo-400/80 italic">(e.g., {example})</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-white/5" />

                  {/* Physical Effort Scale */}
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-3 flex items-center gap-1.5">
                      🏋️ Physical Effort Scale
                    </p>
                    <div className="space-y-2">
                      {[
                        { lvl: 1, label: "Stationary", desc: "Zero physical exertion. Can be done sitting at a laptop.", example: "online tutoring, virtual research" },
                        { lvl: 3, label: "Active", desc: "Moderate movement around campus.", example: "walking across campus to deliver a library book, carrying a few groceries" },
                        { lvl: 5, label: "Heavy Labor", desc: "Rigorous physical exertion.", example: "helping someone move heavy dorm furniture up three flights of stairs" },
                      ].map(({ lvl, label, desc, example }) => (
                        <div key={lvl} className="flex gap-3 items-start">
                          <span className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-400 text-xs font-black flex items-center justify-center border border-emerald-500/30">
                            {lvl}
                          </span>
                          <div>
                            <span className="text-xs font-bold text-foreground">{label}: </span>
                            <span className="text-xs text-muted-foreground">{desc} </span>
                            <span className="text-xs text-emerald-400/80 italic">(e.g., {example})</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}