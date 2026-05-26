import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function WaitlistPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background flex items-center justify-center pt-24 pb-16 px-4">
        <div className="max-w-lg w-full mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-brand-lime/10 text-brand-lime text-sm font-medium px-4 py-2 rounded-full mb-8">
            <span>🏃</span>
            <span>Early Access</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4">
            Join the Waitlist
          </h1>
          <p className="text-lg text-slate-400 mb-10">
            Be the first to know when w3runn3rs launches. Pick your running
            club, make it count.
          </p>

          {/* Viral Loops will be embedded here — placeholder form for now */}
          <form className="flex flex-col sm:flex-row gap-3">
            <Input
              type="email"
              placeholder="your@email.com"
              className="flex-1"
            />
            <Button type="submit" variant="primary">
              Join Waitlist →
            </Button>
          </form>
          <p className="text-slate-500 text-sm mt-4">
            No spam. Unsubscribe anytime.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
