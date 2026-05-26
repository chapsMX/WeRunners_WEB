import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";

export default function ForClubsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-20">
            <h1 className="text-4xl md:text-6xl font-extrabold text-foreground mb-6">
              Does your running club{" "}
              <span className="text-brand-lime">need a home?</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-8">
              Registering your club on w3runn3rs is free and takes just a few
              minutes. Once you&apos;re in, your club joins the global
              leaderboard.
            </p>
            <Button variant="primary" size="lg">
              Register Your Club — It&apos;s Free →
            </Button>
          </div>

          {/* Steps */}
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                step: 1,
                title: "Create your club",
                description:
                  "Fill in your club name, city, logo and a short description.",
              },
              {
                step: 2,
                title: "Set up your profile",
                description:
                  "Your club gets its own dashboard — ready from day one.",
              },
              {
                step: 3,
                title: "Invite your runners",
                description:
                  "Your runners join, sync their wearables and start logging km.",
              },
              {
                step: 4,
                title: "Start competing",
                description:
                  "Weekly and monthly leaderboards, powered by real data from every run.",
              },
            ].map(({ step, title, description }) => (
              <div
                key={step}
                className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50"
              >
                <div className="text-brand-lime font-bold text-sm mb-2">
                  Step {step}
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  {title}
                </h3>
                <p className="text-slate-400">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
