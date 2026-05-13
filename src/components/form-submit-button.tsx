"use client"

import type * as React from "react"
import { useFormStatus } from "react-dom"
import { Button, type ButtonProps } from "@/components/ui/button"

type FormSubmitButtonProps = Omit<ButtonProps, "isLoading"> & {
  pendingChildren?: React.ReactNode
}

export function FormSubmitButton({
  pendingChildren,
  disabled,
  type,
  children,
  ...props
}: FormSubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <Button
      {...props}
      type={type ?? "submit"}
      isLoading={pending && !pendingChildren}
      disabled={pending || disabled}
    >
      {pending && pendingChildren ? pendingChildren : children}
    </Button>
  )
}

