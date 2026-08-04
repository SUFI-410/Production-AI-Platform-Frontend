import { useMutation } from "@tanstack/react-query";

import { sendMessage } from "@/api/chat/chat";

export function useChat() {
  return useMutation({
    mutationFn: sendMessage,
    retry: false,
  });
}
