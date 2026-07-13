import Image from "next/image";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { supabase } from "@/utils/supabase/client";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldLabel } from "@base-ui/react/field";

const lista_province = [
  { label: "Belluno", value: "Belluno" },
  { label: "Padova", value: "Padova" },
  { label: "Rovigo", value: "Rovigo" },
  { label: "Treviso", value: "Treviso" },
  { label: "Venezia", value: "Venezia" },
  { label: "Verona", value: "Verona" },
  { label: "Vicenza", value: "Vicenza" },
]

const lista_spritz = [
  { label: "Aperol", value: "Aperol" },
  { label: "Campari", value: "Campari" },
  { label: "Cynar", value: "Cynar" },
  { label: "Select", value: "Select" },
]

// Sostituire questo array con il risultato della tua query al DB
// Commento perchè inserita query a DB (vedi pezzo di codice subito sotto)
/*const getPrezziDalDB = async () => {
  return [
    { provincia: "Belluno", prezzo: 4.20 },
    { provincia: "Treviso", prezzo: 3.50 },
    { provincia: "Vicenza", prezzo: 3.20 },
    { provincia: "Verona", prezzo: 3.80 },
    { provincia: "Padova", prezzo: 3.40 },
    { provincia: "Venezia", prezzo: 4.80 },
    { provincia: "Rovigo", prezzo: 2.90 },
  ];
};*/

const getPrezziDalDB = async () => {
  // Query a Supabase per recuperare i prezzi live
  const { data, error } = await supabase
    .from('bars')
    .select('location_provincia, price');

  if (error) {
    console.error("Errore durante il recupero dei prezzi:", error);
    return []; // Restituiamo un array vuoto come fallback visivo
  }

if (!data || data.length === 0) return [];

  // 2. Raggruppiamo i bar per provincia e calcoliamo il prezzo medio
  // Usiamo un oggetto per tenere traccia della somma dei prezzi e del numero di bar per ogni provincia
  const provinceMap = data.reduce((acc, bar) => {
    const prov = bar.location_provincia;
    const prezzo = bar.price;

    // Se manca la provincia o il prezzo, saltiamo il record
    if (!prov || typeof prezzo !== 'number') return acc;

    // Se è la prima volta che incontriamo questa provincia, la inizializziamo
    if (!acc[prov]) {
      acc[prov] = { totale: 0, conteggio: 0 };
    }
    
    // Aggiungiamo il prezzo al totale e incrementiamo il conteggio
    acc[prov].totale += prezzo;
    acc[prov].conteggio += 1;

    return acc;
  }, {} as Record<string, { totale: number; conteggio: number }>);

  // 3. Trasformiamo l'oggetto nell'array che si aspetta il  frontend
  const prezziMedi = Object.keys(provinceMap).map((prov) => {
    return {
      provincia: prov,
      prezzo: provinceMap[prov].totale / provinceMap[prov].conteggio,
    };
  });

  return prezziMedi;
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
  if (prezzo >= 6.0) return "bg-red-500 text-white"; // Caro
  if (prezzo >= 4.0) return "bg-orange-400 text-black"; // Medio
  return "bg-green-400 text-black"; // Economico
};

// Funzione per ottenere solo il numero totale di bar (super veloce)
const getcountBars = async () => {
  const { count, error } = await supabase
    .from('bars')
    .select('*', { count: 'exact', head: true }); // head: true chiede a Supabase di non scaricare i dati, ma solo il conteggio!

  if (error) {
    console.error("Errore nel conteggio dei bar:", error);
    return 0;
  }

  return count || 0;
};

// Funzione per ottenere solo il numero totale di province presenti a db
const getcountProvinces = async () => {
  const { data, error } = await supabase
    .from('bars')
    .select('location_provincia'); // head: true chiede a Supabase di non scaricare i dati, ma solo il conteggio!

  if (error) {
    console.error("Errore nel conteggio delle province:", error);
    return 0;
  }

  const provinceUnivoche = new Set(data.map(item => item.location_provincia));
  return provinceUnivoche.size;

};

