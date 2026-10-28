"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, ArrowUpRight, Mail, Send } from "lucide-react";
import { seed, type Catalog } from "../../lib/catalog";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "ready">("idle");
  const [settings, setSettings] = useState(seed.settings);

  useEffect(() => {
    fetch("/api/catalog")
      .then((response) => response.ok ? response.json() as Promise<Catalog> : Promise.reject())
      .then((catalog) => setSettings(catalog.settings))
      .catch(() => null);
  }, []);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const subject = encodeURIComponent(
      `Red Cycle Comics enquiry${name.trim() ? ` from ${name.trim()}` : ""}`,
    );
    const body = encodeURIComponent(
      [
        name.trim() ? `Name: ${name.trim()}` : null,
        `Email: ${email.trim()}`,
        "",
        message.trim(),
      ]
        .filter((line) => line !== null)
        .join("\n"),
    );

    setStatus("ready");
    window.location.href = `mailto:${settings.email}?subject=${subject}&body=${body}`;
  }

  return (
    <main className="contact-page">
      <div className="contact-smoke" aria-hidden="true" />

      <nav className="contact-nav" aria-label="Contact page navigation">
        <Link href="/" className="contact-back">
          <ArrowLeft size={18} />
          Back to portfolio
        </Link>

        <Link href="/" className="contact-brand" aria-label={`${settings.brandName} ${settings.brandSuffix} home`}>
          <span className="brand-mark">
            R<span>c</span>
          </span>
          <span>
            {settings.brandName}<small>{settings.brandSuffix}</small>
          </span>
        </Link>
      </nav>

      <div className="contact-stripe" aria-hidden="true"><span>COMICS</span><b>✳</b><span>ANIMATION</span><b>✳</b><span>ART</span><b>✳</b><span>ORIGINAL WORLDS</span></div>

      <section className="contact-intro">
        <div>
          <span className="eyebrow">04 / GET IN TOUCH</span>
          <h1>
            LET&apos;S MAKE
            <br />
            SOMETHING <em>BOLD.</em>
          </h1>
        </div>
        <p>
          Questions about commissions, licensing or collaborations? Tell us
          what you have in mind and start the next panel with {settings.brandName}.
        </p>
      </section>

      <section className="contact-layout">
        <aside className="contact-card">
          <span className="contact-card-number">01</span>
          <Mail size={28} aria-hidden="true" />
          <p>DIRECT EMAIL</p>
          <a href={`mailto:${settings.email}`}>
            {settings.email}
            <ArrowUpRight size={18} />
          </a>
          <small>
            For comic, animation, artwork, logo, licensing and collaboration
            enquiries.
          </small>
        </aside>

        <form className="contact-form" onSubmit={onSubmit}>
          <div className="contact-form-heading">
            <div>
              <span className="eyebrow">PROJECT ENQUIRY</span>
              <h2>Tell us about your idea.</h2>
            </div>
            <span>02</span>
          </div>

          <div className="contact-fields">
            <label htmlFor="contact-name">
              Name <span>Optional</span>
            </label>
            <input
              id="contact-name"
              name="name"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your name"
            />

            <label htmlFor="contact-email">Email</label>
            <input
              id="contact-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@email.com"
            />

            <label htmlFor="contact-message">Your idea</label>
            <textarea
              id="contact-message"
              name="message"
              required
              minLength={10}
              maxLength={2000}
              rows={7}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Tell us about your character, comic, animation, artwork or logo..."
            />
            <span className="contact-count">{message.length} / 2000</span>
          </div>

          <div className="contact-actions">
            <button
              type="submit"
              className="solid-button"
              disabled={!email.trim() || message.trim().length < 10}
            >
              Open email <Send size={17} />
            </button>
            <p role="status" aria-live="polite">
              {status === "ready"
                ? "Your email app is opening with your message ready to send."
                : "This opens your email app so you can review the message before sending."}
            </p>
          </div>
        </form>
      </section>
    </main>
  );
}
