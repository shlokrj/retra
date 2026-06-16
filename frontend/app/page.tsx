import Image from "next/image";
import Link from "next/link";

const severityScale = ["No DR", "Mild", "Moderate", "Severe", "Proliferative"];

const workflow = [
  ["01", "Upload a retinal fundus image."],
  ["02", "Review the severity estimate and confidence."],
  ["03", "Inspect the Grad-CAM attention overlay."],
];

export default function Home() {
  return (
    <main className="space-y-12">
      <section className="grid gap-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(19rem,0.72fr)] lg:items-center">
        <div className="animate-gentle-in">
          <p className="text-sm font-normal text-[color:var(--powder-ink)]">
            Explainable retinal screening
          </p>
          <h1 className="mt-4 max-w-3xl text-5xl font-light leading-[1.05] text-[color:var(--ink)] sm:text-6xl">
            Retra reads fundus images and shows its reasoning.
          </h1>
          <p className="mt-5 max-w-2xl text-lg font-light leading-8 text-[color:var(--muted)]">
            Upload an image, get a diabetic retinopathy severity estimate, and
            inspect the heatmap behind the model&apos;s prediction.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href="/analyze"
              className="powder-button rounded-lg px-5 py-3 text-sm font-medium"
            >
              Try demo
            </Link>
            <Link
              href="/about"
              className="quiet-button rounded-lg px-5 py-3 text-sm font-normal"
            >
              Model notes
            </Link>
          </div>
        </div>

        <figure className="surface animate-gentle-in delay-100 overflow-hidden rounded-lg p-2">
          <Image
            src="/example_heatmap.png"
            alt="Example Retra heatmap output"
            width={900}
            height={300}
            priority
            className="h-auto w-full rounded-md"
          />
          <figcaption className="grid gap-px overflow-hidden rounded-md border border-[color:var(--line)] text-sm font-light text-[color:var(--muted)] sm:grid-cols-3">
            {["severity", "confidence", "attention"].map((label) => (
              <span key={label} className="bg-[color:var(--powder-50)] px-3 py-2">
                {label}
              </span>
            ))}
          </figcaption>
        </figure>
      </section>

      <section className="animate-gentle-in delay-200 grid gap-4 lg:grid-cols-[0.42fr_1fr] lg:items-start">
        <div>
          <p className="text-sm font-normal text-[color:var(--powder-ink)]">
            Severity scale
          </p>
          <h2 className="mt-2 text-2xl font-light text-[color:var(--ink)]">
            Five DR classes, kept readable.
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {severityScale.map((label, i) => (
            <div
              key={label}
              className="surface-flat rounded-lg px-4 py-4 transition hover:border-[color:var(--powder-blue)] hover:bg-white"
            >
              <div className="text-3xl font-light text-[color:var(--powder-ink)]">
                {i}
              </div>
              <div className="mt-2 text-sm font-light text-[color:var(--muted)]">
                {label}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="animate-gentle-in delay-300 grid gap-3 md:grid-cols-3">
        {workflow.map(([number, copy]) => (
          <article
            key={number}
            className="surface-flat rounded-lg p-5 transition hover:border-[color:var(--powder-blue)] hover:bg-white"
          >
            <p className="text-sm font-normal text-[color:var(--powder-ink)]">
              {number}
            </p>
            <p className="mt-3 text-base font-light leading-7 text-[color:var(--muted)]">
              {copy}
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}
