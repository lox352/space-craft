import { Stitch } from "./Stitch";

export interface SavedPattern {
  id: string;
  savedAt: Date;
  stitches: Stitch[];
  progress: number;
}
