"use client";

import { useEffect, useState } from "react";
import { API_URL, predict, type PredictResult } from "../../lib/api";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

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

  async function onAnalyze() {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      setResult(await predict(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : "something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="space-y-8">
      <section className="animate-fade-up flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-bold text-sky-700">Analyze</p>
          <h1 className="mt-2 text-3xl font-bold leading-tight text-slate-950 sm:text-4xl">
            Upload a fundus image and review the model report.
          </h1>
          <p className="mt-3 max-w-2xl text-lg leading-8 text-slate-600">
            Retra returns a severity class, confidence score, class
            probabilities, and Grad-CAM overlay in one light report.
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-lg border border-sky-100 bg-white px-3 py-2 text-sm font-semibold text-slate-600 shadow-sm shadow-sky-100">
          <span className="size-2 rounded-full bg-sky-400 animate-soft-pulse" />
          research demo
        </span>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="animate-fade-up delay-100 rounded-lg border border-sky-100 bg-white p-5 shadow-sm shadow-sky-100">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-950">Image input</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Choose a retinal image to send to the local prediction API.
            </p>
          </div>

          <label className="group flex min-h-72 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border border-dashed border-sky-200 bg-sky-50/70 p-4 text-center transition hover:border-sky-300 hover:bg-sky-100/70">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt="Selected retinal preview"
                className="max-h-72 w-full rounded-lg object-contain"
              />
            ) : (
              <div className="max-w-xs">
                <div className="mx-auto mb-4 grid size-12 place-items-center rounded-lg bg-white text-xl font-bold text-sky-500 shadow-sm shadow-sky-100">
                  +
                </div>
                <p className="font-bold text-slate-800">Choose image</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  JPG, PNG, or another browser-supported image under 10 MB.
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

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onAnalyze}
              disabled={!file || loading}
              aria-busy={loading}
              className="rounded-lg bg-sky-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-sky-200 transition hover:-translate-y-0.5 hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0"
            >
              {loading ? "Analyzing..." : "Analyze"}
            </button>
            {file && (
              <span className="min-w-0 truncate rounded-lg bg-sky-50 px-3 py-2 text-sm font-medium text-slate-600">
                {file.name}
              </span>
            )}
          </div>

          {error && (
            <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              {error}
            </p>
          )}
        </div>

        <div className="animate-fade-up delay-200 rounded-lg border border-sky-100 bg-white p-5 shadow-sm shadow-sky-100">
          {result ? (
            <ReportCard result={result} preview={preview} />
          ) : (
            <EmptyReport loading={loading} />
          )}
        </div>
      </section>

      <p className="animate-fade-up text-sm leading-6 text-slate-500">
        Not a medical diagnosis. Retra is for research and educational use
        only.
      </p>
    </main>
  );
}

function EmptyReport({ loading }: { loading: boolean }) {
  return (
    <div className="grid min-h-[420px] place-items-center rounded-lg border border-dashed border-sky-200 bg-sky-50/70 p-8 text-center">
      <div className="max-w-sm">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-lg bg-white shadow-sm shadow-sky-100">
          <span
            className={`size-3 rounded-full bg-sky-400 ${
              loading ? "animate-soft-pulse" : ""
            }`}
          />
        </div>
        <h2 className="text-xl font-bold text-slate-950">
          {loading ? "Building report" : "Report will appear here"}
        </h2>
        <p className="mt-3 leading-7 text-slate-500">
          {loading
            ? "The prediction request is running now."
            : "Choose an image and run analysis to see the severity class, heatmap, and probability breakdown."}
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

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-sky-700">Retra analysis</p>
          <h2 className="mt-1 text-3xl font-bold text-slate-950">
            {result.prediction}
          </h2>
        </div>
        <div className="rounded-lg bg-sky-50 px-4 py-3 text-right">
          <p className="text-sm font-semibold text-slate-500">Confidence</p>
          <p className="text-3xl font-bold text-sky-600">{confidence}%</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {preview && (
          <figure>
            <figcaption className="mb-2 text-sm font-semibold text-slate-500">
              Original
            </figcaption>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Original retinal upload"
              className="h-full w-full rounded-lg border border-sky-100 bg-sky-50 object-contain"
            />
          </figure>
        )}
        <figure>
          <figcaption className="mb-2 text-sm font-semibold text-slate-500">
            Grad-CAM overlay
          </figcaption>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${API_URL}${result.heatmap_url}`}
            alt="Grad-CAM heatmap overlay"
            className="h-full w-full rounded-lg border border-sky-100 bg-sky-50 object-contain"
          />
        </figure>
      </div>

      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-slate-700">Probabilities</h3>
          <span className="text-sm font-semibold text-slate-400">
            class {result.class_id}
          </span>
        </div>
        <div className="space-y-3">
          {Object.entries(result.probabilities).map(([label, p]) => (
            <div key={label} className="grid gap-2 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="font-semibold text-slate-700">{label}</span>
                <span className="font-semibold text-slate-500">
                  {(p * 100).toFixed(1)}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-lg bg-sky-100">
                <div
                  className="h-full rounded-lg bg-sky-500 animate-fill-bar"
                  style={{ width: `${Math.round(p * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-6 rounded-lg bg-sky-50 px-4 py-3 text-sm font-semibold leading-6 text-slate-600">
        Suggested action:{" "}
        {result.class_id >= 2
          ? "clinical review recommended."
          : "routine monitoring."}
      </p>
    </div>
  );
}
