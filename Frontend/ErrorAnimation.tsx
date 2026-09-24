import { useEffect, useState } from "react";

export default function ErrorAnimation() {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    setTimeout(() => setExiting(true), 3000);
  });

  return (
    <div
      className={`bg-[rgba(42,69,107,0.8)] p-2 w-20 h-20 rounded-full flex items-center justify-center absolute right-2 bottom-2 transition-all duration-500 ease-in-out  ${
        exiting ? "opacity-0 scale-75 translate-y-2" : "opacity-100 scale-100"
      }`}
    >
      <style>{`
        .error-container {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
        }
        
        .error-circle {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 3px solid rgba(255, 255, 255, 0.75);
          animation: scaleIn 0.5s ease-out;
        }
        
        .error-x {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
        
        .error-x::before,
        .error-x::after {
          content: "";
          position: absolute;
          width: 2px;
          height: 2rem;
          background: rgba(255, 255, 255, 0.75);
          border-radius: 1px;
          left: 50%;
          top: 50%;
        }
        
        .error-x::before {
          transform: translate(-50%, -50%) rotate(45deg);
          animation: drawLine1 0.3s ease-out 0.3s both;
        }
        
        .error-x::after {
          transform: translate(-50%, -50%) rotate(-45deg);
          animation: drawLine2 0.3s ease-out 0.5s both;
        }
        
        .error-glow {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.75);
          animation: pulseError 2s ease-out 0.8s infinite;
        }
        
        @keyframes scaleIn {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        @keyframes drawLine1 {
          0% {
            height: 0;
          }
          100% {
            height: 2rem;
          }
        }
        
        @keyframes drawLine2 {
          0% {
            height: 0;
          }
          100% {
            height: 2rem;
          }
        }
        
        @keyframes pulseError {
          0% {
            box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.75);
          }
          50% {
            box-shadow: 0 0 0 20px rgba(239, 68, 68, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
          }
        }
        
        .shake {
          animation: shake 0.5s ease-out 0.7s;
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
      `}</style>

      <div className="error-container shake">
        <div className="error-glow"></div>
        <div className="error-circle">
          <div className="error-x"></div>
        </div>
      </div>
    </div>
  );
}
