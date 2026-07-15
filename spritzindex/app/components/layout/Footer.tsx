import { AspectRatio } from "@/app/components/ui/aspect-ratio";

const Footer = () => {
  return (
    <footer className="bg-gray-50 text-slate-700 border-t border-gray-200">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="space-y-6">

            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-900">Chi siamo</p>
              <p className="text-sm leading-7 text-slate-600">
                Ciao, sono Giacomo, un ingenere appassionato di statistiche, AI e spritx. Ho creato SpritzMap per condividere i prezzi degli Spritz in Veneto e aiutare gli utenti a rimanere aggiornati sui trend locali. L'obbiettivo è quello di avere un reposotory dove sono salvati i prezzi degli Spritz in Veneto, in modo da avere un trend dei prezzi e delle province dove sono più economici, con la speranza di abbassare i prezzi!
              </p>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
         
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-900">Informazioni</p>
              <p className="text-sm leading-7 text-slate-600">Privacy</p>
              <p className="text-sm leading-7 text-slate-600">Termini e condizioni</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer