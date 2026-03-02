import { Link } from "react-router-dom";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { Button } from "@/components/ui/button";
import { Sparkles, Heart, Clock } from "lucide-react";
import { motion } from "framer-motion";
import salonHero from "@/assets/salon-hero.jpg";

const services = [
  { icon: Sparkles, title: "Hair Styling", desc: "Trendy cuts, coloring, and treatments" },
  { icon: Heart, title: "Skin Care", desc: "Facials, peels, and rejuvenation" },
  { icon: Clock, title: "Nail Art", desc: "Manicures, pedicures, and nail art" },
];

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section 
        className="relative overflow-hidden min-h-screen flex items-center justify-center"
        style={{
          backgroundImage: `url(${salonHero})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/25"></div>
        
        {/* Content */}
        <div className="relative container py-20 text-center z-10">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="font-display text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg"
          >
            Welcome to Salon Sanaru
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-lg md:text-xl text-white/95 max-w-xl mx-auto mb-8 drop-shadow-md"
          >
            Where style meets elegance. Book your appointment and experience
            luxury self-care.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <Button size="lg" asChild className="text-base px-8">
              <Link to="/register">Get Started</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Services preview */}
      <section className="container py-20" id="services">
        <h2 className="font-display text-3xl font-bold text-center mb-2">
          Our Services
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-md mx-auto">
          We offer a wide range of styling services to make you look and feel your best.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          {services.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-card rounded-xl p-8 text-center shadow-salon hover:shadow-salon-hover transition-shadow duration-300"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-salon-pink-light mb-4">
                <s.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* About */}
      <section className="gradient-soft py-20">
        <div className="container text-center max-w-2xl">
          <h2 className="font-display text-3xl font-bold mb-4">About Us</h2>
          <p className="text-muted-foreground leading-relaxed">
            Salon Sanaru has been redefining style since 2018. Our team of expert
            stylists and grooming professionals are passionate about helping you look
            and feel your absolute best. From classic cuts to the latest trends, we
            create personalized experiences in a warm, welcoming environment.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
