"use server";

// CINQUIEME MODIFICATION : On ajoute une requête DELETE pour pouvoir supprimer un document du fichier json. ATTENTION ! il faut aussi supprimer la Room de Liveblocks

import axios from "axios";
import { auth } from "@/auth";
import { userAllowedInRoom } from "@/lib/utils";
import { liveblocks } from "@/liveblocks.server.config";
import { Document } from "@/types";

type Props = {
  documentId: Document["id"];
};

/**
 * Delete Document
 *
 * Deletes a document from its id
 * Uses custom API endpoint
 *
 * @param documentId - The document's id
 */
export async function deleteDocument({ documentId }: Props) {
  let session;
  let room;
  try {
    // Get session and room
    const result = await Promise.all([auth(), liveblocks.getRoom(documentId)]);
    session = result[0];
    room = result[1];
  } catch (err) {
    console.error(err);
    return {
      error: {
        code: 500,
        message: "Error fetching document",
        suggestion: "Refresh the page and try again",
      },
    };
  }

  if (!room) {
    return {
      error: {
        code: 404,
        message: "Document not found",
        suggestion: "Check that you're on the correct page",
      },
    };
  }

  // Check current user has write access on the room (if not logged in, use empty values)
  if (
    !userAllowedInRoom({
      accessAllowed: "write",
      userId: session?.user.info.id ?? "",
      groupIds: session?.user.info.groupIds ?? [],
      room,
    })
  ) {
    return {
      error: {
        code: 403,
        message: "Not allowed access",
        suggestion: "Check that you've been given permission to the room",
      },
    };
  }

  // Delete document and room
  try {
    // Delete document via API
    const response = await axios.delete("http://localhost:3000/api/documents", {
      data: { id: documentId },
    });

    if (response.status !== 200) {
      console.error("Error deleting document:", response.data);
      return {
        error: {
          code: response.status,
          message: response.data.error || "Can't delete the document",
          suggestion: "Please try again",
        },
      };
    }

    return { data: documentId };
  } catch (err) {
    if (axios.isAxiosError(err)) {
      // AxiosError
      console.error("Failed to delete document:", err.message);
      return {
        error: {
          code: err.response?.status || 500,
          message: err.response?.data?.error || "Can't delete the document",
          suggestion: "Please try again",
        },
      };
    } else {
      // Unknown error
      console.error("Failed to delete document:", err);
      return {
        error: {
          code: 500,
          message: "An unknown error occurred",
          suggestion: "Please try again",
        },
      };
    }
  }
}
