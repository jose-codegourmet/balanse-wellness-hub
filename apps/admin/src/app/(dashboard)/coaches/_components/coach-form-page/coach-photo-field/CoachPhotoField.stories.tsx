import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AdminForm, FormField } from "@/modules/admin/forms/admin-form/AdminForm";
import { coachPublicFormDefaultValues } from "@/modules/admin/forms/coach/coach-form.defaults";
import { coachPublicFormSchema } from "@/modules/admin/forms/coach/coach-form.schema";
import { CoachPhotoField } from "./CoachPhotoField";
import "../coach-form-page.css";

const meta: Meta<typeof CoachPhotoField> = {
  title: "Admin/Components/Coach photo field",
  component: CoachPhotoField,
  render: () => (
    <AdminForm
      schema={coachPublicFormSchema}
      defaultValues={coachPublicFormDefaultValues}
      onSubmit={async () => {}}
    >
      <FormField name="photoKey" label="Coach portrait" wireAria>
        {(field) => <CoachPhotoField {...field} previewName="Maris Cabrera" />}
      </FormField>
    </AdminForm>
  ),
};
export default meta;
export const Default: StoryObj<typeof meta> = {};
