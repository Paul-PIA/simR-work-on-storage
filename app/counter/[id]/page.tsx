import { getDocument } from "@/lib/actions";
import { CounterDocumentView } from "./CounterDocumentView";
import axios from "axios";

export default async function Counter({
  params: { id },
}: {
  params: { id: string };
}) {
  const { data = null, error = null } = await getDocument({ documentId: id });

  // Récupérez la valeur initiale du compteur depuis l'API
  const response = await axios.get("http://localhost:3000/api/counter");
  const initialCount = response.data[0];

  return (
    <CounterDocumentView
      initialDocument={data}
      initialError={error}
      initialCount={initialCount}
    />
  );
}
