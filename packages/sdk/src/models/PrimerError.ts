export class PrimerError extends Error {
  errorId: string;
  errorCode?: string;
  description: string;
  recoverySuggestion?: string;
  diagnosticsId?: string;

  constructor(errorId: string, errorCode: string | undefined, description: string, recoverySuggestion: string | undefined, diagnosticsId: string | undefined) {
    super(description);
    this.errorId = errorId;
    this.errorCode = errorCode;
    this.description = description;
    this.recoverySuggestion = recoverySuggestion;
    this.diagnosticsId = diagnosticsId;
  }
}
