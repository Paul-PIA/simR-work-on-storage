"use server";

import { RoomAccesses } from "@liveblocks/node";
import { nanoid } from "nanoid";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DOCUMENT_URL } from "@/constants";
import { buildDocument, getDraftsGroupName } from "@/lib/utils";
import { liveblocks } from "@/liveblocks.server.config";
import {
  Document,
  DocumentGroup,
  DocumentRoomMetadata,
  DocumentType,
  DocumentUser,
} from "@/types";
import axios from "axios";

type Props = {
  name: Document["name"];
  type: DocumentType;
  userId: DocumentUser["id"];
  groupIds?: DocumentGroup["id"][];
  draft?: boolean;
};

/**
 * Create Document
 *
 * Create a new document, with a specified name and type, from userId and groupId
 * Uses custom API endpoint
 *
 * @param options - Document creation options
 * @param options.name - The name of the new document
 * @param options.type - The type of the new document e.g. "canvas"
 * @param options.groupIds - The new document's initial groups
 * @param options.userId - The user creating the document
 * @param options.draft - If the document is a draft (no public or group access, but can invite)
 * @param redirectToDocument - Redirect to the newly created document on success
 */
export async function createDocument(
  { name, type, groupIds, userId, draft = false }: Props,
  redirectToDocument?: boolean
) {
  const session = await auth();

  if (!session) {
    return {
      error: {
        code: 401,
        message: "Not signed in",
        suggestion: "Sign in to create a new document",
      },
    };
  }

  // Give creator of document full access
  const usersAccesses: RoomAccesses = {
    [userId]: ["room:write"],
  };

  const groupsAccesses: RoomAccesses = {};

  if (draft) {
    // If draft, only add draft group access
    groupsAccesses[getDraftsGroupName(userId)] = ["room:write"];
  } else if (groupIds) {
    // If groupIds sent, limit access to these groups
    groupIds.forEach((groupId: string) => {
      groupsAccesses[groupId] = ["room:write"];
    });
  }

  const roomId = nanoid();

  const metadata: DocumentRoomMetadata = {
    id: roomId,
    name: name,
    type: type,
    owner: userId,
    draft: draft ? "yes" : "no",
  };

  try {
    await axios.post("http://localhost:3000/api/documents", { document: metadata });
  } catch (error) {
    console.error("Erreur lors de la creation des metadonnees :", error);
  }

  let room;
  try {
    room = await liveblocks.createRoom(roomId, {
      usersAccesses,
      groupsAccesses,
      defaultAccesses: [],
    });
  } catch (err) {
    return {
      error: {
        code: 401,
        message: "Can't create room",
        suggestion: "Please refresh the page and try again",
      },
    };
  }

  // Utilisez `await` pour attendre la résolution de la promesse
  const document: Document = await buildDocument(room);

  if (redirectToDocument) {
    // Has to return `undefined`
    return redirect(DOCUMENT_URL(document.type, document.id));
  }

  return { data: document };
}
