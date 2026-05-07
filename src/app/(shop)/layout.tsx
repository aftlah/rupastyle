import Navbar from "@/components/navbar";

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
      {/* Footer minimal bisa dipindah ke sini juga jika ingin seragam */}
    </>
  );
}
