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
  "Verona":  { top: "68%", left: "22%" },
  "Padova":  { top: "74%", left: "50%" },
  "Venezia": { top: "67%", left: "65%" },
  "Rovigo":  { top: "81%", left: "58%" },
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


  // Esempio di funzione per calcolare la frequenza dei prezzi in fasce da 1 euro
const calcolaFrequenzaPrezzi = (datiPrezzi: { prezzo: number }[]) => {
  // Definiamo le fasce (es. 2-3€, 3-4€, 4-5€, 5-6€, 6-7€, 7-8€+)
  const fasce = [
    { etichetta: "2-3€", min: 2, max: 3, conteggio: 0 },
    { etichetta: "3-4€", min: 3, max: 4, conteggio: 0 },
    { etichetta: "4-5€", min: 4, max: 5, conteggio: 0 },
    { etichetta: "5-6€", min: 5, max: 6, conteggio: 0 },
    { etichetta: "6-7€", min: 6, max: 7, conteggio: 0 },
    { etichetta: "7-10€", min: 7, max: 10, conteggio: 0 },
  ];

  // Contiamo la frequenza per ogni fascia
  datiPrezzi.forEach((item) => {
    const fasciaTrovata = fasce.find(f => item.prezzo >= f.min && item.prezzo < f.max);
    if (fasciaTrovata) {
      fasciaTrovata.conteggio += 1;
    } else if (item.prezzo >= 10) {
      fasce[fasce.length - 1].conteggio += 1;
    }
  });

  // Troviamo il conteggio massimo per calcolare la percentuale delle barre in altezza o larghezza
  const maxConteggio = Math.max(...fasce.map(f => f.conteggio), 1);

  return fasce.map(f => ({
    ...f,
    percentuale: (f.conteggio / maxConteggio) * 100,
  }));
};

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
          <div className="relative w-full aspect-[5/5] rounded-3xl overflow-hidden shadow-2xl ">             

              {/* Immagine di sfondo */}
              <Image 
                src="/nuova-mappa-veneto.png" 
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
              <AspectRatio ratio={5/5} className="w-full overflow-hidden rounded-3xl bg-white/80 backdrop-blur-md p-6 shadow-xl border border-orange-100 flex flex-col justify-between">
                <div>
                      <h3 className="text-lg font-bold mb-4 text-orange-900 border-b pb-2 flex items-center justify-between">
                        <span>Classifica Prezzi Spritz</span>
                        <span className="text-xs font-normal text-muted-foreground">€ medio</span>
                      </h3>

                      {/* Lista delle province */}
                      <div className="space-y-3">
                        {datiPrezzi.map((dato) => {
                          // Calcoliamo la percentuale per la barra orizzontale (ipotizzando 6€ come massimo di scala)
                          const maxPrezzoValore = 6.0; 
                          const percentuale = Math.min((dato.prezzo / maxPrezzoValore) * 100, 100);

                          return (
                            <div key={dato.provincia} className="space-y-1">
                              {/* Riga con nome e prezzo */}
                              <div className="flex justify-between text-sm">
                                <span className="font-semibold text-slate-700">{dato.provincia}</span>
                                <span className="font-extrabold text-orange-600">€{dato.prezzo.toFixed(2)}</span>
                              </div>

                              {/* Istogramma orizzontale (Barra) */}
                              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                                <div 
                                  className="bg-gradient-to-r from-orange-400 to-red-500 h-full rounded-full transition-all duration-500"
                                  style={{ width: `${percentuale}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="text-center text-xs text-slate-400 pt-2 border-t mt-4">
                        Lorem ipsum
                      </div>
                    </div>
              </AspectRatio>
            </div>  

            {/* Primo box statistiche */}
        <div className="w-full font-bold text-black max-w-2xl mx-auto">
            <AspectRatio ratio={4/5} className="w-full overflow-hidden rounded-3xl bg-white/80 backdrop-blur-md p-6 shadow-xl border border-orange-100 flex flex-col justify-between">
              <div>
                      <h3 className="text-lg font-bold mb-4 text-orange-900 border-b pb-2 flex items-center justify-between">
                        <span>Classifica Prezzi Spritz</span>
                        <span className="text-xs font-normal text-muted-foreground">€ medio</span>
                      </h3>

                      {/* Lista delle province */}
                      <div className="space-y-3">
                        {datiPrezzi.map((dato) => {
                          // Calcoliamo la percentuale per la barra orizzontale (ipotizzando 6€ come massimo di scala)
                          const maxPrezzoValore = 6.0; 
                          const percentuale = Math.min((dato.prezzo / maxPrezzoValore) * 100, 100);

                          return (
                            <div key={dato.provincia} className="space-y-1">
                              {/* Riga con nome e prezzo */}
                              <div className="flex justify-between text-sm">
                                <span className="font-semibold text-slate-700">{dato.provincia}</span>
                                <span className="font-extrabold text-orange-600">€{dato.prezzo.toFixed(2)}</span>
                              </div>

                              {/* Istogramma orizzontale (Barra) */}
                              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                                <div 
                                  className="bg-gradient-to-r from-orange-400 to-red-500 h-full rounded-full transition-all duration-500"
                                  style={{ width: `${percentuale}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>

              </div>
          </AspectRatio>
        </div>  

        {/* Secondo box statistiche */}
        <div className="w-full font-bold text-black max-w-2xl mx-auto">
          <AspectRatio ratio={4/5} className="w-full overflow-hidden rounded-3xl bg-white/80 backdrop-blur-md p-6 shadow-xl border border-orange-100 flex flex-col justify-between">
              {/* Box statistiche con Istogramma delle Frequenze dei Prezzi */}
              {(() => {
                const datiFrequenza = calcolaFrequenzaPrezzi(datiPrezzi);

                return (
                  <div className="w-full font-bold text-black">
                      
                      <div>
                        <h3 className="text-lg font-bold mb-2 text-orange-900 border-b pb-2 flex items-center justify-between">
                          <span>Frequenza Prezzi Spritz</span>
                          <span className="text-xs font-normal text-muted-foreground">N. locali</span>
                        </h3>
                        <p className="text-xs text-slate-500 mb-4">Distribuzione delle fasce di prezzo nel Veneto</p>

                        {/* Istogramma orizzontale delle frequenze */}
                        <div className="space-y-3">
                          {datiFrequenza.map((fascia) => (
                            <div key={fascia.etichetta} className="space-y-1">
                              <div className="flex justify-between text-xs sm:text-sm">
                                <span className="font-semibold text-slate-700">{fascia.etichetta}</span>
                                <span className="font-extrabold text-orange-600">
                                  {fascia.conteggio} {fascia.conteggio === 1 ? 'locale' : 'locali'}
                                </span>
                              </div>

                              {/* Barra di frequenza */}
                              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
                                <div 
                                  className="bg-gradient-to-r from-orange-400 via-orange-500 to-red-600 h-full rounded-full transition-all duration-700"
                                  style={{ width: `${Math.max(fascia.percentuale, 4)}%` }} // Lasciamo un minimo visivo del 4% se > 0
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="text-center text-xs text-slate-400 pt-2 border-t mt-4">
                        Statistiche elaborate sulle segnalazioni del DB
                      </div>

                    </div>
                );
              })()}
          </AspectRatio>
        </div>  

        </div>        
   
    </main>
  );
}