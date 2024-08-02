import { Document, User } from "./types";

// SUPPRESSION du paramètre Storage, il faut répercuter ce changement dans toutes les instances de Room de l'application

declare global {
  interface Liveblocks {
    // Each user's Presence, for useMyPresence, useOthers, etc.
    Presence: {
      cursor: { x: number; y: number } | null;
    };
    // Custom user info set when authenticating with a secret key
    UserMeta: {
      id: string;
      info: Pick<User, "name" | "avatar" | "color">;
    };
    // Custom events, for useBroadcastEvent, useEventListener
    RoomEvent: {
      type: "SHARE_DIALOG_UPDATE";
    };
    // Custom metadata set on threads, for useThreads, useCreateThread, etc.
    ThreadMetadata: {
      highlightId: string;
    };
    ActivitiesData: {
      $addedToDocument: {
        documentId: Document["id"];
      };
    };
  }
}
