export default function About() {
  return (
    <main className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold tracking-tight">About Retra</h1>

      <Section title="Dataset">
        Trained on the{" "}
        <a
          href="https://www.kaggle.com/competitions/aptos2019-blindness-detection"
          className="text-emerald-400 hover:underline"
        >
          APTOS 2019 Blindness Detection
        </a>{" "}
        dataset — 3,662 retinal fundus images labelled 0–4 by clinicians for DR
        severity.
      </Section>

      <Section title="Model architecture">
        EfficientNet-B0 (ImageNet-pretrained) fine-tuned for 5-class
        classification, with a class-weighted loss to handle severity
        imbalance. Explanations come from Grad-CAM over the final convolutional
        layer.
      </Section>

      <Section title="Limitations">
        Trained on a single public dataset; performance may not transfer across
        cameras, populations, or image quality. It does not detect other ocular
        disease, and confidence scores are not calibrated probabilities of
        disease.
      </Section>

      <Section title="Ethical disclaimer">
        Retra is a research and educational demo. It is not a medical device and
        must not be used for diagnosis or treatment decisions. Always consult a
        qualified clinician.
      </Section>
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
    <section>
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </h2>
      <p className="max-w-2xl leading-relaxed text-slate-300">{children}</p>
    </section>
  );
}
