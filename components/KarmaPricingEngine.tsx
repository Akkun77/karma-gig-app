"use client";
import { useState, useEffect } from "react";
import { calculateKarma, KarmaInputs } from "@/lib/karma-engine";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Brain, Dumbbell, Clock } from "lucide-react";

export function KarmaPricingEngine({ onChange }: { onChange: (karma: number, inputs: KarmaInputs) => void }) {
  const [inputs, setInputs] = useState<KarmaInputs>({
    hours: 1,
    mentalEffort: 3,
    physicalEffort: 2,
    urgent: false
  });

  const currentKarma = calculateKarma(inputs);

  useEffect(() => {
    onChange(currentKarma, inputs);
  }, [currentKarma, inputs, onChange]);

  const effortScale = [1, 2, 3, 4, 5];

  return (
    <div className="card-surface p-6 space-y-8 glass relative overflow-hidden">
      
      {/* Background glow for the active karma */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      
      {/* Top Bar: The computed Karma */}
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
            <span className="text-muted-foreground ml-2">Level {inputs.mentalEffort}</span>
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
            <span className="text-muted-foreground ml-2">Level {inputs.physicalEffort}</span>
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

        {/* Urgency */}
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
      </div>
    </div>
  );
}
