/**
 * AI Generation Error Handling
 * Enterprise-grade error handling for AI operations
 */

export class AIGenerationError extends Error {
  constructor(
    message: string,
    public code: string,
    public retryable: boolean = false,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AIGenerationError';
  }
}

export const ERROR_CODES = {
  RATE_LIMIT_EXCEEDED: {
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'You have exceeded your generation limit. Please try again later.',
    retryable: true,
    statusCode: 429,
  },
  INVALID_PROMPT: {
    code: 'INVALID_PROMPT',
    message: 'The prompt contains invalid content or is too long.',
    retryable: false,
    statusCode: 400,
  },
  MODEL_ERROR: {
    code: 'MODEL_ERROR',
    message: 'The AI model encountered an error. Please try again.',
    retryable: true,
    statusCode: 500,
  },
  TIMEOUT: {
    code: 'TIMEOUT',
    message: 'The generation took too long and was cancelled.',
    retryable: true,
    statusCode: 504,
  },
  UNAUTHORIZED: {
    code: 'UNAUTHORIZED',
    message: 'You must be logged in to generate images.',
    retryable: false,
    statusCode: 401,
  },
  INSUFFICIENT_CREDITS: {
    code: 'INSUFFICIENT_CREDITS',
    message: 'You do not have enough credits. Please upgrade your plan.',
    retryable: false,
    statusCode: 402,
  },
  INVALID_INPUT: {
    code: 'INVALID_INPUT',
    message: 'Invalid input parameters provided.',
    retryable: false,
    statusCode: 400,
  },
  UNKNOWN_ERROR: {
    code: 'UNKNOWN_ERROR',
    message: 'An unknown error occurred. Please try again.',
    retryable: true,
    statusCode: 500,
  },
} as const;

/**
 * Retry a function with exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffFactor?: number;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
  } = options;

  let lastError: Error;
  let delay = initialDelay;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on non-retryable errors
      if (error instanceof AIGenerationError && !error.retryable) {
        throw error;
      }

      // Don't retry on the last attempt
      if (attempt === maxRetries - 1) {
        break;
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));

      // Increase delay for next attempt (exponential backoff)
      delay = Math.min(delay * backoffFactor, maxDelay);
    }
  }

  throw lastError!;
}

/**
 * Validate prompt content
 */
export function validatePrompt(prompt: string): {
  valid: boolean;
  error?: AIGenerationError;
} {
  // Check if prompt is empty
  if (!prompt || prompt.trim().length === 0) {
    return {
      valid: false,
      error: new AIGenerationError(
        'Prompt cannot be empty',
        ERROR_CODES.INVALID_PROMPT.code,
        false,
        400
      ),
    };
  }

  // Check prompt length (max 1000 characters for safety)
  if (prompt.length > 1000) {
    return {
      valid: false,
      error: new AIGenerationError(
        'Prompt is too long (max 1000 characters)',
        ERROR_CODES.INVALID_PROMPT.code,
        false,
        400
      ),
    };
  }

  // Check for potentially harmful content (basic filter)
  const harmfulPatterns = [
    /\b(nude|naked|nsfw|porn|xxx)\b/i,
    /\b(violence|gore|blood)\b/i,
    /\b(illegal|drugs)\b/i,
  ];

  for (const pattern of harmfulPatterns) {
    if (pattern.test(prompt)) {
      return {
        valid: false,
        error: new AIGenerationError(
          'Prompt contains inappropriate content',
          ERROR_CODES.INVALID_PROMPT.code,
          false,
          400
        ),
      };
    }
  }

  return { valid: true };
}

/**
 * Handle Replicate API errors
 */
export function handleReplicateError(error: any): AIGenerationError {
  const message = error.message || error.toString();

  // Rate limiting
  if (error.response?.status === 429 || message.includes('rate limit')) {
    return new AIGenerationError(
      ERROR_CODES.RATE_LIMIT_EXCEEDED.message,
      ERROR_CODES.RATE_LIMIT_EXCEEDED.code,
      true,
      429
    );
  }

  // Timeout
  if (message.includes('timeout') || message.includes('timed out')) {
    return new AIGenerationError(
      ERROR_CODES.TIMEOUT.message,
      ERROR_CODES.TIMEOUT.code,
      true,
      504
    );
  }

  // Model errors
  if (message.includes('model') || message.includes('prediction failed')) {
    return new AIGenerationError(
      ERROR_CODES.MODEL_ERROR.message,
      ERROR_CODES.MODEL_ERROR.code,
      true,
      500
    );
  }

  // Default unknown error
  return new AIGenerationError(
    ERROR_CODES.UNKNOWN_ERROR.message,
    ERROR_CODES.UNKNOWN_ERROR.code,
    true,
    500
  );
}
