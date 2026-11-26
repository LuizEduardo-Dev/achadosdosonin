export interface ActionState {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string>;
  values?: Record<string, string>;
}

export type SimpleActionResult =
  | { ok: true }
  | { ok: false; error: string };
