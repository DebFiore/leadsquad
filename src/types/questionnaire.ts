export interface QuestionnaireAnswer {
  [key: string]: string | boolean | null;
}

export interface OnboardingState {
  currentQuestionIndex: number;
  answers: QuestionnaireAnswer;
  totalQuestions: number;
  isComplete: boolean;
}
