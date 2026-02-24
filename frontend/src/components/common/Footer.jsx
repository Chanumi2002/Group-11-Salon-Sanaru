import { Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-900 dark:bg-card text-white dark:text-foreground">
      <div className="container py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <img src="/logo.jpeg" alt="Salon Sanaru Logo" className="h-10 w-10 object-contain rounded-full" />
            <span className="font-display text-lg font-bold">Salon Sanaru</span>
          </div>
          <p className="text-sm opacity-70">
            Your destination for style, relaxation, and self-care. We bring elegance to every visit.
          </p>
        </div>

        <div>
          <h4 className="font-display text-base font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm opacity-70">
            <li>Home</li>
            <li>Services</li>
            <li>Products</li>
            <li>Book Appointment</li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-base font-semibold mb-4">Contact Us</h4>
          <ul className="space-y-3 text-sm opacity-70">
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              123 Beauty Lane, Colombo 07
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" />
              +94 77 123 4567
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              hello@salonsanaru.com
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4">
        <p className="text-center text-xs opacity-50">
          © 2026 Salon Sanaru. All rights reserved.
        </p>
      </div>
    </footer>
  );
}