export default function Home() {
  return (
    <main className="min-h-screen">
      {/* hero */}
      <section>
        <h1>Retra</h1>
        <p>
          Explainable AI for diabetic retinopathy screening from retinal
          fundus images.
        </p>
      </section>

      {/* upload panel -> links into /analyze */}
      <section>{/* TODO: upload box */}</section>

      {/* example results */}
      <section>{/* TODO: example result card */}</section>

      {/* about the model */}
      <section>{/* TODO: short model explanation */}</section>
    </main>
  );
}
