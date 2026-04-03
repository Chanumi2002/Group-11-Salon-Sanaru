import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { Mail, Phone, User } from "lucide-react";
import { motion } from "framer-motion";
import portraitImage from "@/assets/girl-1.jpg";

const About = () => {
  return (
    <div
      className="min-h-screen text-[#1D1616]"
      style={{
        background: "linear-gradient(135deg, #F5EDE6 0%, #E8CFC7 46%, #FFFFFF 100%)",
      }}
    >
      <Navbar />

      <main>
        <section className="mx-auto w-full max-w-[1380px] px-6 pb-12 pt-20 sm:px-10 lg:px-16 lg:pt-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="max-w-3xl"
          >
            <p
              className="mb-3 text-xs uppercase tracking-[0.32em] text-[#6B4F4F]"
              style={{ fontFamily: "'Playfair Display', 'Times New Roman', serif" }}
            >
              Salon Sanaru
            </p>
            <h1
              className="text-[clamp(2.55rem,5.2vw,4.6rem)] leading-[1.02] text-[#1D1616]"
              style={{ fontFamily: "'Playfair Display', 'Times New Roman', serif" }}
            >
              Our Story
            </h1>
          </motion.div>
        </section>

        <section className="mx-auto w-full max-w-[1380px] px-6 pb-16 sm:px-10 lg:px-16 lg:pb-20">
          <div className="grid items-start gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
            <motion.div
              initial={{ opacity: 0, x: -28 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.75, ease: "easeOut" }}
              className="overflow-hidden rounded-[1.35rem] border border-[#C9A66B]/40 bg-white/55 p-2 shadow-[0_20px_46px_-32px_rgba(107,79,79,0.5)]"
            >
              <img
                src={portraitImage}
                alt="Elegant beauty portrait"
                className="h-full min-h-[440px] w-full rounded-[1.05rem] object-cover transition-transform duration-700 hover:scale-[1.03] lg:min-h-[620px]"
              />
            </motion.div>

            <motion.article
              initial={{ opacity: 0, x: 28 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.75, ease: "easeOut", delay: 0.06 }}
              className="max-w-3xl lg:flex lg:min-h-[620px] lg:flex-col lg:justify-center"
            >
              <h2
                className="mb-5 text-[clamp(1.9rem,3.2vw,3rem)] leading-tight text-[#6B4F4F]"
                style={{ fontFamily: "'Playfair Display', 'Times New Roman', serif" }}
              >
                About Us
              </h2>

              <div className="mb-8 h-[1px] w-24 bg-[#C9A66B]/75" />

              <div className="space-y-7 text-[1.085rem] leading-[1.95] text-[#1D1616]/90">
                <p>
                  Salon Sanaru is a modern beauty salon dedicated to enhancing your natural beauty in a relaxing and
                  friendly environment. We specialize in professional hairdressing, makeup, nail care, and a wide
                  range of beauty treatments tailored to suit your individual style and needs.
                </p>

                <p>
                  Our experienced and passionate beauty artists bring creativity and skill to every service, ensuring
                  high-quality results and a personalized experience for every client. Whether you&apos;re looking for a
                  stylish haircut, flawless makeup, rejuvenating treatments, or elegant nail care, we are here to make
                  you feel confident and beautiful.
                </p>

                <p>
                  At Salon Sanaru, we also offer a carefully selected range of original, high-quality beauty and hair
                  care products. We believe in using and selling only trusted products to help you maintain your look
                  and care for your hair and skin even at home.
                </p>

                <p>
                  We are committed to providing excellent service, a comfortable atmosphere, and a memorable salon
                  experience every time you visit.
                </p>
              </div>

            </motion.article>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[1380px] px-6 pb-20 sm:px-10 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="max-w-3xl rounded-[1.15rem] border border-[#C9A66B]/45 bg-white/72 p-7 shadow-[0_18px_40px_-34px_rgba(107,79,79,0.6)] sm:p-9"
          >
            <h3
              className="mb-4 text-[1.45rem] text-[#1D1616]"
              style={{ fontFamily: "'Playfair Display', 'Times New Roman', serif" }}
            >
              Contact Information
            </h3>
            <div className="mb-6 h-[1px] w-20 bg-[#C9A66B]/75" />

            <div className="space-y-3.5 text-[1rem] leading-7 text-[#1D1616]/88">
              <div className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-[#E8CFC7]/35">
                <User className="h-4.5 w-4.5 text-[#6B4F4F]" />
                <p>
                  <span className="font-semibold text-[#1D1616]">Name:</span> Nadeeka Nilmini
                </p>
              </div>
              <div className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-[#E8CFC7]/35">
                <Phone className="h-4.5 w-4.5 text-[#6B4F4F]" />
                <p>
                  <span className="font-semibold text-[#1D1616]">Phone:</span> 077 228 5519
                </p>
              </div>
              <div className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-[#E8CFC7]/35">
                <Mail className="h-4.5 w-4.5 text-[#6B4F4F]" />
                <p>
                  <span className="font-semibold text-[#1D1616]">Email:</span> salonsanaru28@gmail.com
                </p>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
