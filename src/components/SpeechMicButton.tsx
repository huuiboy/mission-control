"use client";

import { Mic, MicOff } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

type SpeechMicButtonProps = {
  onTranscript: (text: string) => void;
  className?: string;
  activeClassName?: string;
  inactiveClassName?: string;
  iconSize?: number;
  title?: string;
  ariaLabel?: string;
};

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: SpeechRecognitionResultListLike;
};

type SpeechRecognitionErrorEventLike = {
  error: string;
};

type SpeechRecognitionResultListLike = {
  length: number;
  [index: number]: SpeechRecognitionResultLike;
};

type SpeechRecognitionResultLike = {
  length: number;
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternativeLike;
};

type SpeechRecognitionAlternativeLike = {
  transcript: string;
  confidence: number;
};

declare global {
  interface Window {
    webkitSpeechRecognition?: SpeechRecognitionCtor;
    SpeechRecognition?: SpeechRecognitionCtor;
  }
}

function getSpeechRecognitionCtor() {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

export function SpeechMicButton({
  onTranscript,
  className,
  activeClassName,
  inactiveClassName,
  iconSize = 14,
  title = "Talk",
  ariaLabel = "Start voice input",
}: SpeechMicButtonProps) {
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  const baseClassName = useMemo(
    () =>
      `flex items-center justify-center rounded-lg transition-colors ${className ?? ""}`,
    [className]
  );

  useEffect(() => {
    setIsSupported(Boolean(getSpeechRecognitionCtor()));
  }, []);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  const startListening = () => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      setIsSupported(false);
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }

    const recognition = new Ctor();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = Array.from({ length: event.results.length - event.resultIndex }, (_, i) => {
        const result = event.results[event.resultIndex + i];
        return result[0]?.transcript ?? "";
      })
        .join(" ")
        .trim();

      if (transcript) {
        onTranscript(transcript);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.onerror = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    setIsListening(true);
    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
  };

  return (
    <button
      type="button"
      onClick={isListening ? stopListening : startListening}
      disabled={!isSupported}
      title={isSupported ? title : "Voice input is not supported in this browser"}
      aria-label={isSupported ? ariaLabel : "Voice input is not supported in this browser"}
      className={`${baseClassName} ${
        isListening
          ? activeClassName ?? "bg-ember-dim text-ember"
          : inactiveClassName ?? "text-text-muted hover:bg-raised-2 hover:text-text-primary"
      } disabled:cursor-not-allowed disabled:opacity-40`}
    >
      {isListening ? <MicOff size={iconSize} /> : <Mic size={iconSize} />}
    </button>
  );
}
