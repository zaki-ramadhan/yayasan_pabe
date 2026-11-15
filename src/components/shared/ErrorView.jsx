import Image from "next/image";

export function ErrorView({
  statusCode = 404,
  title,
  description,
  illustrationSrc,
  primaryAction,
}) {
  // Gunakan cache buster parameter untuk melewati browser immutable cache
  const defaultAsset = `/img/illustrations/error-${statusCode}.svg?v=2`;
  const imgSrc = illustrationSrc || defaultAsset;

  return (
    <div className="w-full max-w-2xl text-center flex flex-col items-center justify-center py-4 sm:py-8 animate-in fade-in duration-300">
      {/* Hero Illustration (1.5x lebih lebar, proporsional mengikuti rasio 410x163) */}
      <div className="relative w-full max-w-[460px] sm:max-w-[540px] mb-3 sm:mb-4 flex justify-center">
        <Image
          src={imgSrc}
          alt={`Ilustrasi error ${statusCode} - ${title}`}
          width={540}
          height={215}
          className="w-full h-auto object-contain select-none"
          priority
          unoptimized
        />
      </div>

      {/* Main Title (Font weight diturunkan 1 tingkat ke font-semibold) */}
      <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight mb-2 sm:mb-3">
        {title}
      </h1>

      {/* Subtitle / Description (Kontras tinggi, ringkas & jelas) */}
      <p className="text-sm sm:text-base text-slate-600 max-w-md mx-auto mb-6 sm:mb-7 leading-relaxed">
        {description}
      </p>

      {/* Single CTA Action Button */}
      <div className="flex items-center justify-center w-full sm:w-auto">
        {primaryAction}
      </div>
    </div>
  );
}
