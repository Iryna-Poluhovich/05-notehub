import { Formik, Form, Field, ErrorMessage } from "formik";
import type { FormikHelpers } from "formik";
import * as Yup from "yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createNote } from "../../services/noteService";
import styles from "./NoteForm.module.css";
import type { Note } from "../../types/note";

type NoteTag = Note["tag"];

interface NoteFormProps {
  onCancel: () => void;
}

interface NoteFormValues {
  title: string;
  content: string;
  tag: NoteTag | "";
}

const validationSchema = Yup.object({
  title: Yup.string()
    .min(3, "Minimum 3 characters")
    .max(50, "Maximum 50 characters")
    .required("Title is required"),
  content: Yup.string().max(500, "Maximum 500 characters"),
  tag: Yup.mixed<NoteTag>()
    .oneOf(["Todo", "Work", "Personal", "Meeting", "Shopping"], "Invalid tag")
    .required("Tag is required"),
});

export default function NoteForm({ onCancel }: NoteFormProps) {
  const initialValues: NoteFormValues = { title: "", content: "", tag: "" };

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (note: { title: string; content: string; tag: NoteTag }) =>
      createNote(note),
    onSuccess: () => {
      // після створення ноти інвалідовуємо кеш списку
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      onCancel();
    },
  });

  async function handleSubmit(
    values: NoteFormValues,
    helpers: FormikHelpers<NoteFormValues>
  ) {
    try {
      await mutation.mutateAsync({
        title: values.title.trim(),
        content: values.content.trim(),
        tag: values.tag as NoteTag,
      });
      helpers.resetForm();
    } finally {
      helpers.setSubmitting(false);
    }
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      validateOnBlur
      validateOnChange
      onSubmit={handleSubmit}
    >
      {({ isSubmitting, isValid, dirty }) => (
        <Form className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="title">Title</label>
            <Field id="title" type="text" name="title" className={styles.input} />
            <ErrorMessage name="title">
              {(msg) => <span className={styles.error}>{msg}</span>}
            </ErrorMessage>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="content">Content</label>
            <Field
              as="textarea"
              id="content"
              name="content"
              rows={8}
              className={styles.textarea}
            />
            <ErrorMessage name="content">
              {(msg) => <span className={styles.error}>{msg}</span>}
            </ErrorMessage>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="tag">Tag</label>
            <Field as="select" id="tag" name="tag" className={styles.select}>
              <option value="">Select tag…</option>
              <option value="Todo">Todo</option>
              <option value="Work">Work</option>
              <option value="Personal">Personal</option>
              <option value="Meeting">Meeting</option>
              <option value="Shopping">Shopping</option>
            </Field>
            <ErrorMessage name="tag">
              {(msg) => <span className={styles.error}>{msg}</span>}
            </ErrorMessage>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={!isValid || !dirty || isSubmitting}
            >
              {mutation.isPending ? "Creating..." : "Create note"}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
}