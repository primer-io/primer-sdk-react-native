export type PrimerResumeHandler = IPrimerResumeHandler;
interface IPrimerResumeHandler {
  resumeWithError: (error?: string) => void;
  resumeWithSuccess: (clientToken?: string) => void;
}
