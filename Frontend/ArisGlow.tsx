type Props = {};

function ArisGlow({}: Props) {
  return (
    <div
      onMouseEnter={() => window.electron?.setClickThrough(true)}
      className="relative h-screen w-screen"
    >
      {/* Glow effect layers */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ filter: "blur(16px)" }}
      >
        <defs>
          <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(109,176,233,0.9)">
              <animate
                attributeName="stop-color"
                values="rgba(109,176,233,0.9);rgba(186,207,237,0.9);rgba(34,211,238,0.9);rgba(59,130,246,0.9);rgba(109,176,233,0.9)"
                dur="3s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="25%" stopColor="rgba(186,207,237,0.9)">
              <animate
                attributeName="stop-color"
                values="rgba(186,207,237,0.9);rgba(34,211,238,0.9);rgba(59,130,246,0.9);rgba(109,176,233,0.9);rgba(186,207,237,0.9)"
                dur="3s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="50%" stopColor="rgba(34,211,238,0.9)">
              <animate
                attributeName="stop-color"
                values="rgba(34,211,238,0.9);rgba(59,130,246,0.9);rgba(109,176,233,0.9);rgba(186,207,237,0.9);rgba(34,211,238,0.9)"
                dur="3s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="75%" stopColor="rgba(59,130,246,0.9)">
              <animate
                attributeName="stop-color"
                values="rgba(59,130,246,0.9);rgba(109,176,233,0.9);rgba(186,207,237,0.9);rgba(34,211,238,0.9);rgba(59,130,246,0.9)"
                dur="3s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="100%" stopColor="rgba(109,176,233,0.9)">
              <animate
                attributeName="stop-color"
                values="rgba(109,176,233,0.9);rgba(186,207,237,0.9);rgba(34,211,238,0.9);rgba(59,130,246,0.9);rgba(109,176,233,0.9)"
                dur="3s"
                repeatCount="indefinite"
              />
            </stop>
          </linearGradient>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="none"
          stroke="url(#blueGradient)"
          strokeWidth="28"
          vectorEffect="non-scaling-stroke"
          strokeDasharray="10000"
          strokeDashoffset="10000"
        >
          <animate
            attributeName="stroke-dashoffset"
            from="10000"
            to="0"
            dur="1.5s"
            fill="freeze"
          />
        </rect>
      </svg>

      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ filter: "blur(4px)" }}
      >
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="none"
          stroke="url(#blueGradient)"
          strokeWidth="18"
          vectorEffect="non-scaling-stroke"
          strokeDasharray="10000"
          strokeDashoffset="10000"
        >
          <animate
            attributeName="stroke-dashoffset"
            from="10000"
            to="0"
            dur="1.5s"
            fill="freeze"
          />
        </rect>
      </svg>

      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="none"
          stroke="url(#blueGradient)"
          strokeWidth="10"
          vectorEffect="non-scaling-stroke"
          strokeDasharray="10000"
          strokeDashoffset="10000"
        >
          <animate
            attributeName="stroke-dashoffset"
            from="10000"
            to="0"
            dur="1.5s"
            fill="freeze"
          />
        </rect>
      </svg>
    </div>
  );
}

export default ArisGlow;
