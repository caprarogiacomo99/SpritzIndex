import Image from "next/image";
import { supabase } from "@/utils/supabase/client";
import { AspectRatio } from "@/components/ui/aspect-ratio";


const lista_province = [
  { label: "Belluno", value: "Belluno" },
  { label: "Padova", value: "Padova" },
  { label: "Rovigo", value: "Rovigo" },
  { label: "Treviso", value: "Treviso" },
  { label: "Venezia", value: "Venezia" },
  { label: "Verona", value: "Verona" },
  { label: "Vicenza", value: "Vicenza" },
];

const lista_spritz = [
  { label: "Aperol", value: "Aperol" },
  { label: "Campari", value: "Campari" },
  { label: "Cynar", value: "Cynar" },
  { label: "Select", value: "Select" },
];

const coordinateProvince: Record<string, { top: string; left: string }> = {
  "Belluno": { top: "30%", left: "62%" },
  "Treviso": { top: "50%", left: "65%" },
  "Vicenza": { top: "56%", left: "37%" },
  "Verona":  { top: "68%", left: "22%" },
  "Padova":  { top: "74%", left: "50%" },
  "Venezia": { top: "67%", left: "65%" },
  "Rovigo":  { top: "81%", left: "58%" },
};


const getColorePrezzo = (prezzo: number) => {
  if (prezzo >= 6.0) return "bg-red-500 text-white";
  if (prezzo >= 4.0) return "bg-orange-400 text-black";
  return "bg-green-400 text-black";
};

const getPrezziDalDB = async () => {
  const { data, error } = await supabase.from('bars').select('location_provincia, price, type');
  if (error || !data || data.length === 0) return [];
  return data;
};

const calcolaFrequenzaPrezzi = (datiPrezzi: { price: number }[]) => {
  const fasce = [
    { etichetta: "0-3€", min: 0, max: 3, conteggio: 0 },
    { etichetta: "3-4€", min: 3, max: 4, conteggio: 0 },
    { etichetta: "4-6€", min: 4, max: 6, conteggio: 0 },
    { etichetta: "6-8€", min: 6, max: 8, conteggio: 0 },
    { etichetta: ">8€", min: 8, max: 1000, conteggio: 0 },
  ];

  datiPrezzi.forEach((item) => {
    const fasciaTrovata = fasce.find(f => item.price >= f.min && item.price < f.max);
    if (fasciaTrovata) {
      fasciaTrovata.conteggio += 1;
    } else if (item.price >= 10) {
      fasce[fasce.length - 1].conteggio += 1;
    }
  });

  const maxConteggio = Math.max(...fasce.map(f => f.conteggio), 1);

  return fasce.map(f => ({
    ...f,
    percentuale: (f.conteggio / maxConteggio) * 100,
  }));
};

const calcolaPrezziMediPerProvincia = (datiGrezzi: any[], tipoFiltro?: string) => {
  const datiFiltrati = tipoFiltro 
    ? datiGrezzi.filter(bar => bar.type === tipoFiltro) 
    : datiGrezzi;

  const provinceMap = datiFiltrati.reduce((acc, bar) => {
    const prov = bar.location_provincia;
    const prezzo = bar.price;
    if (!prov || typeof prezzo !== 'number') return acc;
    if (!acc[prov]) acc[prov] = { totale: 0, conteggio: 0 };
    acc[prov].totale += prezzo;
    acc[prov].conteggio += 1;
    return acc;
  }, {} as Record<string, { totale: number; conteggio: number }>);

  return Object.keys(provinceMap).map((prov) => ({
    provincia: prov,
    prezzo: provinceMap[prov].totale / provinceMap[prov].conteggio,
  }));
};

const calcolaPrezziMediPerProvinciaETipo = (datiGrezzi: any[]) => {
  // Struttura accumulatore: { [provincia]: { [tipo]: { totale, conteggio } } }
  const matrice: Record<string, Record<string, { totale: number; conteggio: number }>> = {};

  datiGrezzi.forEach(bar => {
    const prov = bar.location_provincia;
    const tipo = bar.type;
    const prezzo = bar.price;

    if (!prov || !tipo || typeof prezzo !== 'number') return;

    if (!matrice[prov]) matrice[prov] = {};
    if (!matrice[prov][tipo]) matrice[prov][tipo] = { totale: 0, conteggio: 0 };

    matrice[prov][tipo].totale += prezzo;
    matrice[prov][tipo].conteggio += 1;
  });

  // Trasformiamo in un formato comodo da scorrere (es. array di province con i relativi prezzi medi per tipo)
  return lista_province.map(p => {
    const provName = p.value;
    const tipiPrezzi: Record<string, number | null> = {};

    lista_spritz.forEach(s => {
      const cella = matrice[provName]?.[s.value];
      tipiPrezzi[s.value] = cella ? cella.totale / cella.conteggio : null;
    });

    return {
      provincia: provName,
      prezziPerTipo: tipiPrezzi,
    };
  });
};

