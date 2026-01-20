import React from 'react';
import { motion } from 'framer-motion';

interface SliderFieldProps {
    label: string;
    name: string;
    value: number;
    min: number;
    max: number;
    unit: string;
    step?: number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    color?: string;
}

export const SliderField: React.FC<SliderFieldProps> = ({
    label,
    name,
    value,
    min,
    max,
    unit,
    step = 1,
    onChange,
    color = "bg-agri-green"
}) => {
    // Calculate percentage for background gradient
    const percentage = ((value - min) / (max - min)) * 100;

    return (
        <div className="space-y-2 group">
            <div className="flex justify-between items-end">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider group-hover:text-white transition-colors">
                    {label}
                </label>
                <span className="font-mono text-xs text-agri-green tabular-nums">
                    {value} <span className="text-white/30 text-[9px]">{unit}</span>
                </span>
            </div>

            <div className="relative h-6 flex items-center">
                {/* Track Background */}
                <div className="absolute w-full h-1 bg-white/10 rounded-full overflow-hidden">
                    {/* Fill Gradient */}
                    <div
                        className={`h-full ${color} opacity-50`}
                        style={{ width: `${percentage}%` }}
                    />
                </div>

                <input
                    type="range"
                    name={name}
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={onChange}
                    className="w-full absolute z-10 opacity-0 cursor-pointer h-full"
                />

                {/* Custom Thumb (Visual only, follows calculation) */}
                <motion.div
                    className={`absolute h-3 w-3 ${color} rounded-full shadow-[0_0_10px_currentColor] pointer-events-none z-0`}
                    style={{ left: `calc(${percentage}% - 6px)` }}
                    layoutId={`thumb-${name}`}
                />
            </div>
        </div>
    );
};
