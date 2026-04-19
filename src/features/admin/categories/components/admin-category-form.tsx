"use client";

import Link from "next/link";

import { DynamicForm, type DynamicFormFieldConfig, useAppForm, useServerActionSubmit } from "@/components/forms";
import { Button, buttonVariants } from "@/components/ui/button";
import { routes } from "@/config/routes";

import { type CategoryCreateInput,categoryMutationSchema } from "../validation";

type AdminCategoryFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  returnTo: string;
  categoryId?: string;
  cancelHref?: string;
  initialValues?: Partial<CategoryCreateInput>;
};

type AdminCategoryFormValues = CategoryCreateInput;

const categoryFields: DynamicFormFieldConfig<AdminCategoryFormValues>[] = [
  {
    id: "category-name",
    name: "name",
    type: "text",
    label: "Name",
    placeholder: "Home Care",
    required: true,
  },
  {
    id: "category-slug",
    name: "slug",
    type: "text",
    label: "Slug",
    placeholder: "home-care",
    required: true,
  },
  {
    id: "category-description",
    name: "description",
    type: "textarea",
    label: "Description",
    placeholder: "Short summary shown in admin and listings.",
    rows: 4,
    controlClassName: "md:col-span-2",
    containerClassName: "md:col-span-2",
  },
  {
    id: "category-status",
    name: "status",
    type: "select",
    label: "Status",
    options: [
      { value: "DRAFT", label: "Draft" },
      { value: "PUBLISHED", label: "Published" },
      { value: "ARCHIVED", label: "Archived" },
    ],
    required: true,
  },
  {
    id: "category-seo-title",
    name: "seoTitle",
    type: "text",
    label: "SEO title",
    placeholder: "Shop Home Care Essentials",
  },
  {
    id: "category-seo-description",
    name: "seoDescription",
    type: "textarea",
    label: "SEO description",
    placeholder: "Search snippet summary for this category page.",
    rows: 3,
    containerClassName: "md:col-span-2",
  },
];

function buildCategoryFormData(values: AdminCategoryFormValues, input: { returnTo: string; categoryId?: string }) {
  const formData = new FormData();

  if (input.categoryId) {
    formData.set("id", input.categoryId);
  }

  formData.set("returnTo", input.returnTo);
  formData.set("name", values.name);
  formData.set("slug", values.slug);
  formData.set("description", values.description ?? "");
  formData.set("status", values.status);
  formData.set("seoTitle", values.seoTitle ?? "");
  formData.set("seoDescription", values.seoDescription ?? "");

  return formData;
}

export function AdminCategoryForm({
  action,
  submitLabel,
  returnTo,
  categoryId,
  cancelHref = routes.admin.categories,
  initialValues,
}: AdminCategoryFormProps) {
  const form = useAppForm<AdminCategoryFormValues>({
    schema: categoryMutationSchema,
    defaultValues: {
      name: initialValues?.name ?? "",
      slug: initialValues?.slug ?? "",
      description: initialValues?.description ?? "",
      status: initialValues?.status ?? "DRAFT",
      seoTitle: initialValues?.seoTitle ?? "",
      seoDescription: initialValues?.seoDescription ?? "",
    },
  });

  const { isPending, submitWithAction } = useServerActionSubmit(form);

  return (
    <DynamicForm
      form={form}
      fields={categoryFields}
      fieldsClassName="grid gap-4 md:grid-cols-2"
      formErrorTitle="Please review the category details"
      onSubmit={async (values) => {
        const submitTarget = categoryId ? { returnTo, categoryId } : { returnTo };
        await submitWithAction(action, buildCategoryFormData(values, submitTarget));
      }}
      actions={
        <div className="flex items-center gap-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : submitLabel}
          </Button>
          <Link href={cancelHref} className={buttonVariants({ variant: "ghost" })}>
            Back to categories
          </Link>
        </div>
      }
    />
  );
}
