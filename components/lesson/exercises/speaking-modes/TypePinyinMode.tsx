"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { cn, normalizeAnswer } from "@/lib/utils";

export function TypePinyinMode({
  instructions,
  targetEnglish,
  acceptablePinyin,
  onAnswered,
}: {
  instructions: string;
  targetEnglish: string;
  acceptablePinyin: string[];
  onAnswered: (correct: boolean) => void;
}) {
  const [value, setValue] = useState("");
  const [checked, setChecked] = useState<boolean | null>(null);

  function check() {
    const isCorrect = acceptablePinyin
      .map(normalizeAnswer)
      .includes(normalizeAnswer(value));
    setChecked(isCorrect);
    onAnswered(isCorrect);
  }

  return (
    <div className="space-y-4">
      <p className="text-center text-sm font-medium text-muted-foreground">
        {instructions}
      </p>
      <Card className="rounded-2xl p-6 text-center">
        <p className="text-lg">{targetEnglish}</p>
      </Card>
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={checked !== null}
        placeholder="Type it in pinyin..."
        className="rounded-xl text-center text-lg"
        onKeyDown={(e) => e.key === "Enter" && value.trim() && check()}
      />
      {checked === null ? (
        <Button className="w-full rounded-full" disabled={!value.trim()} onClick={check}>
          Check
        </Button>
      ) : (
        <p
          className={cn(
            "text-center text-sm font-medium",
            checked ? "text-emerald-600" : "text-destructive",
          )}
        >
          {checked ? "Correct!" : `Close — try: ${acceptablePinyin[0]}`}
        </p>
      )}
    </div>
  );
}
