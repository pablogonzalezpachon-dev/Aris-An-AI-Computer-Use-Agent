import { useEffect, useRef, useState } from "react";
import { IoChevronDownSharp } from "react-icons/io5";
import { SiReactos } from "react-icons/si";
import { GoWorkflow } from "react-icons/go";

const AGENT_MODES = [
  {
    name: "GUI Agent",
    icon: (
      <SiReactos size={16} color={"rgb(186,207,237)"} className="mt-[2px]" />
    ),
  },
  {
    name: "Workflow Analyzer",
    icon: (
      <GoWorkflow size={16} color={"rgb(186,207,237)"} className="mt-[2px]" />
    ),
  },
];

export default function AgentDropdown() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(AGENT_MODES[0]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    // Only add listener when dropdown is open
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="
          flex items-center gap-2
          px-3 py-1.5
          rounded-full
          bg-[rgba(255,255,255,0.08)]
          hover:bg-[rgba(255,255,255,0.12)]
          border border-[rgba(180,220,255,0.35)]
          text-sm text-white
          backdrop-blur-md
          text-nowrap
        "
      >
        {selected.icon}
        {selected.name}
        <IoChevronDownSharp size={14} className="opacity-70" />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="
            absolute top-10 left-0 z-50
            w-56
            rounded-xl
            bg-[rgba(20,40,70,0.95)]
            border border-[rgba(180,220,255,0.25)]
            shadow-[0_0_30px_rgba(120,200,255,0.25)]
            backdrop-blur-xl
          "
        >
          {AGENT_MODES.map((mode, id) => (
            <button
              onClick={() => {
                setSelected(mode);
                setOpen(false);
              }}
              key={mode.name}
              className={`
                w-full text-left px-4 py-2
                text-sm text-white
                hover:bg-[rgba(120,200,255,0.15)]
                ${id === 0 ? "rounded-t-xl" : ""}
                ${id === AGENT_MODES.length - 1 ? "rounded-b-xl" : ""}
                transition flex gap-2 item-center
              `}
            >
              {mode.icon}
              {mode.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
