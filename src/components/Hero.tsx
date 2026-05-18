const heroVideoUrl =
  'https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c053a4d8d8c3664d682f638122d2b513&profile_id=165&oauth2_token_id=57447761';

const heroPosterUrl =
  'https://images.unsplash.com/photo-1559511260-66a654ae982a?w=1600&auto=format&fit=crop';

export function Hero() {
  return (
    <section className="relative isolate min-h-[520px] overflow-hidden border-b-2 border-charcoal-earth bg-black text-canvas-base">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src={heroVideoUrl}
        poster={heroPosterUrl}
        autoPlay
        loop
        muted
        playsInline
      />
      <div className="absolute inset-0 bg-black/40" aria-hidden="true" />
      <div className="relative mx-auto flex min-h-[520px] max-w-7xl flex-col justify-end px-5 pb-14 pt-28 sm:px-8 lg:px-10">
        <div className="max-w-4xl">
          <p className="mb-5 inline-flex rounded-full border-2 border-canvas-base bg-warm-honey px-4 py-2 text-sm font-black uppercase tracking-[0.22em] text-charcoal-earth shadow-[4px_4px_0px_0px_#F7F4F3]">
            Vancouver discovery board
          </p>
          <h1 className="max-w-4xl text-5xl font-black leading-[0.92] tracking-[-0.06em] sm:text-7xl lg:text-8xl">
            Events with grit, gloss, and zero fake listings.
          </h1>
          <p className="mt-6 max-w-2xl text-lg font-semibold leading-8 text-canvas-base/90 sm:text-xl">
            A tactile, card-stacked map of concerts, clubs, markets, family outings, and transit-friendly
            Vancouver plans.
          </p>
        </div>
      </div>
    </section>
  );
}
