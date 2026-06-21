import { useExample } from "../hooks/useExample";
import { SubmitButton } from "@/components/common/SubmitButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ExampleView() {
  const { examples, loading, error, createExample } = useExample();

  const handleCreate = () => {
    createExample({
      name: `Example ${Date.now()}`,
      description: "Created from the frontend",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-semibold">Examples</h2>
        <SubmitButton onClick={handleCreate} loading={loading}>
          Create Example
        </SubmitButton>
      </div>

      {loading && <p className="text-muted-foreground">Loading...</p>}
      {error && <p className="text-destructive text-sm">{error}</p>}

      <div className="grid gap-4">
        {examples.map((e) => (
          <Card key={e.id}>
            <CardHeader>
              <CardTitle className="text-base">{e.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">{e.description}</p>
              <div className="mt-3 flex gap-2">
                <Button variant="outline" size="sm">
                  Edit
                </Button>
                <Button variant="destructive" size="sm">
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
