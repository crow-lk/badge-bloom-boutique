import { useMemo } from "react";

type Snowflake = {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  opacity: number;
};

const FLAKE_COUNT = 48;

const SeasonalSnow = () => {
  const flakes = useMemo<Snowflake[]>(() => {
    return Array.from({ length: FLAKE_COUNT }).map((_, index) => ({
      id: index,
      left: Math.random() * 100,
      delay: Math.random() * 8,
      duration: 12 + Math.random() * 12,
      size: 4 + Math.random() * 6,
      opacity: 0.35 + Math.random() * 0.4,
    }));
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[90] overflow-hidden" aria-hidden>
      {flakes.map((flake) => (
        <span
          key={flake.id}
          className="snowflake"
          style={{
            left: `${flake.left}%`,
            animationDelay: `${flake.delay}s`,
            animationDuration: `${flake.duration}s`,
            width: `${flake.size}px`,
            height: `${flake.size}px`,
            opacity: flake.opacity,
          }}
        />
      ))}
    </div>
  );
};

export default SeasonalSnow;
