export type PrimerResumeHandler = IPrimerResumeHandler;
interface IPrimerResumeHandler {
  resumeWithError: () => void;
  resumeWithSuccess: () => void;
}
