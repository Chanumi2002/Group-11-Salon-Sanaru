import { Link } from "react-router-dom";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { Button } from "@/components/ui/Button";
import { Sparkles, Palette, Scissors, Brush } from "lucide-react";
import { motion } from "framer-motion";
import luxuryModel from "@/assets/girl.jpg";

const services = [
  { icon: Scissors, title: "Hair Styling", desc: "Precision cuts, color, and professional treatments" },
  { icon: Palette, title: "Makeup", desc: "Artistry for every occasion and style" },
  { icon: Sparkles, title: "Nails", desc: "Manicures, pedicures, and nail artistry" },
  { icon: Brush, title: "Beauty Treatments", desc: "Facials, skincare, and rejuvenation rituals" },
];

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section
        className="relative isolate flex min-h-[72vh] items-center overflow-hidden"
        style={{
          background:
            "linear-gradient(128deg, #EEEEEE 0%, #F6E5E2 54%, #FDEAE7 100%)",
        }}
      >
        {/* Abstract flowing forms */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 top-16 h-72 w-[24rem] rounded-[999px]"
          style={{
            background:
              "linear-gradient(95deg, rgba(142, 22, 22, 0.2), rgba(216, 64, 64, 0.08) 72%, rgba(216, 64, 64, 0))",
            filter: "blur(8px)",
          }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: [0, 22, 0], y: [0, -10, 0] }}
          transition={{ opacity: { duration: 0.9 }, x: { duration: 16, repeat: Infinity, ease: "easeInOut" }, y: { duration: 14, repeat: Infinity, ease: "easeInOut" } }}
        />
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute right-[-7rem] top-[18%] h-[26rem] w-[20rem] rounded-[999px]"
          style={{
            background:
              "linear-gradient(135deg, rgba(216, 64, 64, 0.24), rgba(142, 22, 22, 0.12))",
            filter: "blur(10px)",
          }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: [0, -14, 0], y: [0, 10, 0] }}
          transition={{ opacity: { duration: 1 }, x: { duration: 17, repeat: Infinity, ease: "easeInOut" }, y: { duration: 13, repeat: Infinity, ease: "easeInOut" } }}
        />
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute left-[42%] top-[58%] h-44 w-[35rem] -translate-x-1/2 rounded-[999px]"
          style={{
            background:
              "linear-gradient(90deg, rgba(142, 22, 22, 0.14), rgba(216, 64, 64, 0.1) 42%, rgba(216, 64, 64, 0))",
            filter: "blur(15px)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, x: [0, 20, 0] }}
          transition={{ opacity: { duration: 0.9, delay: 0.2 }, x: { duration: 20, repeat: Infinity, ease: "easeInOut" } }}
        />

        <div className="relative z-10 mx-auto w-full max-w-[1680px] px-6 py-7 sm:px-10 lg:px-16 xl:px-24 2xl:px-28">
          <div className="grid items-center gap-10 lg:grid-cols-[1.04fr_0.96fr] lg:gap-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="max-w-2xl"
            >
              <p className="mb-5 text-xs tracking-[0.38em] uppercase text-[#8E1616]/70">
                Beauty. Style. You.
              </p>
              <h1
                className="mb-4 text-[clamp(2.5rem,5.8vw,6rem)] font-semibold leading-[0.96] tracking-[-0.02em] text-[#8E1616]"
                style={{ fontFamily: "'Playfair Display', 'Times New Roman', serif" }}
              >
                Salon Sanaru
              </h1>
              <p
                className="mt-2 mb-12 max-w-2xl text-[clamp(1rem,1.65vw,1.35rem)] text-[#7A1414]"
                style={{ fontFamily: "'Playfair Display', 'Times New Roman', serif" }}
              >
                Where Beauty Meets Art - Hair, Makeup &amp; Nails. Explore our luxurious products and book your transformation today.
              </p>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="flex flex-col items-start gap-4 sm:flex-row sm:flex-wrap"
              >
                <Button
                  size="lg"
                  asChild
                  className="h-12 rounded-full bg-[#8E1616] px-10 text-base font-medium text-white shadow-[0_14px_34px_-18px_rgba(142,22,22,0.9)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#741212] hover:shadow-[0_20px_40px_-16px_rgba(142,22,22,0.85)]"
                >
                  <Link to="/register">Book Now</Link>
                </Button>
                <Button
                  size="lg"
                  asChild
                  variant="outline"
                  className="h-12 rounded-full border-[#8E1616]/40 bg-transparent px-9 text-base font-medium text-[#8E1616] transition-all duration-300 hover:border-[#8E1616] hover:bg-white/55"
                >
                  <Link to="/services">Explore Services</Link>
                </Button>
                <Button
                  size="lg"
                  asChild
                  variant="outline"
                  className="h-12 rounded-full border-[#8E1616]/35 bg-white/20 px-9 text-base font-medium text-[#8E1616] transition-all duration-300 hover:border-[#8E1616] hover:bg-white/55"
                >
                  <Link to="/products">View Products</Link>
                </Button>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, ease: "easeOut", delay: 0.1 }}
              className="relative mx-auto mt-6 w-full max-w-[760px] lg:mt-0 lg:translate-x-10"
            >
              <div className="pointer-events-none absolute -bottom-1 left-1/2 h-16 w-[66%] -translate-x-1/2 rounded-[999px] bg-[#8E1616]/20 blur-2xl" />
              <div className="pointer-events-none absolute right-12 top-14 h-36 w-36 rounded-full bg-white/50 blur-2xl" />
              <img
                src={luxuryModel}
                alt="Smiling woman with long, glossy flowing brown hair"
                className="relative z-10 h-auto w-full object-contain drop-shadow-[0_22px_34px_rgba(97,17,17,0.2)] [image-rendering:auto] [mask-image:linear-gradient(to_bottom,rgba(0,0,0,1)_75%,rgba(0,0,0,0.62)_92%,transparent_100%)]"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services preview */}
      <section className="py-28 lg:py-32 bg-[#1D1616]" id="services">
        <div className="mx-auto w-full max-w-[1380px] px-6 sm:px-10 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center lg:mb-20"
          >
            <p 
              className="text-xs uppercase tracking-[0.32em] text-[#D84040] mb-3"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Premium Offerings
            </p>
            <h2 
              className="text-[clamp(2.2rem,4.2vw,3.4rem)] font-semibold leading-[1.1] text-[#EEEEEE] mb-4"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Our Services
            </h2>
            <p className="text-[1rem] text-[#C9B3B3] max-w-2xl mx-auto leading-7">
              Discover our carefully curated collection of professional beauty and styling services, each designed to enhance your natural beauty and elevate your confidence.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {services.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="group relative rounded-lg border border-[#8E1616]/40 bg-[#2A2020] p-8 transition-all duration-500 hover:border-[#D84040]/60 hover:bg-[#332626] hover:shadow-[0_16px_40px_-12px_rgba(216,64,64,0.25)]"
              >
                <div className="mb-6 inline-flex items-center justify-center h-16 w-16 rounded-lg bg-[#8E1616]/20 transition-all duration-300 group-hover:bg-[#D84040]/25">
                  <s.icon className="h-7 w-7 text-[#D84040] transition-transform duration-300 group-hover:scale-110" />
                </div>
                <h3 
                  className="text-[1.15rem] font-semibold mb-2 text-[#EEEEEE]"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {s.title}
                </h3>
                <p className="text-[0.96rem] leading-6 text-[#B99A9A]">
                  {s.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="relative overflow-hidden bg-[#EEEEEE] py-28 lg:py-32">
        <div className="mx-auto w-full max-w-[900px] px-6 sm:px-10 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="flex flex-col items-center text-center"
          >
            <p 
              className="text-xs uppercase tracking-[0.32em] text-black mb-4"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Discover
            </p>
            
            <h2 
              className="text-[clamp(2.2rem,4.2vw,3.6rem)] font-semibold leading-[1.08] text-black mb-8"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Our Essence
            </h2>

            <p 
              className="text-[1.02rem] leading-[1.9] text-black mb-10 tracking-[0.02em]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Salon Sanaru is a modern beauty salon dedicated to helping you look and feel your best. We offer professional hairdressing, makeup, and nail services in a relaxing and welcoming environment. Beyond our expert services, we provide a curated selection of premium beauty and hair care products so you can maintain your look at home. At Salon Sanaru, your style and satisfaction are our top priority.
            </p>

            {/* Premium Button */}
            <motion.a
              href="/about-us"
              whileHover={{ x: 8 }}
              transition={{ duration: 0.3 }}
              className="inline-flex items-center gap-2 px-8 py-3.5 border-2 border-[#8E1616] text-[#8E1616] text-[0.98rem] font-semibold tracking-[0.01em] rounded-lg transition-all duration-300 hover:bg-[#8E1616] hover:text-[#EEEEEE] hover:border-[#D84040] hover:shadow-[0_12px_24px_-8px_rgba(216,64,64,0.3)]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              View More
              <svg className="h-4 w-4 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </motion.a>

            {/* Decorative accent line */}
            <div className="mt-12 h-px w-16 bg-gradient-to-r from-[#8E1616]/60 to-transparent" />
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
