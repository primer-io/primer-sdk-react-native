export type PrimerResumeHandler = IPrimerResumeHandler;

interface IPrimerResumeHandler {
  handleNewClientToken: (clientToken: string) => void;
  handleError: (error: Error) => void;
  handleSuccess: () => void;
}
