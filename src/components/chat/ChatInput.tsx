import type {
  KeyboardEvent,
  SubmitEvent,
} from "react";

import { Send } from "lucide-react";

import { useChatStore } from "../../store/chatStore";
import { Button } from "../ui/button";

interface ChatInputProps {
  onSubmit?: (message: string) => void;
}

export function ChatInput({
  onSubmit,
}: ChatInputProps) {
  const input = useChatStore((state) => state.input);

  const setInput = useChatStore(
    (state) => state.setInput,
  );

  const isSubmitting = useChatStore(
    (state) => state.isSubmitting,
  );

  const trimmedMessage = input.trim();

  const canSubmit =
    trimmedMessage.length > 0 &&
    !isSubmitting &&
    onSubmit !== undefined;

  const submitMessage = () => {
    if (!canSubmit || !onSubmit) {
      return;
    }

    onSubmit(trimmedMessage);
  };

  const handleSubmit = (
    event: SubmitEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    submitMessage();
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    const shouldSubmit =
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing;

    if (!shouldSubmit) {
      return;
    }

    event.preventDefault();
    submitMessage();
  };

  return (
    <form
      className="border-t bg-background p-4"
      onSubmit={handleSubmit}
    >
      <div className="mx-auto flex max-w-4xl items-end gap-2">
        <textarea
          aria-label="Chat message"
          autoComplete="off"
          className="
            flex
            min-h-11
            max-h-48
            w-full
            resize-none
            rounded-md
            border
            border-input
            bg-transparent
            px-3
            py-2
            text-sm
            shadow-sm
            placeholder:text-muted-foreground
            focus-visible:outline-none
            focus-visible:ring-1
            focus-visible:ring-ring
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
          disabled={isSubmitting}
          onChange={(event) => {
            setInput(event.target.value);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question..."
          rows={1}
          value={input}
        />

        <Button
          aria-label="Send message"
          disabled={!canSubmit}
          size="icon"
          type="submit"
        >
          <Send className="size-4" />
        </Button>
      </div>

      <p className="mx-auto mt-2 max-w-4xl text-center text-xs text-muted-foreground">
        Press Enter to send. Use Shift+Enter for a new line.
      </p>
    </form>
  );
}
