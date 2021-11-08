export type PrimerResumeHandler = IPrimerResumeHandler;
interface IPrimerResumeHandler {
  resumeWithError: (error: string | null) => void;
  resumeWithSuccess: (clientToken: string | null) => void;
}
