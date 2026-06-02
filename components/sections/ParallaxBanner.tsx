export default function ParallaxBanner() {
  return (
    <div
      role="img"
      aria-label="Runners on the road — All Runners Welcome"
      className="relative h-72 sm:h-96 md:h-[28rem] flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: "url('/images/fondoSeparador.webp')",
        backgroundAttachment: "fixed",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-brand-navy/55" />

      {/* Text */}
      <p className="relative z-10 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-widest uppercase text-center px-6">
        All Runners Welcome
      </p>
    </div>
  );
}
