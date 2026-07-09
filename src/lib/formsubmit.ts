const FORMS_ENDPOINT = "/api/forms";

interface FormPayload {
  [key: string]: string;
}

export async function submitForm(payload: FormPayload): Promise<void> {
  const res = await fetch(FORMS_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let message = `Form submission failed: ${res.status}`;
    try {
      const data = (await res.json()) as { error?: string };
      if (data.error) message = data.error;
    } catch {
      // Keep the status-based fallback if the response was not JSON.
    }
    throw new Error(message);
  }

  const data = await res.json();
  if (data.ok !== true) {
    throw new Error("Form submission not acknowledged");
  }
}
