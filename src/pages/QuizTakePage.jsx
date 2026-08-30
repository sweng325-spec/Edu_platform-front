import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Clock3, Trophy, XCircle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { quizzesApi } from '../api/quizzes';
import { formatDeadline, formatTimeRemaining } from '../utils/quizzes';
import { quizStorage } from '../utils/quizStorage';

export default function QuizTakePage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [quiz, setQuiz] = useState(null);
  const [fullQuiz, setFullQuiz] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [showResults, setShowResults] = useState(false);
  const autoSubmitted = useRef(false);

  const handleSubmit = useCallback(async (answersToSubmit) => {
    if (!attempt || attempt.submittedAt || submitting) return;

    setSubmitting(true);
    try {
      const result = await quizzesApi.submitAttempt(attempt.id, answersToSubmit);
      setAttempt(result);
      setShowResults(true);
      setFullQuiz(quizStorage.getQuizById(quizId));
    } catch (err) {
      setError(err.userMessage || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  }, [attempt, submitting, quizId]);

  useEffect(() => {
    if (!user?.id || !quizId) return;

    const load = async () => {
      setLoading(true);
      try {
        const rawQuiz = quizStorage.getQuizById(quizId);
        if (!rawQuiz || !rawQuiz.published) {
          setError('Quiz not found or not available.');
          return;
        }

        if (rawQuiz.deadline && new Date(rawQuiz.deadline).getTime() < Date.now()) {
          const existingAttempt = quizStorage.getAttempt(quizId, user.id);
          if (!existingAttempt?.submittedAt) {
            setError('This quiz deadline has passed.');
            setQuiz(quizStorage.stripCorrectAnswers(rawQuiz));
            return;
          }
        }

        const studentQuiz = quizStorage.stripCorrectAnswers(rawQuiz);
        setQuiz(studentQuiz);
        setFullQuiz(rawQuiz);

        let currentAttempt = await quizzesApi.getAttempt(quizId, user.id);

        if (currentAttempt?.submittedAt) {
          setAttempt(currentAttempt);
          setAnswers(currentAttempt.answers || {});
          setShowResults(true);
        } else if (currentAttempt) {
          setAttempt(currentAttempt);
          setAnswers(currentAttempt.answers || {});
        } else {
          currentAttempt = await quizzesApi.startAttempt(quizId, user.id);
          setAttempt(currentAttempt);
        }
      } catch (err) {
        setError(err.userMessage || 'Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user?.id, quizId]);

  useEffect(() => {
    if (!attempt || attempt.submittedAt || showResults) return undefined;

    const tick = () => {
      const remaining = formatTimeRemaining(attempt.expiresAt);
      setTimeLeft(remaining);

      if (new Date(attempt.expiresAt).getTime() <= Date.now() && !autoSubmitted.current) {
        autoSubmitted.current = true;
        handleSubmit(answers);
      }
    };

    tick();
    const intervalId = window.setInterval(tick, 1000);
    return () => window.clearInterval(intervalId);
  }, [attempt, answers, showResults, handleSubmit]);

  useEffect(() => {
    if (showResults || !attempt || attempt.submittedAt) return undefined;

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [showResults, attempt]);

  const selectAnswer = (questionId, choiceId) => {
    if (showResults || attempt?.submittedAt) return;
    setAnswers((current) => ({ ...current, [questionId]: choiceId }));
  };

  const onSubmit = (event) => {
    event.preventDefault();
    const unanswered = (quiz?.questions || []).filter((q) => !answers[q.id]);
    if (unanswered.length > 0) {
      const proceed = window.confirm(
        `You have ${unanswered.length} unanswered question(s). Submit anyway?`
      );
      if (!proceed) return;
    }
    handleSubmit(answers);
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600 dark:border-slate-700 dark:border-t-emerald-400" />
      </div>
    );
  }

  if (error && !quiz) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 py-10 text-center">
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <Link to="/quizzes" className="inline-flex text-sm font-semibold text-emerald-700 hover:text-emerald-800">
          Back to quizzes
        </Link>
      </div>
    );
  }

  if (showResults && attempt) {
    const reviewQuiz = fullQuiz || quizStorage.getQuizById(quizId);

    return (
      <div className="mx-auto max-w-3xl space-y-6 pb-10">
        <Link
          to="/quizzes"
          className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to quizzes
        </Link>

        <section className="rounded-[30px] bg-[#123f30] px-6 py-8 text-white shadow-[0_18px_45px_-24px_rgba(17,74,54,0.8)]">
          <div className="flex items-center gap-3">
            <Trophy className="h-10 w-10 text-amber-300" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#d9edc7]">Quiz complete</p>
              <h1 className="mt-1 text-3xl font-semibold">{quiz?.title}</h1>
            </div>
          </div>
          <div className="mt-6 rounded-2xl bg-white/10 p-6 backdrop-blur-sm">
            <p className="text-5xl font-bold">{attempt.score}%</p>
            <p className="mt-2 text-emerald-100">
              {attempt.correctCount} of {attempt.totalQuestions} questions correct
            </p>
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Answer review</h2>
          <div className="mt-4 space-y-6">
            {(reviewQuiz?.questions || []).map((question, index) => {
              const selectedId = attempt.answers?.[question.id];
              const correctChoice = question.choices.find((c) => c.isCorrect);
              const isCorrect = selectedId === correctChoice?.id;

              return (
                <div
                  key={question.id}
                  className={`rounded-2xl border p-4 ${
                    isCorrect
                      ? 'border-emerald-200 bg-emerald-50/60 dark:border-emerald-800 dark:bg-emerald-950/20'
                      : 'border-red-200 bg-red-50/60 dark:border-red-800 dark:bg-red-950/20'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {isCorrect ? (
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                    ) : (
                      <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                    )}
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {index + 1}. {question.text}
                      </p>
                      <div className="mt-2 space-y-1 text-sm">
                        {question.choices.map((choice) => {
                          const isSelected = selectedId === choice.id;
                          const isCorrectChoice = choice.isCorrect;
                          return (
                            <p
                              key={choice.id}
                              className={`rounded-lg px-2 py-1 ${
                                isCorrectChoice
                                  ? 'font-semibold text-emerald-700 dark:text-emerald-300'
                                  : isSelected
                                    ? 'text-red-600 dark:text-red-400'
                                    : 'text-slate-600 dark:text-slate-400'
                              }`}
                            >
                              {choice.text}
                              {isCorrectChoice && ' ✓'}
                              {isSelected && !isCorrectChoice && ' (your answer)'}
                            </p>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-10">
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/quizzes"
          className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to quizzes
        </Link>
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
          <Clock3 className="h-4 w-4" />
          {timeLeft}
        </div>
      </div>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{quiz?.title}</h1>
        {quiz?.description && (
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{quiz.description}</p>
        )}
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Due {formatDeadline(quiz?.deadline)} · {(quiz?.questions || []).length} questions
        </p>
      </section>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/20 dark:text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        {(quiz?.questions || []).map((question, index) => (
          <fieldset
            key={question.id}
            className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800/60"
          >
            <legend className="mb-3 text-base font-semibold text-slate-900 dark:text-white">
              {index + 1}. {question.text}
            </legend>
            <div className="space-y-2">
              {question.choices.map((choice) => (
                <label
                  key={choice.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition ${
                    answers[question.id] === choice.id
                      ? 'border-emerald-500 bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-950/30'
                      : 'border-slate-200 bg-white hover:border-emerald-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-emerald-700'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    checked={answers[question.id] === choice.id}
                    onChange={() => selectAnswer(question.id, choice.id)}
                    className="h-4 w-4 accent-emerald-600"
                  />
                  <span className="text-sm text-slate-800 dark:text-slate-200">{choice.text}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ))}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-xl bg-[#16623f] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#104d32] disabled:opacity-60"
          >
            <CheckCircle2 className="h-4 w-4" />
            {submitting ? 'Submitting...' : 'Submit quiz'}
          </button>
        </div>
      </form>
    </div>
  );
}
