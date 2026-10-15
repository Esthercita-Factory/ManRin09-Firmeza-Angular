import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-950 text-slate-100">
      <h1 className="text-4xl font-bold tracking-tight">
        React + TypeScript + <span className="text-sky-400">Tailwind CSS</span>
      </h1>
      <button
        type="button"
        onClick={() => setCount((c) => c + 1)}
        className="rounded-lg bg-sky-500 px-5 py-2.5 font-medium text-white shadow transition hover:bg-sky-400 active:scale-95"
      >
        Contador: {count}
      </button>
      <p className="text-sm text-slate-400">
        Edita <code className="rounded bg-slate-800 px-1.5 py-0.5">src/App.tsx</code> para empezar.
      </p>
    </main>
  )
}

export default App
