import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, ArrowUpRight } from "lucide-react";
import frostiqueLogo from "@/assets/frostique-logo.png";
import { Button } from "@/components/ui/button";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-border bg-card/60 backdrop-blur-sm">
      {/* Oversized ghost word, echoing hero */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 select-none whitespace-nowrap font-display text-[16vw] italic font-semibold leading-none text-primary/[0.04] sm:text-[9vw]"
      >
        Frostique
      </div>

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        {/* CTA strip */}
        <div className="mb-12 flex flex-col items-center justify-between gap-6 rounded-[2rem] border border-border bg-card px-6 py-8 shadow-soft sm:flex-row sm:px-10">
          <div className="text-center sm:text-left">
            <h3 className="font-display text-xl sm:text-2xl font-semibold text-foreground">
              Craving something <span className="italic text-gradient">sweet?</span>
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Order your next celebration cake in just a few clicks.
            </p>
          </div>
          <Button
            asChild
            size="lg"
            className="shrink-0 rounded-full bg-gradient-button px-8 shadow-button transition-bounce hover:scale-105"
          >
            <Link to="/cakes" className="flex items-center gap-2">
              Order Now <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <img
                src={frostiqueLogo}
                alt="Frostique Logo"
                className="w-10 h-10 object-contain"
              />
              <span className="hero-text text-lg">Frostique</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Handcrafted cakes baked with love for every celebration. Freshness and flavour in
              every bite.
            </p>
            <div className="flex gap-3 mt-4">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="social link"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-gradient-button hover:text-white transition-smooth"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { label: "Home", to: "/" },
                { label: "Cakes", to: "/cakes" },
                { label: "Gallery", to: "/gallery" },
                { label: "About", to: "/about" },
              ].map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    className="text-muted-foreground hover:text-primary transition-smooth"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer care */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-4">
              Customer Care
            </h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { label: "Contact Us", to: "/contact" },
                { label: "My Cart", to: "/cart" },
                { label: "My Profile", to: "/profile" },
                { label: "Track Order", to: "/profile" },
              ].map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    className="text-muted-foreground hover:text-primary transition-smooth"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-4">
              Get in Touch
            </h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span>123 Baker Street, Sweet City, IN 400001</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                <a href="tel:+919876543210" className="hover:text-primary transition-smooth">
                  +91 98765 43210
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <a
                  href="mailto:hello@frostique.com"
                  className="hover:text-primary transition-smooth"
                >
                  hello@frostique.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <p>© {year} Frostique. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <span className="text-primary">❤</span> for cake lovers
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
