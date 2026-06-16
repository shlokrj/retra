import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col gap-16">
      {/* hero */}
      <section className="flex flex-col items-start gap-5 pt-8">
        <span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-400">
          Explainable medical imaging
        </span>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Diabetic retinopathy screening,
          <br />
          with the reasoning shown.
        </h1>
        <p className="max-w-2xl text-lg text-slate-300">
          Retra classifies DR severity from a retinal fundus image and overlays
          a Grad-CAM heatmap of exactly where the model is looking.
        </p>
        <Link
          href="/analyze"
          className="rounded-lg bg-emerald-500 px-5 py-2.5 font-medium text-slate-950 hover:bg-emerald-400"
        >
          Analyze an image
        </Link>
      </section>

      {/* severity scale */}
      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Severity scale
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {["No DR", "Mild", "Moderate", "Severe", "Proliferative"].map(
            (label, i) => (
              <div
                key={label}
                className="rounded-lg border border-slate-800 bg-slate-900/50 p-4"
              >
                <div className="text-2xl font-bold text-emerald-400">{i}</div>
                <div className="text-sm text-slate-300">{label}</div>
              </div>
            )
          )}
        </div>
      </section>

      {/* how it works */}
      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
          How it works
        </h2>
        <ol className="grid gap-4 sm:grid-cols-3">
          {[
            "Upload a retinal fundus image.",
            "EfficientNet-B0 predicts severity with a confidence score.",
            "Grad-CAM overlays the model's attention on the retina.",
          ].map((step, i) => (
            <li
              key={i}
              className="rounded-lg border border-slate-800 bg-slate-900/50 p-5"
            >
              <div className="mb-2 text-sm text-slate-500">Step {i + 1}</div>
              <p className="text-slate-200">{step}</p>
            </li>
          ))}
        </ol>
      </section>

      <p className="text-sm text-slate-500">
        Not a medical diagnosis. For research / educational use only.
      </p>
    </main>
  );
}
