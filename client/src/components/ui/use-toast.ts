import { useToast as useToastHook } from "@/hooks/use-toast";

export { useToast } from "@/hooks/use-toast";
export type { Toast } from "@/hooks/use-toast";

// This file is a re-export of the hook to maintain the import path structure
// Some components are importing from @/components/ui/use-toast while the actual implementation
// is in @/hooks/use-toast