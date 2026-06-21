import { Loader2 } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";

interface SubmitButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
}

export function SubmitButton({
  loading = false,
  loadingText = "Loading...",
  children,
  disabled,
  ...props
}: SubmitButtonProps) {
  return (
    <Button disabled={disabled || loading} {...props}>
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {loading ? loadingText : children}
    </Button>
  );
}
