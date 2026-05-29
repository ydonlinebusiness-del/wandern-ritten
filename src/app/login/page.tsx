export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; error?: string }>;
}) {
  const { from = "/", error } = await searchParams;
  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] items-center justify-center bg-ritten-snow p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <div className="text-4xl">🏔️</div>
          <h1 className="mt-2 text-xl font-semibold text-ritten-forest">
            Wandern am Ritten
          </h1>
          <p className="mt-1 text-sm text-slate-500">Bitte Passwort eingeben.</p>
        </div>
        <form action="/api/login" method="post" className="space-y-3">
          <input type="hidden" name="from" value={from} />
          <input
            type="password"
            name="password"
            autoFocus
            placeholder="Passwort"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-ritten-forest focus:ring-2 focus:ring-ritten-moss/40"
          />
          {error && (
            <p className="text-sm text-red-600">Falsches Passwort. Bitte erneut versuchen.</p>
          )}
          <button
            type="submit"
            className="w-full rounded-lg bg-ritten-forest py-2 font-medium text-white transition-colors hover:bg-ritten-moss"
          >
            Anmelden
          </button>
        </form>
      </div>
    </div>
  );
}
