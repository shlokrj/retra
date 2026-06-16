"use client";

import { useEffect, useState } from "react";
import { API_URL, predict, type PredictResult } from "../../lib/api";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

type Sample = { file: string; label: string; src: string };

const SAMPLES: Sample[] = [
  { file: "0_no_dr.png", label: "No DR", src: "/samples/0_no_dr.png" },
  { file: "1_mild.png", label: "Mild", src: "/samples/1_mild.png" },
  { file: "2_moderate.png", label: "Moderate", src: "/samples/2_moderate.png" },
  { file: "3_severe.png", label: "Severe", src: "/samples/3_severe.png" },
  {
    file: "4_proliferative.png",
    label: "Proliferative",
    src: "/samples/4_proliferative.png",
  },
];

export default function Analyze() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<PredictResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function onSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(null);
    setResult(null);
    setError(null);
    setPreview(null);

    if (!f) return;

    if (!f.type.startsWith("image/")) {
      setError("Choose an image file.");
      e.currentTarget.value = "";
      return;
    }

    if (f.size > MAX_IMAGE_BYTES) {
      setError("Keep images under 10 MB.");
      e.currentTarget.value = "";
      return;
    }

    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function runPrediction(f: File) {
    setLoading(true);
    setError(null);
    try {
      setResult(await predict(f));
    } catch (err) {
      setError(err instanceof Error ? err.message : "something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function onAnalyze() {
    if (file) runPrediction(file);
  }

  async function onSample(sample: Sample) {
    if (loading) return;
    setError(null);
    setResult(null);
    try {
      const res = await fetch(sample.src);
      if (!res.ok) throw new Error("could not load sample");
      const blob = await res.blob();
      const f = new File([blob], sample.file, { type: blob.type || "image/png" });
      setFile(f);
      setPreview(sample.src);
      await runPrediction(f);
    } catch (err) {
      setError(err instanceof Error ? err.message : "could not load sample");
    }
  }

  return (
    <main className="space-y-8">
      <section className="animate-gentle-in flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-4xl">
          <p className="text-sm font-normal text-[color:var(--powder-ink)]">
            Try demo
          </p>
          <h1 className="text-balance-soft mt-3 max-w-3xl text-4xl font-light leading-tight text-[color:var(--ink)] sm:text-5xl">
            Upload an image. Read one clear report.
          </h1>
          <p className="text-pretty-soft mt-4 max-w-4xl text-lg font-light leading-8 text-[color:var(--muted)]">
            Severity, confidence, probabilities, and attention stay together in
            one clean result.
          </p>
        </div>
        <StatusPill loading={loading} />
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(17rem,0.72fr)_minmax(0,1fr)]">
        <div className="surface animate-gentle-in delay-100 rounded-lg p-5">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-normal text-[color:var(--ink)]">
                Image
              </h2>
              <p className="text-pretty-soft mt-1 text-sm font-light leading-6 text-[color:var(--muted)]">
                JPG, PNG, or another browser-supported image.
              </p>
            </div>
            <span className="rounded-full border border-[color:var(--line)] bg-white/60 px-3 py-1 text-xs font-light text-[color:var(--muted)]">
              max 10 MB
            </span>
          </div>

          <label className="group grid aspect-[4/3] min-h-60 cursor-pointer place-items-center overflow-hidden rounded-lg border border-dashed border-[color:var(--line)] bg-white/45 p-4 text-center transition hover:border-[color:var(--powder-blue)] hover:bg-white/75 sm:min-h-72">
            {preview ? (
              <span className="relative grid h-full w-full place-items-center">
                <span className="absolute left-3 top-3 rounded-md border border-[color:var(--line)] bg-white/75 px-3 py-1 text-xs font-light text-[color:var(--muted)] transition group-hover:border-[color:var(--powder-blue)] group-hover:bg-white group-hover:text-[color:var(--powder-ink)]">
                  click to change
                </span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt="Selected retinal preview"
                  className="max-h-full w-full rounded-md object-contain"
                />
              </span>
            ) : (
              <div className="max-w-xs">
                <p className="text-base font-normal text-[color:var(--ink)]">
                  Choose image
                </p>
                <p className="mt-2 text-sm font-light leading-6 text-[color:var(--muted)]">
                  The preview will stay here before analysis.
                </p>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={onSelect}
              className="hidden"
            />
          </label>

          <div className="mt-5 flex min-w-0 flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onAnalyze}
              disabled={!file || loading}
              aria-busy={loading}
              className="powder-button rounded-lg px-5 py-3 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0"
            >
              {loading ? "Analyzing..." : "Analyze image"}
            </button>
            {file && (
              <span className="min-w-0 max-w-full truncate rounded-lg border border-[color:var(--line)] bg-white/55 px-3 py-2 text-sm font-light text-[color:var(--muted)]">
                {file.name}
              </span>
            )}
          </div>

          {error && (
            <p className="mt-4 rounded-lg border border-[#f1c7b6] bg-[#fff7f2] px-4 py-3 text-sm font-normal text-[#a85030]">
              {error}
            </p>
          )}

          <div className="mt-6 border-t border-[color:var(--line)] pt-5">
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-sm font-normal text-[color:var(--powder-ink)]">
                Or try a sample
              </p>
              <span className="text-xs font-light text-[color:var(--muted)]">
                one per severity
              </span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {SAMPLES.map((sample, i) => (
                <button
                  key={sample.file}
                  type="button"
                  onClick={() => onSample(sample)}
                  disabled={loading}
                  title={`${sample.label} (class ${i})`}
                  className="group surface-flat animate-gentle-in overflow-hidden rounded-lg p-1 text-center transition hover:-translate-y-0.5 hover:border-[color:var(--powder-blue)] hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ animationDelay: `${i * 70}ms` }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={sample.src}
                    alt={sample.label}
                    loading="lazy"
                    className="aspect-square w-full rounded-md object-cover transition duration-300 group-hover:scale-105"
                  />
                  <span className="mt-1 block truncate text-[11px] font-light leading-tight text-[color:var(--muted)] transition group-hover:text-[color:var(--powder-ink)]">
                    {sample.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="surface animate-gentle-in delay-200 rounded-lg p-5">
          {result ? (
            <ReportCard result={result} preview={preview} />
          ) : (
            <EmptyReport loading={loading} />
          )}
        </div>
      </section>
    </main>
  );
}

function StatusPill({ loading }: { loading: boolean }) {
  return (
    <span className="inline-flex w-fit items-center gap-2 rounded-lg border border-[color:var(--line)] bg-white/55 px-3 py-2 text-sm font-light text-[color:var(--muted)]">
      <span
        className={`size-2 rounded-full bg-[color:var(--powder-ink)] ${
          loading ? "animate-quiet-pulse" : ""
        }`}
      />
      {loading ? "running analysis" : "research demo"}
    </span>
  );
}

function EmptyReport({ loading }: { loading: boolean }) {
  return (
    <div className="grid min-h-[420px] place-items-center rounded-lg border border-dashed border-[color:var(--line)] bg-white/35 p-8 text-center">
      <div className="max-w-sm">
        <p className="text-xl font-light text-[color:var(--ink)]">
          {loading ? "Building report" : "Report will appear here"}
        </p>
        <p className="text-pretty-soft mt-3 font-light leading-7 text-[color:var(--muted)]">
          {loading
            ? "The prediction request is running now."
            : "Run analysis to see the severity class, heatmap, and probability breakdown."}
        </p>
      </div>
    </div>
  );
}

function ReportCard({
  result,
  preview,
}: {
  result: PredictResult;
  preview: string | null;
}) {
  const confidence = (result.confidence * 100).toFixed(1);
  const imageGridClass = preview ? "grid gap-3 sm:grid-cols-2" : "grid gap-3";
  const imageReviewLabel = preview ? "original + attention" : "attention overlay";

  return (
    <div className="animate-gentle-in">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-normal text-[color:var(--powder-ink)]">
            Retra analysis
          </p>
          <h2 className="mt-1 text-3xl font-light text-[color:var(--ink)]">
            {result.prediction}
          </h2>
        </div>
        <div className="rounded-lg border border-[color:var(--line)] bg-white/45 px-4 py-3 text-right">
          <p className="text-sm font-light text-[color:var(--muted)]">
            Confidence
          </p>
          <p className="text-3xl font-light text-[color:var(--powder-ink)]">
            {confidence}%
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-[color:var(--line)] bg-white/45 p-3">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 px-1">
          <h3 className="text-sm font-normal text-[color:var(--ink)]">
            Image review
          </h3>
          <span className="text-sm font-light text-[color:var(--muted)]">
            {imageReviewLabel}
          </span>
        </div>
        <div className={imageGridClass}>
          {preview && (
            <ImageFrame
              src={preview}
              alt="Original retinal upload"
              label="original"
            />
          )}
          <ImageFrame
            src={`${API_URL}${result.heatmap_url}`}
            alt="Grad-CAM heatmap overlay"
            label="Grad-CAM overlay"
          />
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-sm font-normal text-[color:var(--ink)]">
            Probabilities
          </h3>
          <span className="text-sm font-light text-[color:var(--muted)]">
            class {result.class_id}
          </span>
        </div>
        <div className="space-y-3">
          {Object.entries(result.probabilities).map(([label, p]) => (
            <div key={label} className="grid gap-2 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="font-light text-[color:var(--ink)]">
                  {label}
                </span>
                <span className="font-light text-[color:var(--muted)]">
                  {(p * 100).toFixed(1)}%
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[color:var(--powder-100)]">
                <div
                  className="h-full rounded-full bg-[color:var(--powder-ink)] animate-fill-bar"
                  style={{ width: `${Math.round(p * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-pretty-soft mt-6 rounded-lg border border-[color:var(--line)] bg-white/45 px-4 py-3 text-sm font-light leading-6 text-[color:var(--muted)]">
        Suggested action:{" "}
        {result.class_id >= 2
          ? "clinical review recommended."
          : "routine monitoring."}
      </p>
    </div>
  );
}

function ImageFrame({
  src,
  alt,
  label,
}: {
  src: string;
  alt: string;
  label: string;
}) {
  return (
    <figure className="relative overflow-hidden rounded-lg border border-[color:var(--line)] bg-[color:var(--powder-50)]">
      <figcaption className="absolute left-3 top-3 z-10 rounded-md border border-[color:var(--line)] bg-white/75 px-3 py-1 text-xs font-light text-[color:var(--muted)]">
        {label}
      </figcaption>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="aspect-[4/3] h-full w-full object-contain p-2"
      />
    </figure>
  );
}
