import { Mail, Phone } from "lucide-react";
import logoImage from "@/assets/logo.jpeg";

export function Footer() {
  return (
    <footer
      id="contact"
      className="relative overflow-hidden border-t border-[#8E1616]/30 bg-[#1D1616] py-14 font-body shadow-[0_-16px_36px_-30px_rgba(216,64,64,0.35)] sm:py-16"
    >
      <div className="mx-auto w-full max-w-[1380px] px-6 sm:px-10 lg:px-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-8">
          <div className="xl:col-span-1">
            <div className="flex items-center gap-3">
              <img
                src={logoImage}
                alt="Salon Sanaru Logo"
                className="h-11 w-11 rounded-full object-cover ring-1 ring-[#8E1616]/35"
              />
              <h3 className="text-[1.25rem] font-semibold tracking-[0.01em] text-[#EEEEEE]">
                Salon Sanaru
              </h3>
            </div>
            <p className="mt-3 max-w-[18rem] text-[0.95rem] leading-7 text-[#EEEEEE]/75">
              Enhancing your natural beauty.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.12em] text-[#D84040]">
              Services
            </h4>
            <ul className="mt-4 space-y-2.5 text-[0.95rem] text-[#EEEEEE]/80">
              <li>Hair styling</li>
              <li>Skin care</li>
              <li>Bridal makeup</li>
              <li>Nail services</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.12em] text-[#D84040]">
              Quick Links
            </h4>
            <ul className="mt-4 space-y-2.5 text-[0.95rem] text-[#EEEEEE]/80">
              <li>
                <a className="transition-colors duration-300 hover:text-[#D84040]" href="/">
                  Home
                </a>
              </li>
              <li>
                <a className="transition-colors duration-300 hover:text-[#D84040]" href="/#services">
                  Services
                </a>
              </li>
              <li>
                <a className="transition-colors duration-300 hover:text-[#D84040]" href="/products">
                  Products
                </a>
              </li>
              <li>
                <a className="transition-colors duration-300 hover:text-[#D84040]" href="#">
                  Book Appointment
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.12em] text-[#D84040]">
              Contact Information
            </h4>
            <ul className="mt-4 space-y-3 text-[0.95rem] text-[#EEEEEE]/80">
              <li className="text-[#EEEEEE]">Nadeeka Nilmini</li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-[#D84040]" />
                <a className="transition-colors duration-300 hover:text-[#D84040]" href="tel:0772285519">
                  0772285519
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-[#D84040]" />
                <a
                  className="break-all transition-colors duration-300 hover:text-[#D84040]"
                  href="mailto:salonsanaru28@gmail.com"
                >
                  salonsanaru28@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-[#8E1616]/30 pt-5 text-center text-[0.84rem] text-[#EEEEEE]/65 sm:mt-12">
          © 2026 Salon Sanaru. All rights reserved.
        </div>
      </div>
    </footer>
  );
}