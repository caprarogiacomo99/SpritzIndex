"use client";

import { supabase } from "@/utils/supabase/client";
import { useState, useEffect } from "react";

const Navbar = () => {
  // Stati per memorizzare i dati dinamici
  const [mediaPrezzo, setMediaPrezzo] = useState(0);
  const [countBars, setCountBars] = useState(0);
  const [countProvinces, setCountProvinces] = useState(0);

  // Funzione unica per caricare e calcolare tutti i dati
  const fetchDatiStatistiche = async () => {
    const { data, error } = await supabase
      .from("bars")
      .select("price, location_provincia");

    if (error || !data) {
      console.error("Errore nel fetch delle statistiche:", error);
      return;
    }

    // 1. Calcolo totale bar
    setCountBars(data.length);

    // 2. Calcolo province univoche (ignorando eventuali valori nulli)
    const provinceUnivoche = new Set(
      data.map((item) => item.location_provincia).filter(Boolean)
    );
    setCountProvinces(provinceUnivoche.size);

    // 3. Calcolo media prezzi
    const prezziValidi = data.filter((item) => typeof item.price === "number");
    if (prezziValidi.length > 0) {
      const sommaTotale = prezziValidi.reduce((acc, item) => acc + item.price, 0);
      setMediaPrezzo(sommaTotale / prezziValidi.length);
    }
  };

  useEffect(() => {
    // Carica i dati appena il componente viene montato
    fetchDatiStatistiche();

    // Iscrizione al canale Realtime di Supabase:
    // Ascolta i nuovi inserimenti nella tabella "bars" e ricarica i dati
    const channel = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "bars" },
        () => {
          fetchDatiStatistiche();
        }
      )
      .subscribe();

    // Pulizia del listener quando il componente viene smontato
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    // 1. Modifica al contenitore: flex-col (mobile) -> md:flex-row (desktop). gap-8 per separare i blocchi su mobile.
    <div className="flex flex-col md:flex-row max-w-7xl md:justify-between mx-auto p-4 border-b border-gray-200 gap-8">
      
      {/* Colonna Sinistra: Titolo e Sottotitolo */}
      {/* items-start allinea il titolo in alto, justify-center viene rimosso per permettergli di stare in alto */}
      <div className="flex-1 flex flex-col items-start mt-2">
        {/* text-3xl rende il titolo più grande e visibile */}
        <h1 className="text-3xl font-bold">The SpritzMap</h1>
        <p className="text-sm text-gray-500 mt-6">
          SpritzMap raccoglie i prezzi degli Spritz in tutto il Veneto per
          aiutarti a restare aggiornato su trend e prezzi locali. Se vuoi
          contribuire, puoi aggiungere il tuo bar!
        </p>
      </div>

      {/* Colonna Destra: items-start (allinea a sx su mobile) -> md:items-end (allinea a dx su desktop) */}
      <div className="flex-1 flex flex-col items-start md:items-end justify-center gap-2">
        <span className="text-sm text-gray-500 uppercase tracking-wide text-left md:text-right mt-4">
          Prezzo Medio Spritz
        </span>

        {/* Blocco Prezzo */}
        <div className="flex flex-col items-start md:items-end">
          <span className="text-3xl font-extrabold text-red-600">
            Spritz € {mediaPrezzo.toFixed(2)}
          </span>
        </div>

        {/* Testo finale: aggiunto text-left (mobile) e text-right (desktop) per correggere l'allineamento interno */}
        <span className="text-sm tracking-wide text-left md:text-right text-gray-500">
          <p className="text-lg font-bold text-black mb-10 drop-shadow-md">
            {countBars} bar verificati · {countProvinces} province
          </p>
        </span>
      </div>
    </div>
  );
};

export default Navbar;