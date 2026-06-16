import Image from "next/image";
import Link from "next/link";

const severityScale = ["No DR", "Mild", "Moderate", "Severe", "Proliferative"];

const workflow = [
  {
    title: "Upload",
    copy: "Start with a retinal fundus image from the analyze screen.",
  },
  {
    title: "Classify",
    copy: "The model estimates DR severity and returns a confidence score.",
  },
  {
    title: "Explain",
    copy: "Grad-CAM highlights the regions that shaped the prediction.",
  },
];

export default function Home() {
  return (
    <main className="space-y-14">
      <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="animate-fade-up">
          <p className="inline-flex rounded-lg border border-sky-200 bg-white px-3 py-1 text-sm font-semibold text-sky-700 shadow-sm shadow-sky-100">
            Explainable medical imaging
          </p>
          <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-tight text-slate-950 sm:text-5xl">
            Diabetic retinopathy screening with the reasoning shown.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            Retra classifies DR severity from a retinal fundus image and pairs
            each prediction with a Grad-CAM heatmap, so the output feels easier
            to inspect.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href="/analyze"
              className="rounded-lg bg-sky-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-sky-200 transition hover:-translate-y-0.5 hover:bg-sky-600"
            >
              Analyze an image
            </Link>
            <Link
              href="/about"
              className="rounded-lg border border-sky-200 bg-white px-5 py-3 text-sm font-bold text-sky-700 transition hover:-translate-y-0.5 hover:border-sky-300 hover:bg-sky-50"
            >
              Read the model notes
            </Link>
          </div>
        </div>

        <figure className="animate-fade-up delay-100 overflow-hidden rounded-lg border border-sky-100 bg-white p-3 shadow-xl shadow-sky-100/70">
          <Image
            src="/example_heatmap.png"
            alt="Example Retra heatmap output"
            width={900}
            height={300}
            priority
            className="h-auto w-full rounded-lg"
          />
          <figcaption className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
            <span className="rounded-lg bg-sky-50 px-3 py-2">
              5 severity classes
            </span>
            <span className="rounded-lg bg-cyan-50 px-3 py-2">
              confidence score
            </span>
            <span className="rounded-lg bg-blue-50 px-3 py-2">
              attention overlay
            </span>
          </figcaption>
        </figure>
      </section>

      <section className="animate-fade-up delay-200">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-sky-700">Severity scale</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-950">
              Five-class DR output
            </h2>
          </div>
          <span className="hidden rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-500 shadow-sm shadow-sky-100 sm:inline-flex">
            0 to 4
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {severityScale.map((label, i) => (
            <div
              key={label}
              className="rounded-lg border border-sky-100 bg-white p-4 shadow-sm shadow-sky-100 transition hover:-translate-y-1 hover:border-sky-200 hover:shadow-md"
            >
              <div className="text-3xl font-bold text-sky-500">{i}</div>
              <div className="mt-2 text-sm font-semibold text-slate-700">
                {label}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="animate-fade-up delay-300 grid gap-4 md:grid-cols-3">
        {workflow.map((step, i) => (
          <article
            key={step.title}
            className="rounded-lg border border-sky-100 bg-white p-5 shadow-sm shadow-sky-100 transition hover:-translate-y-1 hover:border-sky-200"
          >
            <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-sky-100 text-sm font-bold text-sky-700">
              {i + 1}
            </div>
            <h3 className="text-lg font-bold text-slate-950">{step.title}</h3>
            <p className="mt-2 leading-7 text-slate-600">{step.copy}</p>
          </article>
        ))}
      </section>

      <p className="animate-fade-up rounded-lg border border-sky-100 bg-white px-4 py-3 text-sm leading-6 text-slate-500 shadow-sm shadow-sky-100">
        Not a medical diagnosis. Retra is for research and educational use
        only.
      </p>
    </main>
  );
}
