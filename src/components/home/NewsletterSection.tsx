import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, PartyPopper } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Reveal from "@/components/Reveal";

const NewsletterSection = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast({
      title: "You're subscribed! 🎉",
      description: "Watch your inbox for sweet deals and new arrivals.",
    });
    setEmail("");
  };

  return (
    <section className="relative py-16 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-button px-6 py-14 sm:px-12 sm:py-16 text-center text-white shadow-button">
            {/* Decorative blobs, echoing hero */}
            <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-12 -right-8 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 select-none whitespace-nowrap font-display text-[14vw] italic font-semibold leading-none text-white/[0.06] sm:text-[9vw]"
            >
              Sweet Deals
            </div>

            <div className="relative z-10 mx-auto max-w-2xl">
              <div className="mx-auto mb-4 flex items-center justify-center gap-3">
                <span className="hidden h-px w-10 bg-white/50 sm:block" />
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-white/80">
                  Stay Sweet
                </span>
                <span className="hidden h-px w-10 bg-white/50 sm:block" />
              </div>

              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/20">
                <PartyPopper className="h-7 w-7" />
              </div>

              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-semibold mb-3">
                Get sweet deals <span className="italic">in your inbox.</span>
              </h2>
              <p className="text-sm sm:text-base text-white/90 mb-8">
                Subscribe for exclusive offers, seasonal specials and first dibs on new cake designs.
              </p>

              <form
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
              >
                <div className="relative flex-1">
                  <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="h-[3.25rem] rounded-full pl-11 bg-white text-foreground border-0"
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="h-[3.25rem] rounded-full bg-white text-primary hover:bg-white/90 font-semibold px-8 transition-bounce hover:scale-105"
                >
                  Subscribe
                </Button>
              </form>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default NewsletterSection;
