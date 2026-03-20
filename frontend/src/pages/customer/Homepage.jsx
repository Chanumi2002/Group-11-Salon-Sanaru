import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/common/DashboardLayout";
import heroModel from "@/assets/girl.jpg";

export default function Homepage() {
  return (
    <DashboardLayout>
      <section
        className="relative min-h-[70vh] overflow-hidden rounded-[2rem]"
        style={{
          background:
            "linear-gradient(135deg, #EEEEEE 8%, #FCE9E7 56%, #FBE1DD 100%)",
        }}
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 top-12 h-72 w-[28rem] rounded-[999px] bg-[#8E1616]/12 blur-[2px]" />
          <div className="absolute left-[18%] top-[44%] h-56 w-[24rem] -rotate-[12deg] rounded-[999px] bg-[#D84040]/15" />
          <div className="absolute -right-16 bottom-20 h-72 w-[30rem] rotate-[10deg] rounded-[999px] bg-[#8E1616]/10" />
          <div className="absolute right-[28%] top-[16%] h-52 w-52 rounded-full bg-[#D84040]/12 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto grid min-h-[70vh] w-full max-w-[1400px] grid-cols-1 items-center gap-8 px-6 py-7 md:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-16">
          <div className="max-w-xl">
            <h1 className="font-display text-[clamp(2.3rem,5.4vw,5.4rem)] font-semibold leading-[0.95] tracking-[-0.02em] text-[#220707] animate-fade-up">
              Salon Sanaru
            </h1>
            <p className="mt-6 max-w-2xl font-display text-[clamp(1rem,1.7vw,1.35rem)] font-medium tracking-[0.01em] text-[#7A1414] animate-fade-up-delayed">
              Where Beauty Meets Art - Hair, Makeup &amp; Nails. Explore our luxurious products and book your transformation today.
            </p>

            <div className="mt-11 flex flex-wrap items-center gap-3 animate-fade-up-late">
              <Link
                to="/products"
                className="rounded-full bg-[#8E1616] px-8 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-white shadow-[0_14px_34px_-16px_rgba(142,22,22,0.85)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#741212] hover:shadow-[0_20px_38px_-14px_rgba(142,22,22,0.9)]"
              >
                Book Now
              </Link>
              <Link
                to="/shop"
                className="rounded-full border border-[#8E1616]/40 bg-white/30 px-7 py-3 text-sm font-semibold uppercase tracking-[0.07em] text-[#8E1616] backdrop-blur-[1px] transition-all duration-300 hover:border-[#8E1616] hover:bg-white/50"
              >
                Explore Services
              </Link>
              <Link
                to="/products"
                className="rounded-full border border-[#8E1616]/30 bg-transparent px-7 py-3 text-sm font-semibold uppercase tracking-[0.07em] text-[#8E1616] transition-all duration-300 hover:border-[#8E1616] hover:bg-white/45"
              >
                View Products
              </Link>
            </div>
          </div>

          <div className="relative self-end lg:self-center">
            <div className="absolute -inset-x-6 bottom-12 h-24 rounded-[999px] bg-[#8E1616]/20 blur-2xl" />
            <div className="relative mx-auto w-full max-w-[600px] lg:translate-y-8">
              <img
                src={heroModel}
                alt="Smiling woman with long glossy flowing brown hair"
                className="relative z-10 h-auto w-full object-contain drop-shadow-[0_24px_34px_rgba(79,10,10,0.2)] [image-rendering:auto]"
                loading="eager"
              />
              <div className="pointer-events-none absolute inset-x-10 bottom-2 h-12 rounded-[999px] bg-white/45 blur-md" />
            </div>
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}


