import { useMutation } from '@tanstack/react-query';
import type {
  PhotoTagRequest,
  PhotoTagResult,
  RecallMessageRequest,
  SlotSuggestionRequest,
  SuggestedSlot,
  VisitSummaryRequest,
} from '@reinly/api-client';
import { apiClient } from '@/lib/api';
import { useCtx } from '@/features/_shared/use-ctx';

export function useVisitSummary() {
  const ctx = useCtx();
  return useMutation<{ text: string }, Error, VisitSummaryRequest>({
    mutationFn: (input) => apiClient.ai.visitSummary(ctx, input),
  });
}

export function useRecallMessage() {
  const ctx = useCtx();
  return useMutation<{ text: string }, Error, RecallMessageRequest>({
    mutationFn: (input) => apiClient.ai.recallMessage(ctx, input),
  });
}

export function useSuggestSlots() {
  const ctx = useCtx();
  return useMutation<{ slots: SuggestedSlot[] }, Error, SlotSuggestionRequest>({
    mutationFn: (input) => apiClient.ai.suggestSlots(ctx, input),
  });
}

export function useTagPhoto() {
  const ctx = useCtx();
  return useMutation<PhotoTagResult, Error, PhotoTagRequest>({
    mutationFn: (input) => apiClient.ai.tagPhoto(ctx, input),
  });
}
