import { Stitch } from "./Stitch";

export interface SavedPattern {
  name?: string;
  id: string;
  savedAt: Date;
  stitches: Stitch[];
  progress: number;
}
