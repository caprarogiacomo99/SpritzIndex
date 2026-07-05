const Navbar = () => {
  // Variabile temporanea al momento fissa. In futuro da recuperare come media sui prezzi.
  const averagePriceAperol = 4.00;
  const averagePriceCampari = 4.50;

  return (
    // 1. Modifica al contenitore: flex-col (mobile) -> md:flex-row (desktop). gap-8 per separare i blocchi su mobile.
    <div className="flex flex-col md:flex-row max-w-7xl md:justify-between mx-auto p-4 border-b border-gray-200 gap-8">
      
    {/* Colonna Sinistra: Titolo e Sottotitolo */}
      {/* items-start allinea il titolo in alto, justify-center viene rimosso per permettergli di stare in alto */}
      <div className="flex-1 flex flex-col items-start mt-2">
        {/* text-3xl rende il titolo più grande e visibile */}
        <h1 className="text-3xl font-bold">The SpritzIndex</h1>
        <p className="text-sm text-gray-500 mt-6">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
        </p>
      </div>

    {/* Colonna Destra: items-start (allinea a sx su mobile) -> md:items-end (allinea a dx su desktop) */}
      <div className="flex-1 flex flex-col items-start md:items-end justify-center gap-2">
        
        <span className="text-sm text-gray-500 uppercase tracking-wide text-left md:text-right mt-4">
            Prezzo Medio Spritz
        </span>       
        
        {/* Blocco Prezzo 1 (Aperol) */}
        <div className="flex flex-col items-start md:items-end">
          <span className="text-3xl font-extrabold text-orange-500">
            Aperol € {averagePriceAperol.toFixed(2)}
          </span>
        </div>

        {/* Blocco Prezzo 2 (Campari) */}
        <div className="flex flex-col items-start md:items-end">
          <span className="text-3xl font-extrabold text-red-600">
            Campari € {averagePriceCampari.toFixed(2)}
          </span>
        </div>
        
        {/* Testo finale: aggiunto text-left (mobile) e text-right (desktop) per correggere l'allineamento interno */}
        <span className="text-sm tracking-wide text-left md:text-right text-gray-500">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </span>
        
      </div>
    </div>
  );
};

export default Navbar;