import { Check, Circle } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";

interface PasswordRequirementsProps {
  password?: string;
}

export function PasswordRequirements({ password = "" }: PasswordRequirementsProps) {
  const hasUpperLower = /(?=.*[a-z])(?=.*[A-Z])/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  const requirements = [
    {
      label: "Must contain at least one uppercase and one lowercase letter",
      met: hasUpperLower,
    },
    {
      label: "Must contain at least one special character",
      met: hasSpecialChar,
    },
    {
      label: "Must contain at least one numeric digit",
      met: hasNumber,
    },
  ];

  return (
    <div className="space-y-2 mt-3">
      {requirements.map((req, index) => (
        <div key={index} className="flex items-center gap-2 text-xs">
          {req.met ? (
            <Check size={14} weight="bold" className="text-green-600 shrink-0" />
          ) : (
            <Circle size={14} weight="fill" className="text-gray-300 shrink-0" />
          )}
          <span
            className={cn(
              "transition-colors",
              req.met ? "text-green-600 font-medium" : "text-gray-500"
            )}
          >
            {req.label}
          </span>
        </div>
      ))}
    </div>
  );
}
