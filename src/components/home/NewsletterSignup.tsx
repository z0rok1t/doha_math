"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { SiteContent } from "@/lib/types";

/**
 * Newsletter form.
 *
 * v1 does not send email. Submitting logs the address and shows a confirmation
 * so the interaction is complete end to end, but nothing leaves the browser.
 *
 * TODO: wire this to a real email service. The submit handler is the only place
 * that needs to change — POST the address to a route handler that forwards it
 * to the provider (Buttondown, Resend, Mailchimp), keep the API key server-side
 * in an env var, and replace the optimistic success state with the real
 * response. Validation beyond the browser's `type="email"` check belongs there
 * too, along with a double opt-in confirmation.
 */
export function NewsletterSignup({ site }: { site: SiteContent }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // TODO: replace with a real subscribe call.
    console.log("[newsletter] would subscribe:", email);
    setSubmitted(true);
    setEmail("");
  }

  return (
    <div
      id="newsletter"
      className="flex flex-wrap items-center justify-between gap-[30px] rounded-panel bg-ink px-8 py-[50px] text-paper wide:px-11"
    >
      <div className="max-w-[400px]">
        <h3 className="text-[1.7rem]">{site.newsletter.heading}</h3>
        <p className="mt-2 font-mono text-[0.78rem] text-ink-mute">
          {site.newsletter.note}
        </p>
      </div>

      {submitted ? (
        <p role="status" className="font-mono text-[0.9rem] text-yellow">
          You&apos;re on the list. Tomorrow&apos;s problem lands tonight.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-wrap gap-2.5">
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="newsletter-email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@email.com"
            className="w-[230px] rounded-ctl border-2 border-ink-line bg-ink-raise px-4 py-3 text-white placeholder:text-ink-faint"
          />
          <Button type="submit" variant="red">
            Sign up
          </Button>
        </form>
      )}
    </div>
  );
}
