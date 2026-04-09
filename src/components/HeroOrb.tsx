export default function HeroOrb() {
  return (
    <div className="relative w-72 h-72 md:w-96 md:h-96">
      {/* Main orb */}
      <div
        className="absolute inset-8 rounded-full"
        style={{
          background: "radial-gradient(circle, hsl(168 64% 52% / 0.3), hsl(217 91% 60% / 0.15), transparent)",
          animation: "pulse-glow 4s ease-in-out infinite",
        }}
      />
      {/* Ring */}
      <div
        className="absolute inset-0 rounded-full border"
        style={{
          borderColor: "hsl(168 64% 52% / 0.2)",
          animation: "pulse-glow 3s ease-in-out infinite 0.5s",
        }}
      />
      {/* Orbiting dots */}
      {[0, 1, 2, 3].map(i => (
        <div
          key={i}
          className="absolute left-1/2 top-1/2 w-3 h-3 -ml-1.5 -mt-1.5"
          style={{ animation: `orbit ${6 + i * 2}s linear infinite`, animationDelay: `${i * 1.5}s` }}
        >
          <div
            className="w-3 h-3 rounded-full"
            style={{
              background: i % 2 === 0 ? "hsl(168 64% 52%)" : "hsl(217 91% 60%)",
              boxShadow: `0 0 10px ${i % 2 === 0 ? "hsl(168 64% 52% / 0.6)" : "hsl(217 91% 60% / 0.6)"}`,
            }}
          />
        </div>
      ))}
    </div>
  );
}
