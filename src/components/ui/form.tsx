"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { Slot } from "@radix-ui/react-slot"
import {
  Controller,
  FormProvider,
  useFormContext,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

const Form = FormProvider

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  name: TName
}

const FormFieldContext = React.createContext<FormFieldContextValue | null>(null)

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState, formState } = useFormContext()

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>")
  }

  if (!itemContext) {
    throw new Error("useFormField should be used within <FormItem>")
  }

  const fieldState = getFieldState(fieldContext.name, formState)

  const { id } = itemContext

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}

type FormItemContextValue = {
  id: string
}

const FormItemContext = React.createContext<FormItemContextValue | null>(null)

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const id = React.useId()

  return (
    <FormItemContext.Provider value={{ id }}>
      <div ref={ref} className={cn("space-y-2", className)} {...props} />
    </FormItemContext.Provider>
  )
})
FormItem.displayName = "FormItem"

const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField()

  return (
    <Label
      ref={ref}
      className={cn(error && "text-destructive", className)}
      htmlFor={formItemId}
      {...props}
    />
  )
})
FormLabel.displayName = "FormLabel"

const FormControl = React.forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  )
})
FormControl.displayName = "FormControl"

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField()

  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={cn("text-xs text-muted-foreground", className)}
      {...props}
    />
  )
})
FormDescription.displayName = "FormDescription"

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField()
  const body = error ? String(error?.message ?? "") : children

  if (!body) {
    return null
  }

  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn("text-xs font-medium text-destructive", className)}
      {...props}
    >
      {body}
    </p>
  )
})
FormMessage.displayName = "FormMessage"

/**
 * TranslatedFormMessage - Displays form error messages with dynamic translation
 */
interface TranslatedFormMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {
  t: (key: string, fallback?: string, params?: Record<string, string | number>) => string
  fallback?: string
}

const parseMessageWithParams = (message: string): { key: string; params: Record<string, string> } => {
  const pipeIndex = message.indexOf('|')
  if (pipeIndex === -1) {
    return { key: message, params: {} }
  }

  const key = message.substring(0, pipeIndex)
  const paramsString = message.substring(pipeIndex + 1)
  const params: Record<string, string> = {}

  paramsString.split(',').forEach(pair => {
    const colonIndex = pair.indexOf(':')
    if (colonIndex !== -1) {
      const paramKey = pair.substring(0, colonIndex).trim()
      const paramValue = pair.substring(colonIndex + 1).trim()
      params[paramKey] = paramValue
    }
  })

  return { key, params }
}

const substitutePlaceholders = (text: string, params: Record<string, string>): string => {
  let result = text
  Object.entries(params).forEach(([key, value]) => {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value)
  })
  return result
}

const TranslatedFormMessage = React.forwardRef<
  HTMLParagraphElement,
  TranslatedFormMessageProps
>(({ className, t, fallback, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField()

  if (!error && !children) {
    return null
  }

  let body: React.ReactNode
  if (error?.message) {
    const rawMessage = String(error.message)

    if (rawMessage.includes('.')) {
      const { key, params } = parseMessageWithParams(rawMessage)
      const translatedParams: Record<string, string> = {}

      Object.entries(params).forEach(([paramKey, paramValue]) => {
        if (paramValue.includes(':')) {
          const colonIndex = paramValue.indexOf(':')
          const translationKey = paramValue.substring(0, colonIndex)
          const fallbackValue = paramValue.substring(colonIndex + 1)
          translatedParams[paramKey] = t(translationKey, fallbackValue)
        } else if (paramValue.includes('.')) {
          translatedParams[paramKey] = t(paramValue, paramValue)
        } else {
          translatedParams[paramKey] = paramValue
        }
      })

      let translated = t(key, fallback || key)
      if (Object.keys(translatedParams).length > 0) {
        translated = substitutePlaceholders(translated, translatedParams)
      }
      body = translated
    } else {
      body = rawMessage
    }
  } else {
    body = children
  }

  if (!body) {
    return null
  }

  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn("text-xs font-medium text-destructive", className)}
      {...props}
    >
      {body}
    </p>
  )
})
TranslatedFormMessage.displayName = "TranslatedFormMessage"

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  TranslatedFormMessage,
  FormField,
}
