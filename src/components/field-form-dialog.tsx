import { useEffect } from "react"
import { useForm, useWatch, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FieldTypeEnum, type Field as SchemaField } from "@/types/schema.types"

// id is assigned by the caller (uuid on create, preserved on edit) — the
// form itself only deals with the editable attributes
const FieldFormSchema = z.object({
  name: z.string().min(1, "Field name is required"),
  type: FieldTypeEnum,
  isPrimaryKey: z.boolean(),
  isUnique: z.boolean(),
  isNullable: z.boolean(),
})
type FieldFormValues = z.infer<typeof FieldFormSchema>

const DEFAULT_VALUES: FieldFormValues = {
  name: "",
  type: "VARCHAR",
  isPrimaryKey: false,
  isUnique: false,
  isNullable: true,
}

type FieldFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "add" | "edit"
  initialField?: SchemaField
  onSubmit: (values: FieldFormValues) => void
}

export function FieldFormDialog({
  open,
  onOpenChange,
  mode,
  initialField,
  onSubmit,
}: FieldFormDialogProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FieldFormValues>({
    resolver: zodResolver(FieldFormSchema),
    defaultValues: DEFAULT_VALUES,
  })

  const isPrimaryKey = useWatch({ control, name: "isPrimaryKey" })

  // Reset to the field being edited (or blank defaults for "add") each
  // time the dialog opens, rather than carrying over stale form state
  useEffect(() => {
    if (open) {
      reset(initialField ?? DEFAULT_VALUES)
    }
  }, [open, initialField, reset])

  function submit(values: FieldFormValues) {
    // A primary key can't meaningfully be nullable — enforce that
    // relationship here rather than trusting the checkboxes to agree
    onSubmit({
      ...values,
      isNullable: values.isPrimaryKey ? false : values.isNullable,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Add field" : "Edit field"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="space-y-4">
          <Field>
            <FieldLabel htmlFor="field-name">Name</FieldLabel>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input id="field-name" autoFocus {...field} />
              )}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="field-type">Type</FieldLabel>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="field-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FieldTypeEnum.options.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>

          <div className="flex flex-col gap-2">
            <Controller
              name="isPrimaryKey"
              control={control}
              render={({ field }) => (
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  Primary key
                </label>
              )}
            />
            <Controller
              name="isUnique"
              control={control}
              render={({ field }) => (
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  Unique
                </label>
              )}
            />
            <Controller
              name="isNullable"
              control={control}
              render={({ field }) => (
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isPrimaryKey}
                  />
                  Nullable
                </label>
              )}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">{mode === "add" ? "Add" : "Save"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
