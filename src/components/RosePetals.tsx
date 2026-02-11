const petals = [
  { left: "6%", size: 14, duration: 14, delay: -2, drift: "8vw", rotate: "12deg", opacity: 0.6 },
  { left: "14%", size: 18, duration: 16, delay: -8, drift: "-6vw", rotate: "42deg", opacity: 0.7 },
  { left: "22%", size: 12, duration: 12, delay: -4, drift: "10vw", rotate: "18deg", opacity: 0.5 },
  { left: "33%", size: 16, duration: 15, delay: -10, drift: "-9vw", rotate: "30deg", opacity: 0.65 },
  { left: "41%", size: 20, duration: 18, delay: -6, drift: "6vw", rotate: "55deg", opacity: 0.75 },
  { left: "52%", size: 13, duration: 13, delay: -3, drift: "-7vw", rotate: "20deg", opacity: 0.55 },
  { left: "61%", size: 17, duration: 17, delay: -12, drift: "9vw", rotate: "38deg", opacity: 0.7 },
  { left: "71%", size: 15, duration: 14, delay: -5, drift: "-10vw", rotate: "24deg", opacity: 0.6 },
  { left: "81%", size: 21, duration: 19, delay: -9, drift: "7vw", rotate: "48deg", opacity: 0.8 },
  { left: "90%", size: 12, duration: 13, delay: -7, drift: "-5vw", rotate: "28deg", opacity: 0.5 },
];

const RosePetals = () => (
  <div className="rose-petals" aria-hidden="true">
    {petals.map((petal, index) => (
      <span
        key={`rose-petal-${index}`}
        className="rose-petal"
        style={{
          left: petal.left,
          animationDelay: `${petal.delay}s`,
          animationDuration: `${petal.duration}s`,
          ["--petal-size" as const]: `${petal.size}px`,
          ["--petal-drift" as const]: petal.drift,
          ["--petal-rotate" as const]: petal.rotate,
          ["--petal-opacity" as const]: petal.opacity,
        }}
      />
    ))}
  </div>
);

export default RosePetals;
