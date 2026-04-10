import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type PlaceholderPanelProps = {
  eyebrow: string;
  title: string;
  description: string;
  items: string[];
};

export function PlaceholderPanel({
  eyebrow,
  title,
  description,
  items,
}: PlaceholderPanelProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          {eyebrow}
        </p>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {items.map((item) => (
            <li key={item} className="rounded-md border border-dashed border-border/80 px-3 py-2">
              {item}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
