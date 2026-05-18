import { ClipboardCopy, DatabaseZap } from 'lucide-react';
import type { FailedIngestionLog } from '../types/events';

interface IngestionErrorQueueProps {
  logs: FailedIngestionLog[];
}

export function IngestionErrorQueue({ logs }: IngestionErrorQueueProps) {
  return (
    <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10" aria-label="Ingestion Error Queue">
      <details className="rounded-[1.5rem] border-2 border-charcoal-earth bg-crimson-red text-white shadow-[8px_8px_0px_0px_#564D4A]">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 text-left text-xl font-black">
          <span className="inline-flex items-center gap-3">
            <DatabaseZap aria-hidden="true" />
            Ingestion Error Queue
          </span>
          <span className="rounded-full border-2 border-white px-3 py-1 text-sm">{logs.length}</span>
        </summary>

        <div className="border-t-2 border-white/60 bg-canvas-base p-5 text-charcoal-earth">
          {logs.length === 0 ? (
            <p className="font-bold">No failing scraps detected in the current application state.</p>
          ) : (
            <div className="grid gap-4">
              {logs.map((log) => (
                <FailureCard key={log.id} log={log} />
              ))}
            </div>
          )}
        </div>
      </details>
    </section>
  );
}

function FailureCard({ log }: { log: FailedIngestionLog }) {
  const prompt = buildOverridePrompt(log);

  async function copyPrompt() {
    await navigator.clipboard.writeText(prompt);
  }

  return (
    <article className="rounded-2xl border-2 border-charcoal-earth bg-white p-4 shadow-[4px_4px_0px_0px_#564D4A]">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-crimson-red">
            {log.source} failure
          </p>
          <h3 className="mt-2 text-xl font-black">{log.title || 'Untitled incoming row'}</h3>
          <p className="mt-2 text-sm font-semibold text-deep-wine">
            Missing: {log.missingProperties.join(', ')}
          </p>
          {log.targetUrl ? (
            <p className="mt-1 break-all text-sm font-bold text-charcoal-earth/80">{log.targetUrl}</p>
          ) : null}
        </div>

        <button
          type="button"
          className="neo-brutal inline-flex items-center justify-center gap-2 rounded-full bg-warm-honey px-4 py-2 text-sm font-black text-charcoal-earth"
          onClick={copyPrompt}
        >
          <ClipboardCopy size={16} aria-hidden="true" />
          Copy override prompt
        </button>
      </div>
    </article>
  );
}

function buildOverridePrompt(log: FailedIngestionLog) {
  return `# Ingestion override patch request

Target URL: ${log.targetUrl ?? 'Unknown source URL'}
Source: ${log.source}
Missing or invalid properties: ${log.missingProperties.join(', ')}

Current scraped values:
- Title: ${log.title ?? '[missing]'}
- Description: ${log.description ?? '[missing]'}
- Image URL: ${log.imageUrl ?? '[missing]'}

Please write a code-override patch that:
1. Adds a source-specific guard for the target URL above.
2. Supplies verified title, description, imageUrl, address, city, tags, and event date fields.
3. Rejects placeholder or hallucinated rows before they are committed.
4. Includes a focused unit test proving the override and rejection behavior.`;
}
