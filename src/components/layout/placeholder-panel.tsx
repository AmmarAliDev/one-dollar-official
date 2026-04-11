import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type PlaceholderPanelProps = {
  eyebrow: string;
  title: string;
  description: string;
  items: string[];
};

export function PlaceholderPanel({ eyebrow, title, description, items }: PlaceholderPanelProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <p className="text-primary text-xs font-semibold tracking-[0.2em] uppercase">{eyebrow}</p>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="text-muted-foreground space-y-2 text-sm">
          {items.map((item) => (
            <li key={item} className="border-border/80 rounded-md border border-dashed px-3 py-2">
              {item}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
