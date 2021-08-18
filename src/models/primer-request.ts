const primerResumeIntent = ['showError', 'showSuccess'] as const;

type PrimerResumeIntent = typeof primerResumeIntent[number];
export interface IPrimerResumeRequest {
  intent: PrimerResumeIntent;
  token: String;
  metadata?: IPrimerRequestMetadata;
}

interface IPrimerRequestMetadata {
  message: String;
}
