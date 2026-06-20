import { createFileRoute } from "@tanstack/react-router";
import { PlayMode } from "./flashcards";

export const Route = createFileRoute("/reverse")({
  head: () => ({
    meta: [
      { title: "Reverse Mode — CmdDeck" },
      { name: "description", content: "See the effect, recall the command." },
    ],
  }),
  component: () => <PlayMode mode="reverse" />,
});