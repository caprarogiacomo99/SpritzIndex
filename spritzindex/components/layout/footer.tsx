import { AspectRatio } from "@/components/ui/aspect-ratio";

const Footer = () => {
  return (
    <footer className="bg-gray-50 text-slate-700 border-t border-gray-200">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="space-y-6">
            <AspectRatio ratio={16 / 9} className="w-full overflow-hidden rounded-3xl bg-slate-100">
              <div className="flex h-full items-center justify-center text-sm font-medium text-slate-500">
                SpritzIndex
              </div>
            </AspectRatio>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-900">Chi siamo</p>
              <p className="text-sm leading-7 text-slate-600">
                SpritzIndex raccoglie informazioni essenziali per aiutarti a restare aggiornato su trend, prezzi e locali.
              </p>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-900">Contatti</p>
              <p className="text-sm leading-7 text-slate-600">Email: info@spritzindex.it</p>
              <p className="text-sm leading-7 text-slate-600">Telefono: +39 02 1234 5678</p>
            </div>

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