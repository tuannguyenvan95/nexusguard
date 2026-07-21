import { Check, ExternalLink, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TimelineStep {
  label: string;
  timestamp?: string;
  txHash?: string;
  agent?: string;
  completed: boolean;
  current?: boolean;
}

interface JobTimelineProps {
  steps: TimelineStep[];
}

export function JobTimeline({ steps }: JobTimelineProps) {
  return (
    <div className="space-y-6">
      {steps.map((step, idx) => {
        const isLast = idx === steps.length - 1;
        
        return (
          <div 
            key={idx} 
            className="relative flex gap-6 animate-in slide-in-from-left-4 fade-in duration-500 fill-mode-both"
            style={{ animationDelay: `${idx * 150}ms` }}
          >
            {/* Timeline Line */}
            {!isLast && (
              <div className={cn(
                "absolute left-4 top-10 bottom-[-24px] w-[2px] -translate-x-1/2",
                step.completed ? "bg-emerald-500/50" : "bg-white/10 border-l-2 border-dashed border-white/10 bg-transparent"
              )} />
            )}
            
            {/* Circle Indicator */}
            <div className="relative z-10 shrink-0 mt-1">
              {step.completed ? (
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                  <Check className="w-4 h-4" />
                </div>
              ) : step.current ? (
                <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-400 flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.4)]">
                  <div className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-pulse" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center" />
              )}
            </div>
            
            {/* Content */}
            <div className="flex-1 pb-2">
              <h4 className={cn(
                "text-base font-semibold mb-1 transition-colors",
                step.completed ? "text-gray-200" : step.current ? "text-white" : "text-gray-500"
              )}>
                {step.label}
              </h4>
              
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
                {step.timestamp && (
                  <span className="text-gray-500">{step.timestamp}</span>
                )}
                
                {step.agent && (
                  <span className="flex items-center gap-1.5 text-purple-400/80 bg-purple-500/10 px-2 py-0.5 rounded-md text-xs font-medium border border-purple-500/20">
                    <Bot className="w-3 h-3" />
                    {step.agent}
                  </span>
                )}
                
                {step.txHash && (
                  <a 
                    href={`#${step.txHash}`}
                    className="flex items-center gap-1 text-blue-400/80 hover:text-blue-300 transition-colors"
                  >
                    View TX <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
