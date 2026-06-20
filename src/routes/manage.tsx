import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import type { Category, CommandCard, Difficulty } from "@/lib/cards";
import { STARTER_DECKS } from "@/lib/cards";
import { loadCards, saveCards } from "@/lib/storage";

const search = z.object({ id: z.string().optional() });

export const Route = createFileRoute("/manage")({
  validateSearch: search,
  head: () => ({
    meta: [
      { title: "Add or Edit Card — CmdDeck" },
      { name: "description", content: "Create or edit a command card in your deck." },
    ],
  }),
  component: ManagePage,
});

const CATEGORIES: Category[] = ["Linux", "Docker", "Terraform", "Network", "Security", "Azure", "Kubernetes"];
const DIFFICULTIES: Difficulty[] = ["Beginner", "Intermediate", "Advanced"];

const empty: CommandCard = {
  id: "",
  command: "",
  category: "Linux",
  description: "",
  example: "",
  whenToUse: "",
  difficulty: "Beginner",
  power: 50,
  deck: STARTER_DECKS[0],
  quiz: { question: "", answer: "", explanation: "" },
};

function ManagePage() {
  const { id } = Route.useSearch();
  const navigate = useNavigate();
  const [form, setForm] = useState<CommandCard>(empty);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const cards = loadCards();
    if (id) {
      const existing = cards.find((c) => c.id === id);
      if (existing) {
        setForm(existing);
        setEditing(true);
      }
    }
  }, [id]);

  function update<K extends keyof CommandCard>(key: K, val: CommandCard[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }
  function updateQuiz<K extends keyof CommandCard["quiz"]>(key: K, val: string) {
    setForm((f) => ({ ...f, quiz: { ...f.quiz, [key]: val } }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const cards = loadCards();
    if (editing) {
      const next = cards.map((c) => (c.id === form.id ? form : c));
      saveCards(next);
    } else {
      const newCard: CommandCard = { ...form, id: `c-${Date.now().toString(36)}` };
      saveCards([...cards, newCard]);
    }
    navigate({ to: "/library" });
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-black">{editing ? "Edit card" : "Add a new card"}</h1>

      <form onSubmit={submit} className="space-y-4">
        <Field label="Command">
          <input required value={form.command} onChange={(e) => update("command", e.target.value)} className={input} />
        </Field>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Category">
            <select value={form.category} onChange={(e) => update("category", e.target.value as Category)} className={input}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Deck">
            <input value={form.deck} onChange={(e) => update("deck", e.target.value)} className={input} list="decks" />
            <datalist id="decks">
              {STARTER_DECKS.map((d) => <option key={d} value={d} />)}
            </datalist>
          </Field>
        </div>
        <Field label="What it does">
          <textarea required value={form.description} onChange={(e) => update("description", e.target.value)} className={input} rows={2} />
        </Field>
        <Field label="Example usage">
          <input value={form.example} onChange={(e) => update("example", e.target.value)} className={input} />
        </Field>
        <Field label="When to use it">
          <textarea value={form.whenToUse} onChange={(e) => update("whenToUse", e.target.value)} className={input} rows={2} />
        </Field>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Difficulty">
            <select value={form.difficulty} onChange={(e) => update("difficulty", e.target.value as Difficulty)} className={input}>
              {DIFFICULTIES.map((d) => <option key={d}>{d}</option>)}
            </select>
          </Field>
          <Field label={`Power: ${form.power}`}>
            <input type="range" min={1} max={100} value={form.power}
              onChange={(e) => update("power", parseInt(e.target.value))} className="w-full" />
          </Field>
        </div>

        <div className="rounded-xl border border-border p-4 space-y-3">
          <div className="font-bold">Quiz</div>
          <Field label="Question">
            <input value={form.quiz.question} onChange={(e) => updateQuiz("question", e.target.value)} className={input} />
          </Field>
          <Field label="Answer">
            <input value={form.quiz.answer} onChange={(e) => updateQuiz("answer", e.target.value)} className={input} />
          </Field>
          <Field label="Explanation">
            <textarea value={form.quiz.explanation} onChange={(e) => updateQuiz("explanation", e.target.value)} className={input} rows={2} />
          </Field>
        </div>

        <div className="flex gap-2 justify-end">
          <button type="button" onClick={() => navigate({ to: "/library" })}
            className="px-4 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground">
            Cancel
          </button>
          <button type="submit" className="px-5 py-2 rounded-lg bg-primary text-primary-foreground font-bold glow-primary">
            {editing ? "Save changes" : "Create card"}
          </button>
        </div>
      </form>
    </div>
  );
}

const input =
  "w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{label}</span>
      {children}
    </label>
  );
}