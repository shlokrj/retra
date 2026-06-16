import Image from "next/image";
import Link from "next/link";

const severityScale = ["No DR", "Mild", "Moderate", "Severe", "Proliferative"];

const workflow = [
  {
    number: "01",
    title: "Upload",
    copy: "Add one retinal fundus image.",
  },
  {
    number: "02",
    title: "Review",
    copy: "Compare severity and confidence.",
  },
  {
    number: "03",
    title: "Inspect",
    copy: "Read the attention overlay.",
  },
];

const sampleMetrics = [
  ["severity", "class output"],
  ["confidence", "model certainty"],
  ["attention", "Grad-CAM map"],
];

export default function Home() {
  return (
    <main className="space-y-14">
      <section className="grid gap-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(19rem,0.72fr)] lg:items-center">
        <div className="animate-gentle-in">
          <p className="text-sm font-normal text-[color:var(--powder-ink)]">
            Explainable retinal screening
          </p>
          <h1 className="mt-4 max-w-3xl text-[color:var(--ink)]">
            <span className="block origin-left scale-x-[1.03] text-7xl font-light leading-none sm:scale-x-[1.08] sm:text-8xl">
              Retra
            </span>
            <span className="text-balance-soft mt-5 block max-w-2xl text-4xl font-light leading-tight sm:text-5xl">
              reads fundus images and shows its reasoning.
            </span>
          </h1>
          <p className="text-pretty-soft mt-5 max-w-3xl text-lg font-light leading-8 text-[color:var(--muted)]">
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

        <figure className="surface animate-gentle-in delay-100 rounded-lg p-3 sm:p-4">
          <div className="mb-3 flex items-center justify-between gap-3 px-1">
            <figcaption className="text-sm font-normal text-[color:var(--powder-ink)]">
              sample report
            </figcaption>
            <span className="rounded-full border border-[color:var(--line)] bg-white/60 px-3 py-1 text-xs font-light text-[color:var(--muted)]">
              Grad-CAM preview
            </span>
          </div>
          <div className="overflow-hidden rounded-lg border border-[color:var(--line)] bg-white">
            <Image
              src="/example_heatmap.png"
              alt="Example Retra heatmap output"
              width={900}
              height={300}
              priority
              className="h-auto w-full"
            />
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {sampleMetrics.map(([label, value]) => (
              <div
                key={label}
                className="rounded-lg border border-[color:var(--line)] bg-[color:var(--powder-50)] px-3 py-3"
              >
                <p className="text-xs font-normal text-[color:var(--powder-ink)]">
                  {label}
                </p>
                <p className="mt-1 text-sm font-light text-[color:var(--muted)]">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </figure>
      </section>

      <section className="animate-gentle-in delay-200 grid gap-5 lg:grid-cols-[minmax(0,0.36fr)_1fr] lg:items-center">
        <div className="max-w-sm">
          <p className="text-sm font-normal text-[color:var(--powder-ink)]">
            Severity scale
          </p>
          <h2 className="text-balance-soft mt-2 text-3xl font-light leading-tight text-[color:var(--ink)]">
            Five readable <br />DR classes.
          </h2>
          <p className="text-pretty-soft mt-3 text-base font-light leading-7 text-[color:var(--muted)]">
            The output stays compact, from <br />no DR through proliferative DR.
          </p>
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
        {workflow.map(({ number, title, copy }) => (
          <article
            key={number}
            className="surface-flat rounded-lg p-5 transition hover:border-[color:var(--powder-blue)] hover:bg-white"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-normal text-[color:var(--powder-ink)]">
                {number}
              </p>
              <h3 className="text-base font-normal text-[color:var(--ink)]">
                {title}
              </h3>
            </div>
            <p className="text-pretty-soft mt-4 text-base font-light leading-7 text-[color:var(--muted)]">
              {copy}
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}
