"use server";

// QUATRIEME MODIFICATION : on ajoute une requête PATCH à l'api qui va permettre de modifier les metadonnées, ici le nom de l'organisation.

import axios, { AxiosError } from "axios";
import { auth } from "@/auth";
import { userAllowedInRoom } from "@/lib/utils";
import { liveblocks } from "@/liveblocks.server.config";
import { Document } from "@/types";

interface Props {
  documentId: Document["id"];
  name: Document["name"];
}

/**
 * Update Document Name
 *
 * Given a document, update its name
 * Uses custom API endpoint
 *
 * @param documentId - The documentId to update
 * @param name - The document's new name
 */
export async function renameDocument({ documentId, name }: Props) {
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

  // Update room name metadata
  try {
    const response = await axios.patch('http://localhost:3000/api/documents', {
      id: documentId,
      updates: {
        name: name,
      },
    });

    if (response.status !== 200) {
      console.error('Error updating document name:', response.data);
      return {
        error: {
          code: response.status,
          message: response.data.error || "Can't update room name metadata",
          suggestion: "Please refresh the page and try again",
        },
      };
    }
    
    return { data: true };
  } catch (err) {
    if (axios.isAxiosError(err)) {
      // AxiosError
      console.error('Failed to update document name:', err.message);
      return {
        error: {
          code: err.response?.status || 500,
          message: err.response?.data?.error || "Can't update room name metadata",
          suggestion: "Please refresh the page and try again",
        },
      };
    } else {
      // Unknown error
      console.error('Failed to update document name:', err);
      return {
        error: {
          code: 500,
          message: "An unknown error occurred",
          suggestion: "Please refresh the page and try again",
        },
      };
    }
  }
}
