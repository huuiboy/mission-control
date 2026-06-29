"use client";

import { motion } from "framer-motion";
import { useId, useMemo } from "react";

type SignalWaveProps = {
  state: "idle" | "active" | "thinking";
  color?: string;
  height?: number;
};

/**
 * The dashboard's signature element: a living waveform that represents
 * an agent's presence. Idle = slow breathing line. Active/thinking =
 * irregular spikes, like a real telemetry readout, not a generic spinner.
 */
export function SignalWave({ state, color = "var(--claude)", height = 64 }: SignalWaveProps) {
  const width = 320;
  const midY = height / 2;
  const reactId = useId();
  const gradientId = `signalFade-${reactId.replace(/[:]/g, "")}`;

  // Pre-generate a jagged path for "active" state so it feels like real signal,
  // not a perfect sine wave.
  const activePoints = useMemo(() => {
    const segments = 24;
    const pts: number[] = [];
    for (let i = 0; i <= segments; i++) {
      const x = (width / segments) * i;
      const seed = Math.sin(i * 12.9898) * 43758.5453;
      const rand = seed - Math.floor(seed);
      const amplitude = i % 3 === 0 ? height * 0.38 : height * 0.12;
      pts.push(x);
      pts.push(midY + (rand - 0.5) * amplitude);
    }
    return pts;
  }, [height, midY]);

  const activePath = useMemo(() => {
    let d = `M 0 ${midY}`;
    for (let i = 0; i < activePoints.length; i += 2) {
      d += ` L ${activePoints[i]} ${activePoints[i + 1]}`;
    }
    return d;
  }, [activePoints, midY]);

  const idlePath = `M 0 ${midY} Q ${width * 0.25} ${midY - height * 0.18}, ${width * 0.5} ${midY} T ${width} ${midY}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height={height}
      className="overflow-visible"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={color} stopOpacity="0" />
          <stop offset="12%" stopColor={color} stopOpacity="1" />
          <stop offset="88%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {state === "idle" && (
        <motion.path
          d={idlePath}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={2}
          strokeLinecap="round"
          animate={{
            d: [
              `M 0 ${midY} Q ${width * 0.25} ${midY - height * 0.18}, ${width * 0.5} ${midY} T ${width} ${midY}`,
              `M 0 ${midY} Q ${width * 0.25} ${midY + height * 0.18}, ${width * 0.5} ${midY} T ${width} ${midY}`,
              `M 0 ${midY} Q ${width * 0.25} ${midY - height * 0.18}, ${width * 0.5} ${midY} T ${width} ${midY}`,
            ],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {state !== "idle" && (
        <motion.path
          d={activePath}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={2}
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      )}

      {state === "thinking" && (
        <motion.circle
          r={3}
          fill={color}
          animate={{
            cx: [0, width],
          }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
          cy={midY}
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />
      )}
    </svg>
  );
}
