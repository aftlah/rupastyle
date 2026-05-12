import Navbar from "@/components/navbar";
import WhatsAppChat from "@/components/whatsapp-chat";
import Histats from "@/components/histats";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <WhatsAppChat />
      <Histats />
    </>
  );
}
