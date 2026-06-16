"use client";

import { useState } from "react";
import { API_URL, predict, type PredictResult } from "../../lib/api";

export default function Analyze() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<PredictResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setResult(null);
    setError(null);
    setPreview(f ? URL.createObjectURL(f) : null);
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
    <main className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analyze</h1>
        <p className="mt-2 text-slate-400">
          Upload a retinal fundus image to classify DR severity.
        </p>
      </div>

      {/* uploader */}
      <div className="flex flex-wrap items-center gap-4">
        <label className="cursor-pointer rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm hover:border-slate-500">
          {file ? "Choose another image" : "Choose image"}
          <input
            type="file"
            accept="image/*"
            onChange={onSelect}
            className="hidden"
          />
        </label>
        <button
          onClick={onAnalyze}
          disabled={!file || loading}
          className="rounded-lg bg-emerald-500 px-5 py-2 text-sm font-medium text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? "Analyzing…" : "Analyze"}
        </button>
        {file && <span className="text-sm text-slate-500">{file.name}</span>}
      </div>

      {error && (
        <p className="rounded-lg border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      {/* preview before a result */}
      {preview && !result && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt="preview"
          className="max-w-sm rounded-lg border border-slate-800"
        />
      )}

      {/* report */}
      {result && (
        <ReportCard result={result} preview={preview} />
      )}

      <p className="text-xs text-slate-600">
        Not a medical diagnosis. For research / educational use only.
      </p>
    </main>
  );
}

function ReportCard({
  result,
  preview,
}: {
  result: PredictResult;
  preview: string | null;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <div className="text-sm uppercase tracking-wide text-slate-500">
            Retra analysis
          </div>
          <div className="text-2xl font-bold text-emerald-400">
            {result.prediction}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-500">Confidence</div>
          <div className="text-2xl font-semibold">
            {(result.confidence * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* images */}
      <div className="grid gap-4 sm:grid-cols-2">
        {preview && (
          <figure>
            <figcaption className="mb-2 text-sm text-slate-400">
              Original
            </figcaption>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="original"
              className="w-full rounded-lg border border-slate-800"
            />
          </figure>
        )}
        <figure>
          <figcaption className="mb-2 text-sm text-slate-400">
            Grad-CAM overlay
          </figcaption>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${API_URL}${result.heatmap_url}`}
            alt="heatmap overlay"
            className="w-full rounded-lg border border-slate-800"
          />
        </figure>
      </div>

      {/* probabilities */}
      <div className="mt-6">
        <div className="mb-2 text-sm text-slate-400">Probabilities</div>
        <div className="flex flex-col gap-2">
          {Object.entries(result.probabilities).map(([label, p]) => (
            <div key={label} className="flex items-center gap-3 text-sm">
              <span className="w-36 shrink-0 text-slate-300">{label}</span>
              <div className="h-2 flex-1 overflow-hidden rounded bg-slate-800">
                <div
                  className="h-full bg-emerald-500"
                  style={{ width: `${Math.round(p * 100)}%` }}
                />
              </div>
              <span className="w-12 shrink-0 text-right text-slate-400">
                {(p * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-6 text-sm text-slate-400">
        Suggested action:{" "}
        {result.class_id >= 2
          ? "clinical review recommended."
          : "routine monitoring."}
      </p>
    </div>
  );
}
