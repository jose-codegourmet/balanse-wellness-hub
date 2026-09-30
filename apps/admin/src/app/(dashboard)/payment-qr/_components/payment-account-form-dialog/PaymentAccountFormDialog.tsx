"use client";

import { PAYMENT_ACCOUNT_TYPE_META, PAYMENT_ACCOUNT_TYPES } from "@balanse/domain";
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@balanse/ui";
import { useUpsertPaymentQr } from "@/lib/query/mutations";
import {
  AdminForm,
  FormActions,
  FormField,
  useAdminFormContext,
} from "@/modules/admin/forms/admin-form/AdminForm";
import {
  BooleanBinding,
  ChoiceBinding,
  ImageBinding,
  PhPhoneBinding,
  TextBinding,
} from "@/modules/admin/forms/bindings";
import { notify } from "@/modules/notifications/notify";
import {
  paymentAccountFormDefaultValues,
  paymentAccountFormValuesFrom,
} from "./PaymentAccountFormDialog.defaults";
import type { PaymentAccountFormDialogProps } from "./PaymentAccountFormDialog.meta";
import {
  type PaymentAccountFormValues,
  paymentAccountFormSchema,
} from "./PaymentAccountFormDialog.schema";

const FORM_ID = "payment-account-form";

export function PaymentAccountFormDialog({
  open,
  onOpenChange,
  account,
}: PaymentAccountFormDialogProps) {
  const upsert = useUpsertPaymentQr();
  const editing = Boolean(account);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? `Edit ${account?.label}` : "Add payment account"}</DialogTitle>
          <DialogDescription>
            Customers pay to the accounts you show at checkout. Upload the QR so they can scan, and
            add the name and number so they can check they are paying the studio.
          </DialogDescription>
        </DialogHeader>
        <AdminForm
          id={FORM_ID}
          key={account?.id ?? "new"}
          schema={paymentAccountFormSchema}
          defaultValues={
            account ? paymentAccountFormValuesFrom(account) : paymentAccountFormDefaultValues
          }
          onSubmit={async (values: PaymentAccountFormValues) => {
            try {
              await upsert.mutateAsync({ id: account?.id, ...values });
              notify.admin("payment-account.saved");
              onOpenChange(false);
            } catch (error) {
              notify.admin("payment-account.save-failed");
              throw error;
            }
          }}
        >
          <FormField name="type" label="Type">
            {(field) => (
              <ChoiceBinding
                {...field}
                as="radio"
                options={PAYMENT_ACCOUNT_TYPES.map((type) => ({
                  value: type,
                  label: PAYMENT_ACCOUNT_TYPE_META[type].label,
                }))}
              />
            )}
          </FormField>
          <TypeFields />
          <FormField
            name="isActive"
            label="Show to customers"
            orientation="horizontal"
            description="Shown accounts appear at checkout. Hide one to keep it here without customers seeing it."
          >
            {(field) => <BooleanBinding {...field} as="switch" />}
          </FormField>
          <FormActions
            formId={FORM_ID}
            submitLabel={editing ? "Save account" : "Add account"}
            sticky={false}
          >
            <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
          </FormActions>
        </AdminForm>
      </DialogContent>
    </Dialog>
  );
}

/** Labels, number input, and QR requirement follow the selected type. */
function TypeFields() {
  const { watch } = useAdminFormContext<PaymentAccountFormValues>();
  const type = watch("type");
  const meta = PAYMENT_ACCOUNT_TYPE_META[type];
  return (
    <>
      <p className="-mt-2 text-sm text-muted-foreground">{meta.hint}</p>
      <FormField
        name="label"
        label="Name"
        required
        maxLength={80}
        description="A short name staff and customers recognise."
      >
        {(field) => <TextBinding {...field} placeholder={`Studio ${meta.label}`} />}
      </FormField>
      <FormField name="accountName" label="Account holder name" required maxLength={80}>
        {(field) => <TextBinding {...field} placeholder="As it appears in the app" />}
      </FormField>
      <FormField
        name="accountNumber"
        label={meta.numberLabel}
        required={meta.mobileNumber}
        optional={!meta.mobileNumber}
      >
        {(field) =>
          meta.mobileNumber ? (
            <PhPhoneBinding {...field} />
          ) : (
            <TextBinding {...field} inputMode="numeric" placeholder={meta.numberPlaceholder} />
          )
        }
      </FormField>
      <FormField
        name="imageKey"
        label="QR code"
        required={meta.qrRequired}
        optional={!meta.qrRequired}
        wireAria
      >
        {(field) => (
          <ImageBinding
            {...field}
            label="Upload QR"
            fallbackLabel={`${meta.label} QR`}
            previewName={`${meta.label} QR code`}
          />
        )}
      </FormField>
    </>
  );
}
