import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";

export default function EventsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-foreground mb-6">
            Discover <span className="text-brand-lime">IRL Events</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12">
            Find running events near you or create your own. Marathons, HYROX,
            fun runs, club meetups — all in one place.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="p-8 rounded-2xl border border-slate-800 bg-slate-900/50 text-left">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                Find an Event
              </h3>
              <p className="text-slate-400 mb-6">
                Discover races and meetups happening near you.
              </p>
              <Button variant="secondary" disabled>
                Coming Soon
              </Button>
            </div>
            <div className="p-8 rounded-2xl border border-slate-800 bg-slate-900/50 text-left">
              <div className="text-4xl mb-4">➕</div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                Create an Event
              </h3>
              <p className="text-slate-400 mb-6">
                Organize your own event and invite the running community.
              </p>
              <Button variant="secondary" disabled>
                Coming Soon
              </Button>
            </div>
          </div>

          <p className="text-slate-500 text-sm">
            Events feature coming at launch. Join the waitlist to be notified.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
