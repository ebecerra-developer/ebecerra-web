export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center min-h-screen bg-[#080808] text-white font-mono px-6">
      <p className="text-[#00ff88] text-sm mb-4 tracking-widest uppercase">
        ebecerra.es
      </p>
      <h1 className="text-4xl font-bold mb-4 tracking-tight text-center">
        Migración en progreso
      </h1>
      <p className="text-[#888] text-center max-w-md">
        La nueva web está siendo construida. Mientras tanto, todo sigue
        funcionando en producción.
      </p>
    </main>
  );
}
