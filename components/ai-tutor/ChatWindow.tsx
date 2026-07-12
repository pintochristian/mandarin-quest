"use client";

import { useState } from "react";
import { Mic, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSpeechRecognition } from "@/lib/speech/useSpeechRecognition";
import { cn } from "@/lib/utils";

type Message = { role: "user" | "assistant"; content: string };

export function ChatWindow({
  lessonId,
  openingPrompt,
}: {
  lessonId?: string;
  openingPrompt: string;
}) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [unavailable, setUnavailable] = useState<string | null>(null);
  const [isMock, setIsMock] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const { isListening, transcript, start, stop } = useSpeechRecognition();

  if (micOn && transcript && !isListening) {
    // Fill the input from voice; the learner can review/edit before sending.
    if (input !== transcript) setInput(transcript);
  }

  async function send(text: string) {
    if (!text.trim() || sending) return;
    setSending(true);
    setMessages((m) => [...m, { role: "user", content: text }]);
    setInput("");

    try {
      const res = await fetch("/api/ai-tutor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, lessonId, message: text }),
      });
      const data = await res.json();

      if (!res.ok) {
        setUnavailable(data.error ?? "The AI tutor isn't available right now.");
        if (data.sessionId) setSessionId(data.sessionId);
        return;
      }
      setSessionId(data.sessionId);
      setIsMock(Boolean(data.isMock));
      setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
    } catch {
      setUnavailable("The AI tutor isn't available right now.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex w-full max-w-lg flex-col gap-3">
      {isMock && (
        <Badge variant="secondary" className="self-center text-[11px]">
          Development preview — mock AI tutor, not a real model
        </Badge>
      )}
      <Card className="flex max-h-80 min-h-40 flex-col gap-2 overflow-y-auto rounded-3xl p-4">
        {messages.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">{openingPrompt}</p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={cn(
              "max-w-[80%] rounded-2xl px-3 py-2 text-sm",
              m.role === "user"
                ? "self-end bg-primary text-primary-foreground"
                : "font-zh self-start bg-secondary text-secondary-foreground",
            )}
          >
            {m.content}
          </div>
        ))}
        {unavailable && (
          <p className="text-center text-xs text-muted-foreground">{unavailable}</p>
        )}
      </Card>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant={micOn ? "default" : "secondary"}
          size="icon"
          className="shrink-0 rounded-full"
          onClick={() => {
            if (micOn) {
              stop();
              setMicOn(false);
            } else {
              setMicOn(true);
              start();
            }
          }}
          aria-label="Toggle voice input"
        >
          <Mic className="size-4" />
        </Button>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(input)}
          placeholder="Type in Mandarin or English..."
          className="rounded-full"
          disabled={sending}
        />
        <Button
          type="button"
          size="icon"
          className="shrink-0 rounded-full"
          disabled={sending || !input.trim()}
          onClick={() => send(input)}
          aria-label="Send"
        >
          <Send className="size-4" />
        </Button>
      </div>
    </div>
  );
}
