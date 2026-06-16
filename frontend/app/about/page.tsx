const sections = [
  {
    title: "Dataset",
    body: (
      <>
        Trained on the{" "}
        <a
          href="https://www.kaggle.com/competitions/aptos2019-blindness-detection"
          className="font-normal text-[color:var(--powder-ink)] underline-offset-4 hover:underline"
        >
          APTOS 2019 Blindness Detection
        </a>{" "}
        dataset, with 3,662 retinal fundus images labelled 0-4 by clinicians
        for DR severity.
      </>
    ),
  },
  {
    title: "Model",
    body: (
      <>
        EfficientNet-B3 at 300px, ImageNet-pretrained and fine-tuned for 5-class
        classification with Ben Graham preprocessing, softened class weights,
        and EMA weights.
      </>
    ),
  },
  {
    title: "Explanation",
    body: (
      <>
        Grad-CAM is generated over the final convolutional layer so each report
        can show the image regions that shaped the selected class.
      </>
    ),
  },
  {
    title: "Limits",
    body: (
      <>
        Performance may not transfer across cameras, populations, or image
        quality. Retra does not detect other ocular disease, and confidence
        scores are not calibrated disease probabilities.
      </>
    ),
  },
  {
    title: "Use",
    body: (
      <>
        Retra is a research and educational demo. It is not a medical device and
        must not be used for diagnosis or treatment decisions.
      </>
    ),
  },
];

export default function About() {
  return (
    <main className="space-y-10">
      <section className="animate-gentle-in max-w-6xl">
        <p className="text-sm font-normal text-[color:var(--powder-ink)]">
          Model notes
        </p>
        <h1 className="text-balance-soft mt-3 max-w-3xl text-4xl font-light leading-tight text-[color:var(--ink)] sm:text-5xl">
          A small research demo for explainable DR screening.
        </h1>
        <p className="text-pretty-soft mt-4 max-w-6xl text-lg font-light leading-8 text-[color:var(--muted)]">
          The interface keeps prediction, confidence, and heatmap together so
          each result reads as one report.
        </p>
      </section>

      <div className="surface animate-gentle-in delay-100 overflow-hidden rounded-lg transition hover:border-[color:var(--powder-blue)] hover:bg-white/80">
        {sections.map((section) => (
          <Section key={section.title} title={section.title}>
            {section.body}
          </Section>
        ))}
      </div>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-3 border-b border-[color:var(--line)] px-5 py-5 transition last:border-b-0 hover:bg-[color:var(--powder-50)] md:grid-cols-[0.24fr_1fr] md:px-6">
      <h2 className="text-sm font-normal text-[color:var(--powder-ink)]">
        {title}
      </h2>
      <p className="text-pretty-soft max-w-4xl text-base font-light leading-7 text-[color:var(--muted)]">
        {children}
      </p>
    </section>
  );
}
