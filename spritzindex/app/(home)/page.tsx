import Image from "next/image";
import { AspectRatio } from "@/components/ui/aspect-ratio";


// Sostituire questo array con il risultato della tua query al DB
const getPrezziDalDB = async () => {
  return [
    { provincia: "Belluno", prezzo: 4.20 },
    { provincia: "Treviso", prezzo: 3.50 },
    { provincia: "Vicenza", prezzo: 3.20 },
    { provincia: "Verona", prezzo: 3.80 },
    { provincia: "Padova", prezzo: 3.40 },
    { provincia: "Venezia", prezzo: 4.80 },
    { provincia: "Rovigo", prezzo: 2.90 },
  ];
};



// Mappa statice delle coordinate in percentuale sull'immagine per ogni provincia
//Usando le percentuali, se guardi il sito da un cellulare o da un monitor 4K, il pallino di Venezia rimarrà sempre sul 72% della larghezza e sul 62% dell'altezza della mappa.
const coordinateProvince: Record<string, { top: string; left: string }> = {
  "Belluno": { top: "30%", left: "62%" },
  "Treviso": { top: "50%", left: "65%" },
  "Vicenza": { top: "56%", left: "37%" },
  "Verona":  { top: "65%", left: "22%" },
  "Padova":  { top: "68%", left: "50%" },
  "Venezia": { top: "62%", left: "65%" },
  "Rovigo":  { top: "75%", left: "55%" },
};

// 3. Funzione per colorare il pallino in base al prezzo (es. semaforo)
const getColorePrezzo = (prezzo: number) => {
  if (prezzo >= 4.5) return "bg-red-500 text-white"; // Caro
  if (prezzo >= 3.5) return "bg-orange-400 text-black"; // Medio
  return "bg-green-400 text-black"; // Economico
};

export default async function MapOverlay() {
  // variabile) in cui verranno salvati
  const datiPrezzi = await getPrezziDalDB()
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
      
      {/* Box per la mappa */}
      <div className="grid w-full gap-6 grid-cols-1 md:grid-cols-2 items-center">
          <div className="relative w-full aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl ">             

              {/* Immagine di sfondo */}
              <Image 
                src="/new-mappa-veneto.png" 
                alt="Mappa del Veneto" 
                fill
                priority // Dice a Next.js di caricarla subito (risolve l'avviso LCP)
                sizes="(max-width: 768px) 100vw, 50vw" // Su mobile occupa il 100% della larghezza, su PC la metà (risolve l'avviso sizes)
                className="object-contain"
              />

              {/* Generiamo i pallini dinamicamente */}
              {datiPrezzi.map((dato) => {
                const coord = coordinateProvince[dato.provincia];
                
                // Se per qualche motivo manca la coordinata, non renderizziamo il punto
                if (!coord) return null;

                return (
                  <div
                    key={dato.provincia}
                    className={`absolute flex items-center justify-center w-12 h-12 -ml-6 -mt-6 rounded-full border-2 border-white shadow-lg font-bold text-sm z-10 transition-transform hover:scale-110 cursor-pointer ${getColorePrezzo(dato.prezzo)}`}
                    style={{
                      top: coord.top,
                      left: coord.left,
                    }}
                    title={`Prezzo medio a ${dato.provincia}`}
                  >
                    €{dato.prezzo.toFixed(2)}
                  </div>
                );
              })}
           </div>

            {/* Box statistiche */}
            <div className="w-full font-bold text-black max-w-2xl mx-auto">
              <AspectRatio ratio={4/5} className="w-full overflow-hidden rounded-3xl bg-slate-100">
                <div className="flex h-full items-center justify-center text-sm font-medium text-slate-500">
                  SpritzIndex
                </div>
              </AspectRatio>
            </div>  

            {/* Primo box statistiche */}
        <div className="w-full font-bold text-black max-w-2xl mx-auto">
          <AspectRatio ratio={16 / 9} className="w-full overflow-hidden rounded-3xl bg-slate-100">
            <div className="flex h-full items-center justify-center text-sm font-medium text-slate-500">
              SpritzIndex
            </div>
          </AspectRatio>
        </div>  

        {/* Secondo box statistiche */}
        <div className="w-full font-bold text-black max-w-2xl mx-auto">
          <AspectRatio ratio={16 / 9} className="w-full overflow-hidden rounded-3xl bg-slate-100">
            <div className="flex h-full items-center justify-center text-sm font-medium text-slate-500">
              SpritzIndex
            </div>
          </AspectRatio>
        </div>  

        {/* Terzo box statistiche */}
        <div className="w-full font-bold text-black max-w-2xl mx-auto">
          <AspectRatio ratio={16 / 9} className="w-full overflow-hidden rounded-3xl bg-slate-100">
            <div className="flex h-full items-center justify-center text-sm font-medium text-slate-500">
              SpritzIndex
            </div>
          </AspectRatio>
        </div>  
        
        {/* Quarto box statistiche */}
        <div className="w-full font-bold text-black max-w-2xl mx-auto">
          <AspectRatio ratio={16 / 9} className="w-full overflow-hidden rounded-3xl bg-slate-100">
            <div className="flex h-full items-center justify-center text-sm font-medium text-slate-500">
              SpritzIndex
            </div>
          </AspectRatio>
        </div>  

        </div>        
   
    </main>
  );
}