export default async function MapOverlay() {
  // variabile) in cui verranno salvati
  const datiPrezzi = await getPrezziDalDB()
  const countBars = await getcountBars();
  const countProvinces = await getcountProvinces();


  // Esempio di funzione per calcolare la frequenza dei prezzi in fasce da 1 euro
const calcolaFrequenzaPrezzi = (datiPrezzi: { prezzo: number }[]) => {
  // Definiamo le fasce (es. 2-3€, 3-4€, 4-5€, 5-6€, 6-7€, 7-8€+)
  const fasce = [
    { etichetta: "0-3€", min: 0, max: 3, conteggio: 0 },
    { etichetta: "3-4€", min: 3, max: 4, conteggio: 0 },
    { etichetta: "4-6€", min: 4, max: 6, conteggio: 0 },
    { etichetta: "6-8€", min: 6, max: 8, conteggio: 0 },
    { etichetta: ">8€", min: 8, max: 1000, conteggio: 0 },
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
      <div className="w-full max-w-7xl my-6 py-24 px-8 rounded-3xl border border-black/20 text-black shadow-xl bg-[url('/RicercaSpritz.jpeg')] bg-cover bg-center">

        <div className="flex flex-col items-center text-center">
          {/* Titolo */}
          <h2 className="text-4xl md:text-5xl font-extrabold text-black mb-2 drop-shadow-md">
            Trova il tuo locale
          </h2>
          
          {/* Sottotitolo */}
          <p className="text-lg font-bold text-black mb-10 drop-shadow-md">
            {countBars} bar · {countProvinces} province
          </p>
          
          {/* Griglia con sfondi parzialmente trasparenti (bg-white/40) ma bordi netti e spessi (border-2 border-black/70) */}
          <div className="grid w-full gap-4 grid-cols-1 md:grid-cols-5 items-center">
            
            {/* Campo 1: Nome del locale */}
            <div className="w-full h-14 rounded-2xl shadow-lg bg-white/40 backdrop-blur-md border-2 border-black/70 px-4 flex items-center transition-all hover:bg-white/60 focus-within:bg-white/80 focus-within:border-black">
              <Input 
                placeholder="Nome del locale" 
                className="w-full h-full bg-transparent border-0 text-black font-bold placeholder:text-black/80 focus-visible:ring-0 shadow-none p-0" 
              />
            </div>  

            {/* Campo 2: Select Province */}
            <div className="w-full h-14 rounded-2xl shadow-lg bg-white/40 backdrop-blur-md border-2 border-black/70 px-4 flex items-center transition-all hover:bg-white/60 focus-within:bg-white/80">
              <Select items={lista_province}>
                <SelectTrigger className="w-full h-full bg-transparent border-0 text-black font-bold shadow-none focus:ring-0 p-0 data-[placeholder]:text-black/80">
                  <SelectValue placeholder="Provincia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {lista_province.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>           
            </div>

            {/* Campo 3: Città */}
            <div className="w-full h-14 rounded-2xl shadow-lg bg-white/40 backdrop-blur-md border-2 border-black/70 px-4 flex items-center transition-all hover:bg-white/60 focus-within:bg-white/80 focus-within:border-black"> 
              <Input 
                placeholder="Città" 
                className="w-full h-full bg-transparent border-0 text-black font-bold placeholder:text-black/80 focus-visible:ring-0 shadow-none p-0" 
              />       
            </div>  

            {/* Campo 4: Prezzo */}
            <div className="w-full h-14 rounded-2xl shadow-lg bg-white/40 backdrop-blur-md border-2 border-black/70 px-4 flex items-center transition-all hover:bg-white/60 focus-within:bg-white/80 focus-within:border-black">            
              <Input 
                type="number"
                step="any"
                placeholder="Prezzo (es. 3.50)" 
                style={{ colorScheme: 'light' }}
                className="w-full h-full bg-transparent border-0 text-black font-bold placeholder:text-black/80 placeholder:opacity-100 focus-visible:ring-0 shadow-none p-0" 
              />       
            </div>
            
            {/* Campo 5: Select Tipo Spritz */}
            <div className="w-full h-14 rounded-2xl shadow-lg bg-white/40 backdrop-blur-md border-2 border-black/70 px-4 flex items-center transition-all hover:bg-white/60 focus-within:bg-white/80">
              <Select items={lista_spritz}>
                <SelectTrigger className="w-full h-full bg-transparent border-0 text-black font-bold shadow-none focus:ring-0 p-0 data-[placeholder]:text-black/80">
                  <SelectValue placeholder="Tipo Spritz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {lista_spritz.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>           
            </div>

          </div>

          <Button variant="outline">Inserisci</Button>
          <Checkbox id="toggle-checkbox" name="toggle-checkbox" disabled />


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