<script lang="ts">
    const lines = [
        "I am actively looking out for",
        "Platform Engineering",
        "DevOps Engineering",
        "Site Reliability Engineering",
    ];
</script>

<!-- animated background -->
<div class="pointer-events-none absolute inset-0 overflow-hidden">
    <div
        class="absolute -left-20 top-[10%] h-72 w-72 rounded-full bg-black/10 blur-3xl dark:bg-white/10"
        style="animation: floatBlob 14s ease-in-out infinite;"
    />
    <div
        class="absolute right-[-4rem] top-[18%] h-80 w-80 rounded-full bg-black/15 blur-3xl dark:bg-white/15"
        style="animation: floatBlob 18s ease-in-out infinite 2s;"
    />
    <div
        class="absolute bottom-[8%] left-[28%] h-72 w-72 rounded-full bg-black/10 blur-3xl dark:bg-white/10"
        style="animation: floatBlob 16s ease-in-out infinite 4s;"
    />

    <div
        class="absolute inset-0 opacity-60 dark:opacity-70"
        style="
        background:
          radial-gradient(circle at 20% 20%, rgba(0,0,0,0.08), transparent 28%),
          radial-gradient(circle at 80% 30%, rgba(0,0,0,0.10), transparent 30%),
          radial-gradient(circle at 50% 80%, rgba(0,0,0,0.08), transparent 25%);
      "
    />
    <div
        class="absolute inset-0 hidden dark:block"
        style="
        background:
          radial-gradient(circle at 20% 20%, rgba(255,255,255,0.08), transparent 28%),
          radial-gradient(circle at 80% 30%, rgba(255,255,255,0.10), transparent 30%),
          radial-gradient(circle at 50% 80%, rgba(255,255,255,0.08), transparent 25%);
      "
    />
</div>

<!-- content -->
<div
    class="relative z-10 mx-auto w-3/4 my-4 max-w-4xl rounded-[2rem] border border-black/10 bg-white/70 p-8 shadow-2xl backdrop-blur-xl md:p-12 dark:border-white/10 dark:bg-white/5"
>
    <p
        class="text-center text-lg leading-relaxed text-black/80 md:leading-relaxed dark:text-white/80"
    >
        <span
            class="inline-block bg-[length:200%_200%] bg-clip-text text-transparent"
            style="
          background-image: linear-gradient(
            90deg,
            rgba(0,0,0,0.95),
            rgba(0,0,0,0.45),
            rgba(0,0,0,0.95)
          );
          animation: shimmerText 8s ease-in-out infinite;
        "
        >
            {lines[0]}
        </span>

        <br />

        <span
            class="inline-block bg-[length:200%_200%] bg-clip-text text-transparent font-semibold"
            style="
          background-image: linear-gradient(
            90deg,
            rgba(0,0,0,1),
            rgba(0,0,0,0.45),
            rgba(0,0,0,1)
          );
          animation: shimmerText 7s ease-in-out infinite;
        "
        >
            {lines[1]}
        </span>

        <br />

        <span
            class="inline-block bg-[length:200%_200%] bg-clip-text text-transparent font-semibold"
            style="
          background-image: linear-gradient(
            90deg,
            rgba(0,0,0,1),
            rgba(0,0,0,0.45),
            rgba(0,0,0,1)
          );
          animation: shimmerText 7s ease-in-out infinite 0.8s;
        "
        >
            {lines[2]}
        </span>

        <br />

        <span
            class="inline-block bg-[length:200%_200%] bg-clip-text text-transparent font-semibold"
            style="
          background-image: linear-gradient(
            90deg,
            rgba(0,0,0,1),
            rgba(0,0,0,0.45),
            rgba(0,0,0,1)
          );
          animation: shimmerText 7s ease-in-out infinite 1.6s;
        "
        >
            {lines[3]}
        </span>

        <br />

        <span class="text-black/75 dark:text-white/75">
            roles at the moment and if you happen to know any openings that can
            help me, do drop me an email and help me out here at
        </span>
        <a
            href="mailto:me@gats.dev"
            class="ml-2 inline-block underline decoration-black/40 underline-offset-4 transition hover:decoration-black dark:decoration-white/40 dark:hover:decoration-white"
        >
            me[at]gats[dot]dev
        </a>
    </p>
</div>

<style>
    :global(.dark) .bg-clip-text {
        background-image: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.98),
            rgba(255, 255, 255, 0.45),
            rgba(255, 255, 255, 0.98)
        ) !important;
    }

    @keyframes shimmerText {
        0%,
        100% {
            background-position: 0% 50%;
        }
        50% {
            background-position: 100% 50%;
        }
    }

    @keyframes floatBlob {
        0%,
        100% {
            transform: translate(0, 0) scale(1);
        }
        25% {
            transform: translate(24px, -18px) scale(1.08);
        }
        50% {
            transform: translate(-12px, 20px) scale(0.96);
        }
        75% {
            transform: translate(18px, 10px) scale(1.03);
        }
    }
</style>
