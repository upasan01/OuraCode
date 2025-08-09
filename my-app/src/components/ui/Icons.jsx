import { Copy, Sparkles, WandSparkles, SendHorizontal, X, Loader2, ArrowUp } from "lucide-react";

// Icon components for consistent usage across the app
export const CopyIcon = ({ className = "w-5 h-5" }) => <Copy className={className} />;

export const SparklesIcon = ({ className = "w-6 h-6" }) => <Sparkles className={className} />;

export const EnhanceIcon = ({ className = "w-6 h-6" }) => <WandSparkles className={className} />;

export const SendIcon = ({ className = "w-6 h-6" }) => <ArrowUp className={className} />;

export const CloseIcon = ({ className = "w-6 h-6" }) => <X className={className} />;

export const LoadingIcon = ({ className = "w-5 h-5" }) => (
  <Loader2 className={`animate-spin text-white ${className}`} />
);


