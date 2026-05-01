import { useState, type FormEvent } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

type AccessFormValues = {
  company: string
  email: string
  name: string
  useCase: string
}

type AccessFormErrors = Partial<Record<keyof AccessFormValues, string>>

const initialValues: AccessFormValues = {
  company: "",
  email: "",
  name: "",
  useCase: "",
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const validateAccessForm = (values: AccessFormValues): AccessFormErrors => {
  const errors: AccessFormErrors = {}

  if (!values.name.trim()) {
    errors.name = "Name is required."
  }

  if (!emailPattern.test(values.email.trim())) {
    errors.email = "Use a valid work email."
  }

  if (!values.useCase.trim()) {
    errors.useCase = "Tell us what you want Recap.ai to cover first."
  }

  return errors
}

export const LandingAccessForm = () => {
  const [values, setValues] = useState<AccessFormValues>(initialValues)
  const [errors, setErrors] = useState<AccessFormErrors>({})

  const handleValueChange = (field: keyof AccessFormValues, value: string) => {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }))
    setErrors((currentErrors) => ({
      ...currentErrors,
      [field]: undefined,
    }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nextErrors = validateAccessForm(values)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      toast("Check the highlighted fields before requesting access.")
      return
    }

    localStorage.setItem(
      "recap_early_access_request",
      JSON.stringify({
        ...values,
        requestedAt: new Date().toISOString(),
      }),
    )

    toast("Request access captured for this browser session.")
    setValues(initialValues)
  }

  return (
    <form className="mx-auto w-full max-w-xl text-left" onSubmit={handleSubmit}>
      <FieldGroup className="gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field data-invalid={Boolean(errors.name)}>
            <FieldLabel className="text-hero-heading" htmlFor="access-name">
              Name
            </FieldLabel>
            <Input
              aria-invalid={Boolean(errors.name)}
              autoComplete="name"
              className="h-11 rounded-full border-white/10 bg-white/[0.03] px-4 text-hero-heading placeholder:text-hero-sub/40"
              id="access-name"
              onChange={(event) => handleValueChange("name", event.target.value)}
              placeholder="Mara Whitfield"
              value={values.name}
            />
            <FieldError>{errors.name}</FieldError>
          </Field>

          <Field data-invalid={Boolean(errors.email)}>
            <FieldLabel className="text-hero-heading" htmlFor="access-email">
              Work email
            </FieldLabel>
            <Input
              aria-invalid={Boolean(errors.email)}
              autoComplete="email"
              className="h-11 rounded-full border-white/10 bg-white/[0.03] px-4 text-hero-heading placeholder:text-hero-sub/40"
              id="access-email"
              inputMode="email"
              onChange={(event) => handleValueChange("email", event.target.value)}
              placeholder="mara@fund.com"
              type="email"
              value={values.email}
            />
            <FieldError>{errors.email}</FieldError>
          </Field>
        </div>

        <Field>
          <FieldLabel className="text-hero-heading" htmlFor="access-company">
            Company or role
          </FieldLabel>
          <Input
            autoComplete="organization"
            className="h-11 rounded-full border-white/10 bg-white/[0.03] px-4 text-hero-heading placeholder:text-hero-sub/40"
            id="access-company"
            onChange={(event) => handleValueChange("company", event.target.value)}
            placeholder="Portfolio research lead"
            value={values.company}
          />
          <FieldDescription className="text-hero-sub/50">
            Optional, but helps us prioritize the right workflow.
          </FieldDescription>
        </Field>

        <Field data-invalid={Boolean(errors.useCase)}>
          <FieldLabel className="text-hero-heading" htmlFor="access-use-case">
            What should Recap.ai help you track?
          </FieldLabel>
          <Textarea
            aria-invalid={Boolean(errors.useCase)}
            className="min-h-28 resize-none rounded-3xl border-white/10 bg-white/[0.03] px-4 py-3 text-hero-heading placeholder:text-hero-sub/40"
            id="access-use-case"
            onChange={(event) => handleValueChange("useCase", event.target.value)}
            placeholder="Vietnam equities, recurring sector briefs, Super-Agent research plans..."
            value={values.useCase}
          />
          <FieldError>{errors.useCase}</FieldError>
        </Field>

        <Button className="h-12 w-full" type="submit" variant="hero">
          Request early access
        </Button>
      </FieldGroup>
    </form>
  )
}
