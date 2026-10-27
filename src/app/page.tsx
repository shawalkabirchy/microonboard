import { ArrowRight } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site";
import { Preview } from "@/components/preview";
import { Button } from "@/components/ui/button";

const steps = [
  {
    title: "Pick your moments",
    body: "Choose the key points where a little guidance makes a big difference.",
  },
  {
    title: "Add a little context",
    body: "Write clear, helpful messages for each step of your tour.",
  },
  {
    title: "Take it to your product",
    body: "Add the tour to your app and make it your own.",
  },
];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="landing-page">
        <section className="hero">
          <h1>
            A better <span>first five</span>
            <br />
            minutes.
          </h1>
          <p>
            Turn a new visitor into a confident user. Build thoughtful
            <br className="desktop-break" /> product tours, then make them your
            own.
          </p>
          <div className="hero-actions">
            <Button size="lg" asChild>
              <a href="/builder/">Build a tour</a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="/demo/">
                Try the live demo
                <ArrowRight data-icon="inline-end" />
              </a>
            </Button>
          </div>
          <small>No account. No tracking. Just a little guidance.</small>
        </section>
        <Preview hero />
        <section className="how-section" id="how-it-works">
          <h2>From first click to familiar.</h2>
          <div className="how-columns">
            {steps.map((step, index) => (
              <div className="how-step" key={step.title}>
                <span>0{index + 1}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="landing-cta">
          <div>
            <h2>A warm welcome, built by you.</h2>
            <p>Turn a new visitor into a confident user, one step at a time.</p>
          </div>
          <Button size="lg" asChild>
            <a href="/builder/">
              Open the builder
              <ArrowRight data-icon="inline-end" />
            </a>
          </Button>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
