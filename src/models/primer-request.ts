export type PrimerResumeHandler = IPrimerResumeHandler;

interface IPrimerResumeHandler {
  handleError: (error: string) => void;

  handleSuccess: () => void;

  handleNewClientToken: (token: string) => void;

  /**
   * @deprecated This method should not be used
   * Please use handleError instead.
   */
  resumeWithError: (error: string | null) => void;

  /**
   * @deprecated This method should not be used.
   * Please use handleSuccess or handleNewClientToken instead.
   */
  resumeWithSuccess: (clientToken: string | null) => void;
}
