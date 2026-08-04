import { useEffect, useRef } from "react";

import {
  AlertCircle,
  Bot,
  CheckCircle2,
  FileText,
  LoaderCircle,
  ShieldAlert,
  User,
} from "lucide-react";

import {
  type ChatMessage,
  type ChatMessageStatus,
  useChatStore,
} from "../../store/chatStore";

const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: "2-digit",
  minute: "2-digit",
});

function formatMessageTime(createdAt: string): string {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return timeFormatter.format(date);
}

function formatSourceName(document: string): string {
  const normalizedDocument = document.trim();

  if (!normalizedDocument) {
    return "Unknown source";
  }

  const segments = normalizedDocument.split(/[\\/]/);

  return segments.at(-1) ?? normalizedDocument;
}

function formatSourceScore(score: number): string {
  if (!Number.isFinite(score)) {
    return "";
  }

  const normalizedScore = Math.min(
    Math.max(score, 0),
    1,
  );

  return `${Math.round(normalizedScore * 100)}%`;
}

interface MessageStatusProps {
  status: ChatMessageStatus;
}

function MessageStatus({
  status,
}: MessageStatusProps) {
  if (
    status === "pending" ||
    status === "streaming"
  ) {
    const statusLabel =
      status === "pending"
        ? "Thinking"
        : "Generating";

    return (
      <span
        aria-label={statusLabel}
        className="inline-flex items-center gap-1 text-xs text-muted-foreground"
      >
        <LoaderCircle
          aria-hidden="true"
          className="size-3 animate-spin"
        />

        {statusLabel}
      </span>
    );
  }

  if (status === "error") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-destructive">
        <AlertCircle
          aria-hidden="true"
          className="size-3"
        />

        Failed
      </span>
    );
  }

  return null;
}

interface GroundednessBadgeProps {
  grounded: boolean;
}

function GroundednessBadge({
  grounded,
}: GroundednessBadgeProps) {
  if (grounded) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-400">
        <CheckCircle2
          aria-hidden="true"
          className="size-3"
        />

        Grounded
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-400">
      <ShieldAlert
        aria-hidden="true"
        className="size-3"
      />

      Not grounded
    </span>
  );
}

interface MessageSourcesProps {
  sources: NonNullable<ChatMessage["sources"]>;
}

function MessageSources({
  sources,
}: MessageSourcesProps) {
  if (sources.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 border-t border-border pt-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Sources
      </p>

      <ol className="space-y-2">
        {sources.map((source, index) => {
          const sourceName = formatSourceName(
            source.document,
          );

          const score = formatSourceScore(
            source.score,
          );

          return (
            <li
              key={`${source.document}-${index}`}
              className="flex items-start gap-2 rounded-md border border-border bg-muted/40 px-3 py-2"
            >
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                {index + 1}
              </span>

              <FileText
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0 text-muted-foreground"
              />

              <div className="min-w-0 flex-1">
                <p
                  className="truncate text-xs font-medium text-foreground"
                  title={source.document}
                >
                  {sourceName}
                </p>

                {source.document !== sourceName && (
                  <p
                    className="mt-0.5 truncate text-xs text-muted-foreground"
                    title={source.document}
                  >
                    {source.document}
                  </p>
                )}
              </div>

              {score && (
                <span
                  className="shrink-0 text-xs tabular-nums text-muted-foreground"
                  title="Retrieval relevance score"
                >
                  {score}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function MessageList() {
  const messages = useChatStore(
    (state) => state.messages,
  );

  const endOfMessagesRef =
    useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <section
        aria-label="Chat messages"
        className="flex flex-1 items-center justify-center px-4 py-12"
      >
        <div className="max-w-lg text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
            <Bot
              aria-hidden="true"
              className="size-6 text-muted-foreground"
            />
          </div>

          <h2 className="text-lg font-semibold">
            Start a conversation
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Ask a question about the documents
            available to the Production AI Platform.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-label="Chat messages"
      aria-live="polite"
      aria-relevant="additions text"
      className="flex-1 overflow-y-auto"
      role="log"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-6">
        {messages.map((message) => {
          const isUserMessage =
            message.role === "user";

          const formattedTime =
            formatMessageTime(message.createdAt);

          const showGroundedness =
            !isUserMessage &&
            message.status === "completed" &&
            typeof message.grounded === "boolean";

          const showSources =
            !isUserMessage &&
            message.status === "completed" &&
            message.sources !== undefined &&
            message.sources.length > 0;

          return (
            <article
              key={message.id}
              aria-label={
                isUserMessage
                  ? "User message"
                  : "Assistant message"
              }
              className={
                isUserMessage
                  ? "flex justify-end gap-3"
                  : "flex justify-start gap-3"
              }
            >
              {!isUserMessage && (
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                  <Bot
                    aria-hidden="true"
                    className="size-4"
                  />
                </div>
              )}

              <div
                className={
                  isUserMessage
                    ? "max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-3 text-primary-foreground"
                    : "max-w-[85%] rounded-2xl rounded-bl-sm border border-border bg-background px-4 py-3 text-foreground"
                }
              >
                <div className="whitespace-pre-wrap wrap-break-word text-sm leading-6">
                  {message.content ||
                    (message.status === "pending"
                      ? "Preparing a response..."
                      : null)}
                </div>

                {!isUserMessage &&
                  (showGroundedness ||
                    showSources) && (
                    <div className="mt-4">
                      {showGroundedness && (
                        <GroundednessBadge
                          grounded={
                            message.grounded ===
                            true
                          }
                        />
                      )}

                      {showSources && (
                        <MessageSources
                          sources={
                            message.sources ?? []
                          }
                        />
                      )}
                    </div>
                  )}

                <div
                  className={
                    isUserMessage
                      ? "mt-2 flex items-center justify-end gap-2 text-xs text-primary-foreground/70"
                      : "mt-2 flex items-center gap-2 text-xs text-muted-foreground"
                  }
                >
                  {formattedTime && (
                    <time
                      dateTime={message.createdAt}
                    >
                      {formattedTime}
                    </time>
                  )}

                  {!isUserMessage && (
                    <MessageStatus
                      status={message.status}
                    />
                  )}
                </div>
              </div>

              {isUserMessage && (
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <User
                    aria-hidden="true"
                    className="size-4"
                  />
                </div>
              )}
            </article>
          );
        })}

        <div
          ref={endOfMessagesRef}
          aria-hidden="true"
        />
      </div>
    </section>
  );
}

export default MessageList;
