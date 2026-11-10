import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { FloatingActionDock } from "@/components/shared/FloatingActionDock";

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Navbar />
      <div className="flex-1">{children}</div>
      <FloatingActionDock />
      <Footer />
    </div>
  );
}
