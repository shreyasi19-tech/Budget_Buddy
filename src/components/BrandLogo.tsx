import React from "react";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  iconOnly?: boolean;
  className?: string;
}

export default function BrandLogo({ size = "md", iconOnly = false, className = "" }: BrandLogoProps) {
  const iconSizeClass = {
    sm: "w-9 h-9",
    md: "w-11 h-11",
    lg: "w-16 h-16"
  }[size];

  const textSizeClass = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl"
  }[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Full Piggy Bank + Arched BUDGET BUDDY Logo Graphic */}
      <div className={`${iconSizeClass} rounded-2xl bg-[#D2EEF9] p-0.5 flex items-center justify-center shrink-0 shadow-md shadow-sky-500/20 relative overflow-hidden group`}>
        <svg viewBox="0 0 100 100" className="w-full h-full transition-transform group-hover:scale-105 duration-200">
          {/* Light Ice Blue Background */}
          <rect width="100" height="100" rx="20" fill="#D2EEF9" />
          
          {/* Defs for Arched Text Path */}
          <defs>
            <path id="budgetBuddyArc" d="M 12,31 A 40,30 0 0,1 88,31" />
          </defs>

          {/* Arched BUDGET BUDDY Text at Top */}
          <text fontSize="8.5" fontWeight="900" fontFamily="system-ui, -apple-system, sans-serif" letterSpacing="0.5">
            <textPath
              href="#budgetBuddyArc"
              startOffset="50%"
              textAnchor="middle"
              fill="#22543D"
              stroke="#1A365D"
              strokeWidth="0.5"
              paintOrder="stroke fill"
            >
              BUDGET BUDDY
            </textPath>
          </text>

          {/* Top floating gold coin */}
          <g transform="translate(55, 14)">
            <circle cx="6" cy="6" r="5.5" fill="#F59E0B" stroke="#D97706" strokeWidth="0.8" />
            <circle cx="6" cy="6" r="4" fill="#FBBF24" />
            <text x="6" y="8" textAnchor="middle" fill="#78350F" fontSize="5.5" fontWeight="900" fontFamily="sans-serif">$</text>
          </g>
          
          {/* Middle floating gold coin */}
          <g transform="translate(42, 21)">
            <circle cx="5.5" cy="5.5" r="5" fill="#F59E0B" stroke="#D97706" strokeWidth="0.8" />
            <circle cx="5.5" cy="5.5" r="3.6" fill="#FBBF24" />
            <text x="5.5" y="7.3" textAnchor="middle" fill="#78350F" fontSize="5" fontWeight="900" fontFamily="sans-serif">$</text>
          </g>
          
          {/* Gold coin entering top slot */}
          <g transform="translate(49, 30)">
            <circle cx="6" cy="6" r="5.5" fill="#F59E0B" stroke="#D97706" strokeWidth="0.8" />
            <circle cx="6" cy="6" r="4.2" fill="#FCD34D" />
            <text x="6" y="8.1" textAnchor="middle" fill="#78350F" fontSize="5.5" fontWeight="900" fontFamily="sans-serif">$</text>
          </g>

          {/* Piggy Bank Curly Tail */}
          <path d="M 74 54 C 82 50, 84 58, 79 60 C 75 61, 77 52, 73 55" fill="none" stroke="#FF8578" strokeWidth="2.2" strokeLinecap="round" />

          {/* Back Legs */}
          <rect x="38" y="70" width="6.5" height="11" rx="3" fill="#E86E63" />
          <rect x="59" y="70" width="6.5" height="11" rx="3" fill="#E86E63" />

          {/* Front Legs */}
          <rect x="30" y="71" width="7" height="12" rx="3" fill="#FF8578" />
          <rect x="51" y="71" width="7" height="12" rx="3" fill="#FF8578" />

          {/* Piggy Body */}
          <ellipse cx="49" cy="61" rx="25" ry="18.5" fill="#FF9E93" />
          <ellipse cx="49" cy="61" rx="23.5" ry="17" fill="#FF8578" />

          {/* Ear */}
          <path d="M 32 46 C 28 36, 38 38, 41 44 Z" fill="#FF8578" stroke="#E86E63" strokeWidth="0.8" />
          <path d="M 34 45 C 31 39, 37 40, 39 44 Z" fill="#FFA398" />

          {/* Snout */}
          <ellipse cx="24" cy="63" rx="6.5" ry="5" fill="#FFA398" stroke="#E86E63" strokeWidth="0.8" />
          <circle cx="22.2" cy="63" r="1.1" fill="#C94A3E" />
          <circle cx="25.8" cy="63" r="1.1" fill="#C94A3E" />

          {/* Eyes */}
          <circle cx="33" cy="53" r="1.8" fill="#2D3748" />
          <circle cx="41" cy="54" r="1.8" fill="#2D3748" />
          <circle cx="32.4" cy="52.4" r="0.6" fill="#FFFFFF" />
          <circle cx="40.4" cy="53.4" r="0.6" fill="#FFFFFF" />

          {/* Coin Slot */}
          <ellipse cx="52" cy="42" rx="4.5" ry="1.1" fill="#C94A3E" />

          {/* Tagline at Bottom */}
          <text x="50" y="91" textAnchor="middle" fill="#2A4365" fontSize="5.2" fontFamily="Georgia, serif" fontWeight="600">
            Your personal finance partner.
          </text>
        </svg>
      </div>

      {!iconOnly && (
        <div className="flex flex-col">
          <span className={`${textSizeClass} font-black tracking-tight leading-none drop-shadow-xs`}>
            {/* 'Budget' in vibrant light sky blue */}
            <span className="text-[#38bdf8] dark:text-[#38bdf8]">Budget</span>
            {/* 'Buddy' in vibrant warm coral pink - easy to read and distinct from Budget */}
            <span className="text-[#ff6b81] dark:text-[#ff7e90]">Buddy</span>
          </span>
          {size === "lg" && (
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-400 mt-1 tracking-tight">
              Your personal finance partner.
            </span>
          )}
        </div>
      )}
    </div>
  );
}


