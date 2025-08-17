import React, { useMemo } from "react";
import { useToast } from "../hooks/use-toast";
import Spline from "@splinetool/react-spline";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";
import { ArrowRight, Coins, Crown, Shield, Zap, Twitter, Send, ExternalLink, Copy } from "lucide-react";
import { hero, tokenomics, howToBuy, roadmap, faqs } from "../mock/mock";

const Section = ({ id, children, className = "" }) => (
  <section id={id} className={`dark-full-container ${className}`}>{children}</section>
);

export default function Landing() {
  const { toast } = useToast();

  const onDexClick = (e) => {
    e.preventDefault();
    toast({ title: "DEX listing soon", description: "We'll drop the link here at launch.", duration: 3000 });
  };

  const onCommunityClick = (platform) => (e) => {
    e.preventDefault();
    toast({ title: `Join ${platform}`, description: "Links will go live shortly.", duration: 3000 });
  };

  const copyTicker = async () => {
    try {
      await navigator.clipboard.writeText(hero.ticker);
      toast({ title: "Copied", description: `${hero.ticker} added to clipboard`, duration: 2500 });
    } catch (_) {
      toast({ title: "Copy failed", description: "Clipboard unavailable in this browser", duration: 2500 });
    }
  };

  const features = useMemo(() => [
    { icon: Crown, title: "Legend Energy", desc: "A rebel return story powered by memetic momentum." },
    { icon: Shield, title: "Liquidity Locked", desc: "Built for trust. We protect the table and the players." },
    { icon: Zap, title: "High-Volt Community", desc: "Degens, dreamers, and kingmakers pulsing in sync." },
  ], []);

  return (
    <div className="dark-container">
      {/* Header */}
      <header className="dark-header">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="h-9 w-9 flex items-center justify-center bg-white text-black font-bold" style={{ borderRadius: 0 }}>K</div>
          <div className="heading-2 tracking-tight">KING OF GAMBLER</div>
        </div>
        <nav className="dark-nav">
          <a className="dark-nav-link" href="#tokenomics">Tokenomics</a>
          <a className="dark-nav-link" href="#how-to-buy">How to Buy</a>
          <a className="dark-nav-link" href="#roadmap">Roadmap</a>
          <a className="dark-nav-link" href="#faq">FAQ</a>
        </nav>
        <div className="hidden md:flex items-center gap-3">
          <button className="btn-secondary dark-button-animate" onClick={copyTicker}>
            <Copy size={18} /> {hero.ticker}
          </button>
          <a href="#" onClick={onDexClick} className="btn-primary dark-button-animate">
            Buy on DEX <ArrowRight size={18} />
          </a>
        </div>
      </header>

      {/* Hero */}
      <Section id="hero" className="pad-xlarge">
        <div className="dark-content-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12">
            {/* Left copy */}
            <div className="space-y-6">
              <h1 className="display-huge">{hero.title} <span className="body-medium align-middle">{hero.ticker}</span></h1>
              <p className="body-medium max-w-xl">{hero.subtitle}</p>
              <div className="flex flex-wrap items-center gap-3">
                <a href={hero.ctas.dexUrl} onClick={onDexClick} className="btn-primary dark-button-animate">
                  Buy on DEX <ExternalLink size={18} />
                </a>
                <button className="btn-secondary dark-button-animate" onClick={onCommunityClick('Telegram')}>
                  <Send size={18} /> Join Telegram
                </button>
                <button className="btn-secondary dark-button-animate" onClick={onCommunityClick('X/Twitter')}>
                  <Twitter size={18} /> Join X
                </button>
              </div>
              <div className="flex gap-6 pt-4 text-sm text-white/70">
                <div className="inline-flex items-center gap-2">
                  <Coins size={16} className="text-white/60" /> Fair launch ethos
                </div>
                <div className="inline-flex items-center gap-2">
                  <Shield size={16} className="text-white/60" /> Liquidity locked
                </div>
              </div>
            </div>
            {/* Right 3D Spline */}
            <div className="relative flex justify-center lg:justify-end overflow-visible">
              <div className="neon-orb" />
              <div style={{ width: 700, height: 700 }} className="hidden md:block">
                <Spline scene="https://prod.spline.design/NbVmy6DPLhY-5Lvg/scene.splinecode" />
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Features */}
      <Section id="features" className="pad-large">
        <div className="dark-content-container dark-grid">
          {features.map((f, idx) => (
            <div key={idx} className="glass-panel p-8 dark-transition">
              <div className="flex items-center gap-3 mb-3">
                <f.icon className="text-white" size={22} />
                <div className="heading-2">{f.title}</div>
              </div>
              <p className="body-medium text-white/80">{f.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Tokenomics */}
      <Section id="tokenomics" className="pad-large">
        <div className="dark-content-container">
          <div className="mb-8">
            <h2 className="display-large">Tokenomics</h2>
            <p className="body-small text-white/70">Built to rally the community and fund the comeback.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tokenomics.map((t) => (
              <div key={t.label} className="glass-panel p-6 flex flex-col gap-2">
                <div className="heading-2">{t.label}</div>
                <div className="display-medium">{t.value}%</div>
                <div className="body-small text-white/70">{t.note}</div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* How to Buy */}
      <Section id="how-to-buy" className="pad-large">
        <div className="dark-content-container">
          <div className="mb-8">
            <h2 className="display-large">How to Buy</h2>
            <p className="body-small text-white/70">Four quick steps to join the high-rollers.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {howToBuy.map((s) => (
              <div key={s.step} className="glass-panel p-6">
                <div className="heading-3 text-white/80 mb-1">Step {s.step}</div>
                <div className="heading-2 mb-1">{s.title}</div>
                <p className="body-small text-white/70">{s.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Roadmap */}
      <Section id="roadmap" className="pad-large">
        <div className="dark-content-container">
          <div className="mb-8">
            <h2 className="display-large">Roadmap</h2>
            <p className="body-small text-white/70">From breakout to the crown.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {roadmap.map((r) => (
              <div key={r.title} className="glass-panel p-6">
                <div className="heading-2 mb-2">{r.title}</div>
                <ul className="list-disc list-inside text-white/80 body-small space-y-1">
                  {r.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* FAQ */}
      <Section id="faq" className="pad-large">
        <div className="dark-content-container">
          <div className="mb-8">
            <h2 className="display-large">FAQ</h2>
            <p className="body-small text-white/70">All the essentials you need to know.</p>
          </div>
          <div className="glass-panel p-4">
            <Accordion type="single" collapsible>
              {faqs.map((f, idx) => (
                <AccordionItem key={idx} value={`item-${idx}`}>
                  <AccordionTrigger className="heading-3 text-left">{f.q}</AccordionTrigger>
                  <AccordionContent className="body-small text-white/80">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </Section>

      {/* CTA */}
      <Section id="cta" className="pad-large">
        <div className="dark-content-container">
          <div className="glass-panel p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="display-medium">Take your seat at the table.</div>
              <div className="body-small text-white/70">The King returns. Don’t miss the first hand.</div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <a href="#" onClick={onDexClick} className="btn-primary dark-button-animate">
                Buy on DEX <ArrowRight size={18} />
              </a>
              <button className="btn-secondary dark-button-animate" onClick={onCommunityClick('Telegram')}>
                <Send size={18} /> Join Telegram
              </button>
              <button className="btn-secondary dark-button-animate" onClick={onCommunityClick('X/Twitter')}>
                <Twitter size={18} /> Join X
              </button>
            </div>
          </div>
        </div>
      </Section>

      {/* Footer */}
      <footer className="dark-full-container border-t" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="dark-content-container py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="body-small text-white/60">© {new Date().getFullYear()} KING OF GAMBLER — $KOG</div>
          <div className="flex items-center gap-3">
            <button className="btn-secondary" onClick={onCommunityClick('Telegram')}>
              <Send size={18} /> Telegram
            </button>
            <button className="btn-secondary" onClick={onCommunityClick('X/Twitter')}>
              <Twitter size={18} /> X/Twitter
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}