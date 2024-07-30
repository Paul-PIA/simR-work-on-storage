import { RoomInfo } from "@liveblocks/node";
import { Document, DocumentRoomMetadata } from "@/types";
import { roomAccessesToDocumentAccess } from "./convertAccessType";
import axios from "axios";

/**
 * Convert Liveblocks rooms into our custom document format
 *
 * @param rooms - Liveblocks rooms
 */
export async function buildDocuments(rooms: RoomInfo[]): Promise<Document[]> {
  if (!rooms) return [];

  // Utilisez `Promise.all` pour attendre que toutes les promesses se résolvent
  return Promise.all(rooms.map((room) => buildDocument(room)));
}

export async function buildDocument(room: RoomInfo): Promise<Document> {
  let name: Document["name"] = "Untitled";
  let owner: Document["owner"] = "";
  let draft: Document["draft"] = false;
  let type: Document["type"] = "spreadsheet";
  let id: Document["id"] = "";

  // Get document info from metadata
  try {
    const response = await axios.get(`http://localhost:3000/api/documents`);
    const documents = response.data;
    const metadata = documents.find((doc: any) => doc.id === room.id);
    if (metadata) {
      if (metadata.name) name = metadata.name;
      if (metadata.owner) owner = metadata.owner;
      if (metadata.draft === "yes") draft = true;
      if (metadata.type) type = metadata.type;
      if (metadata.id) id = metadata.id;
    }
  } catch (error) {
    console.error("Failed to fetch document metadata:", error);
  }

  // Get default, group, and user access from metadata
  const defaultAccess: Document["accesses"]["default"] =
    roomAccessesToDocumentAccess(room.defaultAccesses);

  const groups: Document["accesses"]["groups"] = {};
  Object.entries(room.groupsAccesses).forEach(([id, accessValue]) => {
    if (accessValue) {
      groups[id] = roomAccessesToDocumentAccess(accessValue);
    }
  });

  const users: Document["accesses"]["users"] = {};
  Object.entries(room.usersAccesses).forEach(([id, accessValue]) => {
    if (accessValue) {
      users[id] = roomAccessesToDocumentAccess(accessValue);
    }
  });

  const created = room.createdAt.toString();
  const lastConnection = room.lastConnectionAt
    ? room.lastConnectionAt.toString()
    : created;

  // Return our custom Document format
  return {
    id,
    created,
    lastConnection,
    type,
    name,
    owner,
    draft,
    accesses: {
      default: defaultAccess,
      groups,
      users,
    },
  };
}