const inserisciBarNelDB = async (nuovoBar: {
  name: string;
  location_provincia: string;
  location_citta: string;
  price: number;
  type: string;
}) => {
  const { error } = await supabase.from('bars').insert([nuovoBar]);
  if (error) {
    console.error("Errore durante l'inserimento:", error.message);
    return false;
  }
  return true;
};

export default async function MapOverlay() {
  const prezziDalDB = await getPrezziDalDB();
  const prezzoMedioPerOgniProvincia = calcolaPrezziMediPerProvincia(prezziDalDB);

  return (
    <main className="flex flex-col items-center p-4">
           
      {/* Box per la mappa */}
      <div className="grid w-full gap-4 grid-cols-1 md:grid-cols-2 items-center">
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
              {prezzoMedioPerOgniProvincia.map((dato) => {
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
                        {prezzoMedioPerOgniProvincia.map((dato) => {
                          // Calcoliamo la percentuale per la barra orizzontale (ipotizzando 10€ come massimo di scala)
                          const maxPrezzoValore = 10.0; 
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

          {/* Matrice Prezzi Medi per Provincia e Tipo Spritz */}
          <div className="w-full font-bold text-black max-w-2xl mx-auto">
            <AspectRatio ratio={4/3} className="w-full overflow-hidden rounded-3xl bg-white/80 backdrop-blur-md p-6 shadow-xl border border-orange-100 flex flex-col justify-between">
              {(() => {
                const datiMatrice = calcolaPrezziMediPerProvinciaETipo(prezziDalDB);
                
                return (
                  <div className="w-full font-bold text-black h-full flex flex-col justify-between overflow-x-auto">
                    <div>
                      <h3 className="text-lg font-bold mb-2 text-orange-900 border-b pb-2 flex items-center justify-between">
                        <span>Prezzo Medio per Provincia e Spritz</span>
                        <span className="text-xs font-normal text-muted-foreground">€ medio</span>
                      </h3>
                      
                      <div className="min-w-[450px] mt-3">
                        {/* Intestazione Colonne (Tipi di Spritz - Ascisse) */}
                        <div className="grid grid-cols-5 text-xs font-bold text-slate-700 border-b pb-2 mb-2 text-center">
                          <span className="text-left">Provincia</span>
                          {lista_spritz.map(s => (
                            <span key={s.value}>{s.label}</span>
                          ))}
                        </div>

                        {/* Righe (Province - Ordinate) */}
                        <div className="space-y-2">
                          {datiMatrice.map(row => (
                            <div key={row.provincia} className="grid grid-cols-5 text-xs items-center py-1 border-b border-slate-100 text-center">
                              <span className="font-semibold text-slate-800 text-left">{row.provincia}</span>
                              {lista_spritz.map(s => {
                                const prezzoMedio = row.prezziPerTipo[s.value];
                                return (
                                  <span key={s.value} className={prezzoMedio !== null ? "font-extrabold text-orange-600" : "text-slate-300"}>
                                    {prezzoMedio !== null ? `€${prezzoMedio.toFixed(2)}` : "-"}
                                  </span>
                                );
                              })}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-center text-xs text-slate-400 pt-2 border-t mt-2">
                      Asse X: Tipi di Spritz · Asse Y: Province
                    </div>
                  </div>
                );
              })()}
            </AspectRatio>
          </div>

        {/* Secondo box statistiche */}
        <div className="w-full font-bold text-black max-w-2xl mx-auto">
          <AspectRatio ratio={4/3} className="w-full overflow-hidden rounded-3xl bg-white/80 backdrop-blur-md p-6 shadow-xl border border-orange-100 flex flex-col justify-between">
              {/* Box statistiche con Istogramma delle Frequenze dei Prezzi */}
              {(() => {
                const datiFrequenza = calcolaFrequenzaPrezzi(prezziDalDB);

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