import Image from "next/image";

export default function Home() {
  // Variabili fisse che diventeranno dinamiche
  const countBars = 6522;
  const countProvinces = 32;

  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      
      {/* Contenitore principale (La Card) */}
      {/* Aggiungiamo bg-[url('/background-card.png')] per l'immagine */}
      {/* bg-cover e bg-center fanno in modo che l'immagine riempia bene lo spazio */}
      <div className="w-full max-w-7xl my-6 py-24 px-8 rounded-3xl border text-black shadow-lg bg-[url('/RicercaSpritz.jpeg')] bg-cover bg-center">

        <div className="flex flex-col items-center text-center">
          {/* Titolo più grande */}
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">
            Trova il tuo locale
          </h2>
          
          {/* Sottotitolo dinamico */}
          <p className="text-lg font-bold text-black mb-10">
            {countBars} bar · {countProvinces} province
          </p>
          
        {/* Barra di ricerca opaca */}
        <div className="w-full font-bold text-black max-w-2xl">
          <input 
            type="text" 
            placeholder="Nome del locale..." 
            className="w-full p-6 rounded-full border border-black bg-orange-200/75 text-black font-bold text-lg shadow-xl focus:outline-none focus:ring-4 focus:ring-amber-500/30 placeholder:text-gray-500" 
          />
        </div>
        </div>
      </div>
      
    </main>
  );
}