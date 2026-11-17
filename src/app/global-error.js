"use client";

import Image from "next/image";

export default function GlobalError({ reset }) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans text-slate-900 antialiased">
        <main className="w-full max-w-2xl text-center flex flex-col items-center justify-center py-8">
          <div className="relative w-full max-w-[460px] sm:max-w-[540px] mb-3 sm:mb-4 flex justify-center">
            <Image
              src="/img/illustrations/error-500.svg?v=2"
              alt="Ilustrasi halaman mengalami kendala"
              width={540}
              height={215}
              className="w-full h-auto object-contain select-none"
              priority
              unoptimized
            />
          </div>

          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight mb-2 sm:mb-3">
            Halaman Tidak Dapat Dimuat
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-md mx-auto mb-6 sm:mb-7 leading-relaxed">
            Terjadi kendala saat memuat tampilan halaman. Silakan coba muat ulang peramban Anda.
          </p>

          <button
            type="button"
            onClick={() => reset()}
            className="text-white font-medium bg-gradient-to-b from-blue-500 via-blue-600 to-blue-700 hover:from-blue-400 hover:via-blue-500 hover:to-blue-600 border-t border-t-blue-300 border-x border-x-blue-500 border-b-2 border-b-blue-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_3px_8px_rgba(37,99,235,0.3)] active:translate-y-0.5 active:shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] rounded-lg px-7 h-11 text-sm inline-flex items-center justify-center transition-all cursor-pointer select-none"
          >
            Muat Ulang Halaman
          </button>
        </main>
      </body>
    </html>
  );
}
