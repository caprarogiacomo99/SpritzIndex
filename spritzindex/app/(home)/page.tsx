"use client";

import { supabase } from "@/utils/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation"; // AGGIUNTO IL ROUTER DI NEXT.JS
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { Checkbox } from "@/app/components/ui/checkbox";

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

const verificaIndirizzoNominatim = async (nome: string, citta: string, provincia: string) => {
  const query = encodeURIComponent(`${nome}, ${citta}, ${provincia}, Veneto, Italia`);
  const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&addressdetails=1&limit=1`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'TrovaSpritzVenetoApp/1.0'
      }
    });
    const data = await response.json();

    if (data && data.length > 0) {
      return {
        trovato: true,
        displayName: data[0].display_name,
        lat: data[0].lat,
        lon: data[0].lon,
      };
    }
    return { trovato: false };
  } catch (error) {
    console.error("Errore di connessione a Nominatim:", error);
    return { trovato: false };
  }
};

export default function MapOverlay() {
  const router = useRouter(); // INIZIALIZZA IL ROUTER

  const [nome, setNome] = useState("");
  const [provincia, setProvincia] = useState("");
  const [citta, setCitta] = useState("");
  const [prezzo, setPrezzo] = useState("");
  const [tipoSpritz, setTipoSpritz] = useState<string | null>(null);
  const [isAdult, setIsAdult] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [datiNominatim, setDatiNominatim] = useState<any>(null);
  const [mostraPopup, setMostraPopup] = useState(false);
  const [messaggio, setMessaggio] = useState<string | null>(null);

  const isFormValid = nome.trim() && provincia && citta.trim() && prezzo && tipoSpritz && isAdult;

  const handleAvviaVerifica = async () => {
    if (!isFormValid) return;

    setIsLoading(true);
    setMessaggio(null);

    const risultato = await verificaIndirizzoNominatim(nome, citta, provincia);
    setIsLoading(false);

    if (risultato.trovato) {
      setDatiNominatim(risultato);
      setMostraPopup(true);
    } else {
      setMessaggio("Il servizio di geolocalizzazione non ha trovato riscontro per questo locale. Controlla i dati inseriti.");
    }
  };

  const handleConfermaInserimentoDB = async () => {
    setIsLoading(true);

    const { error } = await supabase.from('bars').insert([{
      name: nome.trim(),
      location_stato: "Italia",
      location_regione: "Veneto",
      location_comune: citta.trim(),
      location_provincia: provincia,
      price: parseFloat(prezzo),
      type: tipoSpritz,
      location_url: null,
      rating: null,
    }]);

    setIsLoading(false);
    setMostraPopup(false);

    if (!error) {
      setMessaggio("Locale inserito con successo!");
      setNome("");
      setCitta("");
      setPrezzo("");
      setProvincia("");
      setTipoSpritz(null);
      setIsAdult(false);
      
      // SOSTITUITO window.location.reload() con router.refresh()
      router.refresh(); 
      
    } else {
      console.error("Dettaglio errore Supabase:", error);
      setMessaggio(`Errore DB: ${error.message || "Controlla la console"}`);
    }
  };

  return (
    <main className="flex flex-col items-center p-4">
      {/* Contenitore principale (La Card) */}
      <div className="w-full w-full py-12 px-8 rounded-3xl border border-black/20 text-black shadow-xl bg-[url('/RicercaSpritz.jpeg')] bg-cover bg-center">
        <div className="flex flex-col items-center text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-black mb-2 drop-shadow-md">
            Trova il tuo locale
          </h2>
          
          {/* Griglia Campi di Input */}
          <div className="grid w-full gap-4 grid-cols-1 md:grid-cols-5 items-center">
            
            <div className="w-full h-14 rounded-2xl shadow-lg bg-white/40 backdrop-blur-md border-2 border-black/70 px-4 flex items-center transition-all hover:bg-white/60 focus-within:bg-white/80 focus-within:border-black">
              <Input 
                placeholder="Nome del locale" 
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full h-full bg-transparent border-0 text-black font-bold placeholder:text-black/85 focus-visible:ring-0 shadow-none p-0" 
              />
            </div>  

            <div className="w-full h-14 rounded-2xl shadow-lg bg-white/40 backdrop-blur-md border-2 border-black/70 px-4 flex items-center transition-all hover:bg-white/60 focus-within:bg-white/80">
              <Select value={provincia} onValueChange={(value) => setProvincia(value ?? "")}>
                <SelectTrigger className="w-full h-full bg-transparent border-0 text-black font-bold shadow-none focus:ring-0 p-0 data-[placeholder]:text-black/85">
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

            <div className="w-full h-14 rounded-2xl shadow-lg bg-white/40 backdrop-blur-md border-2 border-black/70 px-4 flex items-center transition-all hover:bg-white/60 focus-within:bg-white/80 focus-within:border-black"> 
              <Input 
                placeholder="Città" 
                value={citta}
                onChange={(e) => setCitta(e.target.value)}
                className="w-full h-full bg-transparent border-0 text-black font-bold placeholder:text-black/85 focus-visible:ring-0 shadow-none p-0" 
              />       
            </div>  

            <div className="w-full h-14 rounded-2xl shadow-lg bg-white/40 backdrop-blur-md border-2 border-black/70 px-4 flex items-center transition-all hover:bg-white/60 focus-within:bg-white/80 focus-within:border-black">           
              <Input 
                type="number"
                step="any"
                placeholder="Prezzo" 
                value={prezzo}
                onChange={(e) => setPrezzo(e.target.value)}
                style={{ colorScheme: 'light' }}
                className="w-full h-full bg-transparent border-0 text-black font-bold placeholder:text-black/85 focus-visible:ring-0 shadow-none p-0" 
              />       
            </div>
            
            <div className="w-full h-14 rounded-2xl shadow-lg bg-white/40 backdrop-blur-md border-2 border-black/70 px-4 flex items-center transition-all hover:bg-white/60 focus-within:bg-white/80">
              <Select value={tipoSpritz} onValueChange={setTipoSpritz}>
                <SelectTrigger className="w-full h-full bg-transparent border-0 text-black font-bold shadow-none focus:ring-0 p-0 data-[placeholder]:text-black/85">
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

          {/* Blocco inferiore con checkbox a sinistra e pulsante a destra */}
          <div className="flex flex-col md:flex-row justify-between items-center w-full gap-3 mt-2">
            <div className="flex items-center space-x-3 bg-white/60 px-3 py-2 rounded-xl border border-black/25 text-left">
              <Checkbox 
                id="toggle-checkbox" 
                checked={isAdult} 
                onCheckedChange={(checked) => setIsAdult(!!checked)}
                className="scale-100 data-[state=checked]:bg-stone-800 data-[state=checked]:border-stone-800 shrink-0" 
              />
            <div className="block max-w-[325px]">
                  <label htmlFor="toggle-checkbox" className="text-xs leading-tight text-black font-bold cursor-pointer select-none">
                    Confermo di aver più di 18 anni e di voler contribuire alla community con dati reali.
                  </label>
            </div>
            </div>

            <Button 
              onClick={handleAvviaVerifica}
              disabled={!isFormValid || isLoading}
              className="scale-120 bg-stone-800 hover:bg-stone-950 text-white font-extrabold px-6 py-2 rounded-xl shadow-md cursor-pointer transition-all text-xs h-9 shrink-0 ml-auto md:ml-0"
            >
              {isLoading ? "Verifica in corso..." : "Verifica e Invia"}
            </Button>
          </div>

          {messaggio && (
            <p className={`text-[11px] font-bold mt-2 text-center w-full ${messaggio.includes("successo") ? "text-green-800 bg-green-100/80 px-2 py-0.5 rounded-md" : "text-red-800 bg-red-100/80 px-2 py-0.5 rounded-md"}`}>
              {messaggio}
            </p>
          )}
        </div>
      </div>
      
      {/* POPUP MODALE DI CONFERMA NOMINATIM */}
      {mostraPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border-2 border-orange-500 text-black">
            <h3 className="text-xl font-extrabold text-orange-900 mb-2 border-b pb-2">
              Conferma la tua segnalazione
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Il servizio di geolocalizzazione ha validato il seguente indirizzo:
            </p>

            <div className="bg-orange-50/70 p-4 rounded-2xl space-y-2 text-sm mb-6 border border-orange-200">
              <p><strong>Nome Locale:</strong> {nome}</p>
              <p><strong>Indirizzo Trovato:</strong> {datiNominatim?.displayName}</p>
              <p><strong>Città / Provincia:</strong> {citta} ({provincia})</p>
              
              <div className="pt-2 border-t border-orange-200 flex justify-between items-center">
                <span className="font-bold text-slate-700">Tipo: {tipoSpritz}</span>
                <span className="text-lg font-black text-orange-600 bg-white px-3 py-1 rounded-xl shadow-sm">
                  €{parseFloat(prezzo).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Button 
                variant="outline" 
                onClick={() => setMostraPopup(false)}
                className="rounded-xl font-bold cursor-pointer"
              >
                Annulla
              </Button>
              <Button 
                onClick={handleConfermaInserimentoDB}
                disabled={isLoading}
                className="bg-orange-600 hover:bg-orange-700 text-white font-extrabold rounded-xl cursor-pointer"
              >
                {isLoading ? "Salvataggio..." : "Conferma e Inserisci"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}