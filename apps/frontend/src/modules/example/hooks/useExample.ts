import { useState, useEffect, useCallback } from "react";
import { ExampleApi, ExampleDTO } from "../services/exampleApi";

const api = new ExampleApi();

export function useExample() {
  const [examples, setExamples] = useState<ExampleDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExamples = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getAll();
      setExamples(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch examples");
    } finally {
      setLoading(false);
    }
  }, []);

  const createExample = useCallback(async (data: { name: string; description: string }) => {
    try {
      const created = await api.create(data);
      setExamples((prev) => [...prev, created]);
      return created;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create example");
      return null;
    }
  }, []);

  useEffect(() => {
    fetchExamples();
  }, [fetchExamples]);

  return { examples, loading, error, createExample, refetch: fetchExamples };
}
