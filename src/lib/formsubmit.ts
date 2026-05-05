const FORMSUBMIT_ENDPOINT = "https://formsubmit.co/ajax/rahul@lwyrd.co";

interface FormPayload {
  [key: string]: string;
}

export async function submitForm(payload: FormPayload): Promise<void> {
  const res = await fetch(FORMSUBMIT_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      ...payload,
      _captcha: "false",
    }),
  });

  if (!res.ok) {
    throw new Error(`Form submission failed: ${res.status}`);
  }

  const data = await res.json();
  if (data.success !== "true" && data.success !== true) {
    throw new Error("Form submission not acknowledged");
  }
}
