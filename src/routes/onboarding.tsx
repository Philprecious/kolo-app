import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import onb1 from "@/assets/onboarding-1.png";
import onb2 from "@/assets/onboarding-2.png";
import onb3 from "@/assets/onboarding-3.png";
import onb4 from "@/assets/onboarding-4.png";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Welcome to KÒLÓ — Digital Savings Circles" },
      {
        name: "description",
        content:
          "Get started with KÒLÓ — save together with trusted circles, powered by Nomba.",
      },
    ],
  }),
  component: Onboarding,
});

type Slide = {
  image: string;
  title: React.ReactNode;
  subtitle: string;
};

const slides: Slide[] = [
  {
    image: onb1,
    title: (
      <>
        Save together,
        <br />
        <span className="text-primary">achieve</span> together.
      </>
    ),
    subtitle: "Join a trusted savings circle, contribute easily, and grow easily",
  },
  {
    image: onb2,
    title: (
      <>
        One contribution at
        <br />a time.
      </>
    ),
    subtitle: "Turn small, consistent payments into something bigger",
  },
  {
    image: onb3,
    title: (
      <>
        Money <span className="text-primary">grows</span>
        <br />
        where <span className="text-primary">trust</span> exists.
      </>
    ),
    subtitle: "KÒLÓ makes community savings simpler, clearer, and more reliable",
  },
  {
    image: onb4,
    title: (
      <>
        Watch your circle
        <br />
        grow
      </>
    ),
    subtitle:
      "From weekly contributions to payout day, follow every step of your savings journey with confidence",
  },
];

function Onboarding() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<"splash" | "carousel">("splash");
  const [emblaRef, embla] = useEmblaCarousel({ loop: false, align: "start" });
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (phase !== "splash") return;
    const t = setTimeout(() => setPhase("carousel"), 1600);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (!embla) return;
    const onSel = () => setIndex(embla.selectedScrollSnap());
    embla.on("select", onSel);
    onSel();
    return () => {
      embla.off("select", onSel);
    };
  }, [embla]);

  const finish = () => {
    navigate({ to: "/auth/signup" });
  };


  const next = () => {
    if (!embla) return;
    if (index >= slides.length - 1) finish();
    else embla.scrollNext();
  };

  if (phase === "splash") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-white">
        <h1 className="text-6xl font-extrabold tracking-tight text-primary">
          KÒLÓ
        </h1>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-white">
      <div className="relative mx-auto flex min-h-dvh max-w-[440px] flex-col bg-white">
        <button
          onClick={finish}
          className="absolute right-6 top-5 z-20 text-base font-semibold text-primary"
        >
          Skip
        </button>

        <div className="flex-1 overflow-hidden" ref={emblaRef}>
          <div className="flex h-full">
            {slides.map((s, i) => (
              <div key={i} className="flex h-full min-w-0 flex-[0_0_100%] flex-col">
                {/* Illustration area (pale purple) */}
                <div className="relative bg-primary-pale">
                  <div className="flex h-[52vh] items-end justify-center overflow-hidden">
                    <img
                      src={s.image}
                      alt=""
                      loading={i === 0 ? undefined : "lazy"}
                      className="h-full w-auto object-contain"
                    />
                  </div>
                  {/* Dark purple curve peeking up on right, white curve dipping in on left */}
                  <svg
                    aria-hidden
                    viewBox="0 0 440 110"
                    preserveAspectRatio="none"
                    className="absolute inset-x-0 -bottom-px h-[90px] w-full"
                  >
                    {/* Dark purple wave */}
                    <path
                      d="M0,110 L0,75 C90,75 130,70 200,55 C280,38 340,10 440,25 L440,110 Z"
                      className="fill-primary"
                    />
                    {/* White foreground with rounded top-left cutout */}
                    <path
                      d="M0,110 L0,95 C80,95 130,88 200,72 C285,52 350,30 440,45 L440,110 Z"
                      fill="white"
                    />
                  </svg>
                </div>

                {/* Text + CTA */}
                <div className="flex flex-1 flex-col items-center justify-between bg-white px-8 pb-8 pt-8 text-center">
                  <div>
                    <h2 className="text-[32px] font-extrabold leading-[1.15] tracking-tight text-neutral-900">
                      {s.title}
                    </h2>
                    <p className="mx-auto mt-4 max-w-[320px] text-[15px] leading-relaxed text-neutral-500">
                      {s.subtitle}
                    </p>
                  </div>

                  <div className="w-full">
                    <div className="mb-6 flex items-center justify-center gap-2">
                      {slides.map((_, di) => (
                        <span
                          key={di}
                          className={`h-2 rounded-full transition-all ${
                            di === index
                              ? "w-2 bg-primary"
                              : "w-2 bg-primary/20"
                          }`}
                        />
                      ))}
                    </div>

                    <button
                      onClick={next}
                      className="w-full rounded-full bg-primary py-4 text-base font-bold text-white transition active:scale-[0.98]"
                    >
                      Get Started
                    </button>

                    <p className="mt-5 text-sm text-neutral-500">
                      Already have an account?{" "}
                      <Link to="/" className="font-semibold text-primary">
                        Login
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
