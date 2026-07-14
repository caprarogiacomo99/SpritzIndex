import { supabase } from "@/utils/supabase/client";

const getcountBars = async () => {
  const { count, error } = await supabase
    .from('bars')
    .select('*', { count: 'exact', head: true });
  if (error) return 0;
  return count || 0;
};

const getcountProvinces = async () => {
  const { data, error } = await supabase
    .from('bars')
    .select('location_provincia');
  if (error || !data) return 0;
  const provinceUnivoche = new Set(data.map(item => item.location_provincia));
  return provinceUnivoche.size;
};

const getMediaPrezziTotale = async () => {
  // 1. Scarichiamo solo la colonna "price" di tutti i bar
  const { data, error } = await supabase
    .from('bars')
    .select('price');

  if (error || !data || data.length === 0) {
    console.error("Errore nel calcolo della media prezzi:", error);
    return 0;
  }

  // 2. Filtriamo eventuali valori non numerici e sommiamo tutti i prezzi
  const prezziValidi = data.filter(item => typeof item.price === 'number');
  if (prezziValidi.length === 0) return 0;

  const sommaTotale = prezziValidi.reduce((acc, item) => acc + item.price, 0);

  // 3. Dividiamo la somma per il numero totale di elementi validi
  const media = sommaTotale / prezziValidi.length;

  return media;
};

const Navbar = async () => {  // Variabileper media sui prezzi.
  const mediaPrezzo = await getMediaPrezziTotale();
  const countBars = await getcountBars();
  const countProvinces = await getcountProvinces();

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

        {/* Blocco Prezzo 2 (Campari) */}
        <div className="flex flex-col items-start md:items-end">
          <span className="text-3xl font-extrabold text-red-600">
            Spritz € {mediaPrezzo.toFixed(2)}
          </span>
        </div>
        
        {/* Testo finale: aggiunto text-left (mobile) e text-right (desktop) per correggere l'allineamento interno */}
        <span className="text-sm tracking-wide text-left md:text-right text-gray-500">
        <p className="text-lg font-bold text-black mb-10 drop-shadow-md">
          {countBars} bar · {countProvinces} province
        </p>        
        </span>
        
      </div>
    </div>
  );
};

export default Navbar;