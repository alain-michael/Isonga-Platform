interface ChevronPatternSVGProps {
  fillColor?: string;
  height?: number;
}

const ChevronPatternSVG = ({
  fillColor = "#ffffff",
  height = 40,
}: ChevronPatternSVGProps) => {
  const patternId = "chevron-negative-space-3";

  return (
    <svg
      className="w-full h-full block"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
    >
      <defs>
        {/* Increased logical width to 120 to fit 3 distinct sections
         */}
        <pattern
          id={patternId}
          width="100%"
          height={height}
          patternUnits="userSpaceOnUse"
          viewBox={`0 0 120 ${height}`} // Establish a coordinate system 0-120
          preserveAspectRatio="none"
        >
          {/* STRATEGY: 
             We are drawing the WHITE (overlay) parts.
             Everything transparent reveals the DARK background.
          */}

          {/* 1. The Main Solid Block (Rightmost Connection) */}
          <polygon
            points={`
              120,0 
              120,${height} 
              85,${height} 
              105,${height / 2} 
              85,0
            `}
            fill={fillColor}
          />

          {/* 2. The Middle Stripe */}
          <polygon
            points={`
              70,0 
              90,${height / 2} 
              70,${height} 
              50,${height} 
              70,${height / 2} 
              50,0
            `}
            fill={fillColor}
          />

          {/* 3. The New Third Stripe (Leftmost) */}
          <polygon
            points={`
              35,0 
              55,${height / 2} 
              35,${height} 
              15,${height} 
              35,${height / 2} 
              15,0
            `}
            fill={fillColor}
          />
        </pattern>
      </defs>

      <rect
        x="0"
        y="0"
        width="100%"
        height="100%"
        fill={`url(#${patternId})`}
      />
    </svg>
  );
};

export default ChevronPatternSVG;
