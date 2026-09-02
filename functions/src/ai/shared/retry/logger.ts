export function logRetry(
  attempt: number,
): void {
  console.log(
    `========== AI RETRY ${attempt} ==========`,
  );
}

export function logValidationErrors(
  errors: string[],
): void {
  console.warn(
    "AI validation failed:",
  );

  for (const error of errors) {
    console.warn(`• ${error}`);
  }
}

export function logRawResponse(
  response: unknown,
): void {
  console.log(
    "========== AI RAW RESPONSE ==========",
  );

  console.log(
    JSON.stringify(
      response,
      null,
      2,
    ),
  );

  console.log(
    "=====================================",
  );
}

export function logParsedResponse(
  response: unknown,
): void {
  console.log(
    "======== AI PARSED RESPONSE ========",
  );

  console.log(
    JSON.stringify(
      response,
      null,
      2,
    ),
  );

  console.log(
    "====================================",
  );
}

export function logFallback(): void {
  console.warn(
    "AI returned an invalid response after all retry attempts. Using fallback response.",
  );
}