import type { UseFormRegister, FieldErrors } from "react-hook-form"

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { getBacktestTemplateParamError, type BacktestSetupFormValues } from "@/features/backtests/backtest-form.utils"
import type { BacktestTemplateItem } from "@/features/backtests/types"

type BacktestTemplateParameterFieldsProps = {
  errors: FieldErrors<BacktestSetupFormValues>
  register: UseFormRegister<BacktestSetupFormValues>
  template?: BacktestTemplateItem | null
}

export const BacktestTemplateParameterFields = ({
  errors,
  register,
  template,
}: BacktestTemplateParameterFieldsProps) => {
  if (!template) {
    return null
  }

  if (template.parameters.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/60 bg-background/30 px-4 py-3 text-sm text-muted-foreground">
        This strategy does not require additional parameters.
      </div>
    )
  }

  return (
    <FieldGroup>
      {template.parameters.map((parameter) => {
        const parameterError = getBacktestTemplateParamError(errors, parameter.name)

        return (
          <Field
            key={parameter.name}
            data-invalid={parameterError?.message ? true : undefined}
          >
            <FieldLabel htmlFor={`template-parameter-${parameter.name}`}>
              {parameter.name}
            </FieldLabel>
            <FieldContent>
              <Input
                id={`template-parameter-${parameter.name}`}
                type="number"
                min={parameter.min ?? undefined}
                step="1"
                aria-invalid={parameterError?.message ? true : undefined}
                {...register(`template_params.${parameter.name}`)}
              />
              <FieldDescription>
                {parameter.description ??
                  (parameter.min != null
                    ? `Minimum value: ${parameter.min}.`
                    : "Enter an integer value.")}
              </FieldDescription>
              <FieldError errors={parameterError ? [parameterError] : undefined} />
            </FieldContent>
          </Field>
        )
      })}
    </FieldGroup>
  )
}
