import { AlertCircle } from "lucide-react";

import { getFormErrorMessages } from "@/lib/errors/error-messages";
import { cn } from "@/lib/utils";

import { Badge } from "./badge";
import { Card, CardContent } from "./card";

type FormErrorSummaryProps = {
  errors: unknown;
  title?: string;
  className?: string;
};

export function FormErrorSummary({
  errors,
  title = "Please fix the following",
  className,
}: FormErrorSummaryProps) {
  const messages = getFormErrorMessages(errors);

  if (messages.length === 0) {
    return null;
  }

  return (
    <Card className={cn("border-destructive/30 bg-destructive/5 shadow-none", className)} role="alert" aria-live="assertive">
      <CardContent className="flex flex-col gap-3 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="bg-destructive/10 text-destructive rounded-2xl p-2.5" aria-hidden="true">
            <AlertCircle className="size-4" />
          </div>
          <div className="space-y-2">
            <Badge variant="danger">Validation issues</Badge>
            <h3 className="text-sm font-semibold tracking-tight sm:text-base">{title}</h3>
          </div>
        </div>

        <ul className="space-y-1.5 pl-4 text-sm text-muted-foreground">
          {messages.map((message) => (
            <li key={message} className="list-disc">
              {message}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
