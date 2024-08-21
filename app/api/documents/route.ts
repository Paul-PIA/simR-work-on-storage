import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import { join } from "path";

// Définir le chemin du fichier JSON
const filePath = join(process.cwd(), "data", "documents.json");

// Définir le type de métadonnée
type DocumentRoomMetadata = {
  id: string;
  name: string;
  type: string;
  owner: string;
  draft: string;
};

// Fonction GET pour lire et renvoyer les métadonnées
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  try {
    const data = await fs.readFile(filePath, "utf8");
    const documents: DocumentRoomMetadata[] = JSON.parse(data);

    if (id) {
      const document = documents.find((doc) => doc.id === id);
      if (!document) {
        return NextResponse.json({
          error: "Document not found",
          status: 404,
        });
      }
      return NextResponse.json(document);
    }

    return NextResponse.json(documents);
  } catch (error) {
    console.error("Failed to read documents:", error);
    return NextResponse.json({
      error: "Failed to read documents",
      status: 500,
    });
  }
}

// Fonction POST pour ajouter une nouvelle métadonnée
export async function POST(request: Request) {
  try {
    const { document }: { document: DocumentRoomMetadata } =
      await request.json();

    if (
      !document ||
      !document.id ||
      !document.name ||
      !document.type ||
      !document.owner ||
      typeof document.draft !== "string"
    ) {
      return NextResponse.json({
        error: "Invalid metadata",
        status: 400,
      });
    }

    const data = await fs.readFile(filePath, "utf8");
    const documents: DocumentRoomMetadata[] = JSON.parse(data);

    documents.push(document);
    await fs.writeFile(filePath, JSON.stringify(documents, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save metadata:", error);
    return NextResponse.json({
      error: "Failed to save metadata",
      status: 500,
    });
  }
}

// Fonction PATCH pour mettre à jour un document
export async function PATCH(request: Request) {
  try {
    const {
      id,
      updates,
    }: { id: string; updates: Partial<DocumentRoomMetadata> } =
      await request.json();

    if (!id || !updates) {
      return NextResponse.json({
        error: "Invalid request payload",
        status: 400,
      });
    }

    const data = await fs.readFile(filePath, "utf8");
    const documents: DocumentRoomMetadata[] = JSON.parse(data);

    const documentIndex = documents.findIndex((doc) => doc.id === id);
    if (documentIndex === -1) {
      return NextResponse.json({
        error: "Document not found",
        status: 404,
      });
    }

    // Merge updates with the existing document
    documents[documentIndex] = { ...documents[documentIndex], ...updates };
    await fs.writeFile(filePath, JSON.stringify(documents, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update document:", error);
    return NextResponse.json({
      error: "Failed to update document",
      status: 500,
    });
  }
}

// Fonction DELETE pour supprimer un document
export async function DELETE(request: Request) {
  try {
    const { id }: { id: string } = await request.json();

    if (!id) {
      return NextResponse.json({
        error: "Invalid request payload",
        status: 400,
      });
    }

    const data = await fs.readFile(filePath, "utf8");
    const documents: DocumentRoomMetadata[] = JSON.parse(data);

    const filteredDocuments = documents.filter((doc) => doc.id !== id);
    if (filteredDocuments.length === documents.length) {
      return NextResponse.json({
        error: "Document not found",
        status: 404,
      });
    }

    await fs.writeFile(filePath, JSON.stringify(filteredDocuments, null, 2));

    // Supprimer la room de Liveblocks
    // try {
    //   await liveblocks.deleteRoom(id);
    // } catch (err) {
    //   console.error("Failed to delete Liveblocks room:", err);
    //   return NextResponse.json({
    //     error: "Failed to delete Liveblocks room",
    //     status: 500,
    //   });
    // }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete document:", error);
    return NextResponse.json({
      error: "Failed to delete document",
      status: 500,
    });
  }
}
