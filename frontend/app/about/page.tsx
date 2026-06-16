const sections = [
  {
    title: "Dataset",
    body: (
      <>
        Trained on the{" "}
        <a
          href="https://www.kaggle.com/competitions/aptos2019-blindness-detection"
          className="font-semibold text-sky-700 hover:text-sky-900 hover:underline"
        >
          APTOS 2019 Blindness Detection
        </a>{" "}
        dataset, with 3,662 retinal fundus images labelled 0-4 by clinicians
        for DR severity.
      </>
    ),
  },
  {
    title: "Model architecture",
    body: (
      <>
        EfficientNet-B3 at 300px, ImageNet-pretrained and fine-tuned for 5-class
        classification with Ben Graham fundus preprocessing, a softened
        class-weighted loss, and EMA weights. Explanations come from Grad-CAM
        over the final convolutional layer.
      </>
    ),
  },
  {
    title: "Limitations",
    body: (
      <>
        Trained on a single public dataset, so performance may not transfer
        across cameras, populations, or image quality. It does not detect other
        ocular disease, and confidence scores are not calibrated probabilities
        of disease.
      </>
    ),
  },
  {
    title: "Ethical disclaimer",
    body: (
      <>
        Retra is a research and educational demo. It is not a medical device and
        must not be used for diagnosis or treatment decisions. Always consult a
        qualified clinician.
      </>
    ),
  },
];

export default function About() {
  return (
    <main className="space-y-8">
      <section className="animate-fade-up max-w-3xl">
        <p className="text-sm font-bold text-sky-700">About Retra</p>
        <h1 className="mt-2 text-3xl font-bold leading-tight text-slate-950 sm:text-4xl">
          A research demo for explainable diabetic retinopathy screening.
        </h1>
        <p className="mt-4 text-lg leading-8 text-slate-600">
          The interface keeps the prediction, confidence, and heatmap close
          together so the output can be reviewed as one report.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        {sections.map((section, i) => (
          <Section key={section.title} title={section.title} delay={i}>
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
  delay,
}: {
  title: string;
  children: React.ReactNode;
  delay: number;
}) {
  const delayClass = delay % 2 === 0 ? "delay-100" : "delay-200";

  return (
    <section
      className={`animate-fade-up ${delayClass} rounded-lg border border-sky-100 bg-white p-6 shadow-sm shadow-sky-100 transition hover:-translate-y-1 hover:border-sky-200`}
    >
      <h2 className="text-sm font-bold text-sky-700">{title}</h2>
      <p className="mt-3 leading-7 text-slate-600">{children}</p>
    </section>
  );
}
