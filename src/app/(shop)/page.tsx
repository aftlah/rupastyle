import Link from "next/link";
import { getProducts } from "@/lib/products";
import ProductCard from "@/components/product-card";

export const metadata = {
  title: 'RupaStyle - Fashion Pria Modern',
  description: 'Tampil maksimal dengan koleksi outfit terbaik dari RupaStyle.',
}

export const revalidate = 60;

export default async function Home() {
  const products = await getProducts();
  const latestProducts = products.slice(0, 8);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-background border-b-2 border-foreground flex flex-col items-center justify-center min-h-[80vh] w-full overflow-hidden">
        <div className="max-w-7xl mx-auto w-full px-4 py-24 relative flex flex-col items-center justify-center h-full">
          {/* Soft Decorative elements constrained to the max-w-7xl container */}
          <div className="absolute top-10 left-4 md:top-20 md:left-10 w-24 h-24 md:w-32 md:h-32 bg-purple-200 border-2 border-foreground rounded-full mix-blend-multiply opacity-70 animate-pulse"></div>
          <div className="absolute bottom-10 right-4 md:bottom-20 md:right-10 w-32 h-32 md:w-40 md:h-40 bg-yellow-100 border-2 border-foreground rotate-12 mix-blend-multiply opacity-80"></div>
          <div className="absolute top-1/4 right-8 md:top-1/3 md:right-32 w-16 h-16 md:w-20 md:h-20 bg-pink-200 border-2 border-foreground -rotate-12 mix-blend-multiply opacity-60"></div>
          
          <div className="max-w-4xl relative z-10 flex flex-col items-center text-center">
          <div className="inline-block border-2 border-foreground bg-white px-6 py-2 mb-8 transform -rotate-1 shadow-[4px_4px_0_0_rgba(0,0,0,0.9)]">
            <span className="text-sm md:text-base font-bold uppercase tracking-widest text-primary">Koleksi Eksklusif 2026</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight text-foreground mb-6 leading-[1.1]">
            Gaya <span className="text-primary relative inline-block">Maksimal<div className="absolute bottom-1 left-0 w-full h-3 bg-yellow-200 -z-10 transform -rotate-2"></div></span>, <br /> 
            Nyaman Sepanjang Hari.
          </h1>
          
          <p className="text-lg md:text-xl font-medium text-muted-foreground mb-12 max-w-2xl bg-white/50 p-4 border border-foreground/10 rounded-xl backdrop-blur-sm">
            Temukan kombinasi outfit pria terbaik yang bikin gaya lo beda dari yang lain. Jangan cuma pakai baju, bikin statement dengan pilihan terbaik kami.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-5">
            <Link 
              href="/outfit-builder" 
              className="border-2 border-foreground bg-primary text-white px-8 py-4 font-bold uppercase text-base hover:bg-primary/90 shadow-[4px_4px_0_0_rgba(0,0,0,0.9)] hover:shadow-[6px_6px_0_0_rgba(0,0,0,0.9)] hover:-translate-y-1 transition-all rounded-md"
            >
              Coba Outfit Builder
            </Link>
            <Link 
              href="#koleksi" 
              className="border-2 border-foreground bg-white text-foreground px-8 py-4 font-bold uppercase text-base hover:bg-gray-50 shadow-[4px_4px_0_0_rgba(0,0,0,0.9)] hover:shadow-[6px_6px_0_0_rgba(0,0,0,0.9)] hover:-translate-y-1 transition-all rounded-md"
            >
              Lihat Koleksi
            </Link>
          </div>
        </div>
        </div>
      </section>

      {/* Product List Section */}
      <section id="koleksi" className="py-24 px-4 max-w-7xl mx-auto w-full bg-background">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-16 border-b-2 border-foreground/10 pb-6 gap-4">
          <div className="text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-foreground">Koleksi Terbaru</h2>
            <p className="text-muted-foreground mt-2">Pilihan fashion terkini untuk menunjang penampilanmu.</p>
          </div>
          <Link href="/products" className="font-bold uppercase text-sm border-2 border-foreground px-6 py-2 rounded-md hover:bg-foreground hover:text-white transition-colors">
            Lihat Semua &rarr;
          </Link>
        </div>

        {latestProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-12">
            {latestProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border-2 border-foreground border-dashed bg-white rounded-xl">
            <h3 className="text-2xl font-bold mb-2">Belum ada produk</h3>
            <p className="text-muted-foreground">Silakan jalankan script SQL seed untuk memasukkan data.</p>
          </div>
        )}
        
        <div className="mt-12 text-center sm:hidden">
          <Link href="/products" className="inline-block font-bold uppercase border-4 border-black bg-primary text-white px-8 py-3 neo-shadow-sm hover:neo-shadow-hover hover:-translate-y-1 transition-all">
            Lihat Semua Produk
          </Link>
        </div>
      </section>
      
      {/* Footer minimal */}
      <footer className="border-t-2 border-foreground bg-white text-foreground py-16 px-4 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start gap-2">
            <h2 className="text-2xl font-black tracking-tighter uppercase bg-primary text-white px-3 py-1 transform -rotate-1 inline-block rounded-sm">
              RupaStyle
            </h2>
            <p className="font-medium text-muted-foreground mt-2 max-w-sm">Elevating your everyday style with modern and comfortable fashion.</p>
          </div>
          <p className="font-bold text-muted-foreground">© 2026 RupaStyle.</p>
        </div>
      </footer>
    </div>
  );
}
