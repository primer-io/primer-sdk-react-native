export interface IPrimerError {
  errorId: string;
  description?: string;
  recoverySuggestion?: string;
}


export class PrimerError extends Error {

  errorId: string;
  description: string;
  recoverySuggestion?: string;

  constructor(errorId: string, description: string, recoverySuggestion: string | undefined) {
      super(description);
      this.errorId = errorId;
      this.description = description;
      this.recoverySuggestion = recoverySuggestion;
  }
}
