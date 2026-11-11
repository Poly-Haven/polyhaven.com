// Generative AI disclosure scale for gallery renders, least to most. Stored as these keys in
// `gallery/{id}.ai_use`. Copies of this list live in gallery.polyhaven.com/utils/aiDisclosure.ts and
// admin.polyhaven.com/utils/aiDisclosure.ts - keep all three in step.
//
// Short labels are `common:gen-ai.<key>` (the lightbox also shows on asset pages, which don't load the
// `gallery` namespace); the longer form descriptions are `gallery:submit.form.ai-level-d.<key>`.
export const AI_USE_LEVELS = ['none', 'process', 'minor', 'significant', 'mostly'] as const
export type AiUseLevel = (typeof AI_USE_LEVELS)[number]

// Same cap the gallery API enforces on submit.
export const AI_NOTE_MAX_LENGTH = 500

export const isAiUseLevel = (value: unknown): value is AiUseLevel =>
  typeof value === 'string' && (AI_USE_LEVELS as readonly string[]).includes(value)
