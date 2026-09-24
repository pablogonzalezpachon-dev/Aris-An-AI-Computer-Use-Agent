import { Check } from "lucide-react";

type Props = {
  done: boolean;
};

export default function TaskCompleteAnimation({ done }: Props) {
  return (
    <div className="flex items-center justify-center w-20 h-20 absolute bottom-2 right-2">
      <div className="text-center">
        <div className="relative inline-block">
          {/* Completion Circle */}
          <button
            className={`relative w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all duration-500 ${
              done
                ? "bg-[rgba(42,69,107,0.8)] border-[rgba(42,69,107,0.8)] scale-110"
                : "bg-[rgba(42,69,107,0.8)] border-[rgba(42,69,107,0.8)] scale-0 opacity-0 "
            }`}
            style={{
              boxShadow: done ? "0 0 40px rgba(109,176,233,0.7)" : "none",
            }}
          >
            <Check
              className={`w-10 h-10 text-white transition-all duration-500 ${
                done ? "scale-100 opacity-100" : "scale-0 opacity-0"
              }`}
              strokeWidth={3}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
