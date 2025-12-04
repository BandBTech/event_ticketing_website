"use client";

import { SubmitHandler, useForm } from "react-hook-form";
import { useState } from "react";
import{toast} from "sonner";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const createContactSchema =(t:(key: string, fallback?:string)=> string) =>
    z.object({
      name: z.string().min(1, t('contact.validation.nameRequired')),
      email: z.string()
      .min(1, t('contact.validation.emailRequired'))
      .email(t('contact.validation.emailInvalid')),
      message: z.string().min(1,t('contact.validation.messageRequired'))
    });

export default function ContactPage() {
    const [selectedCategory, setSelectedCategory] = useState("");
    const { locale } = useLanguageStore();
    const { t } = useTranslation(locale);

const contactSchema = createContactSchema(t);
type ContactFormData = z.infer<typeof contactSchema>;
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    mode: "onBlur",
  });



  const onSubmit:SubmitHandler<ContactFormData> = async (data) => {
   try {
      // TODO: Submit to backend API
      console.log({ ...data, category: selectedCategory });

      // Show success toast
      toast.success(t('contact.toast.success'));

      reset();
      setSelectedCategory("");
    } catch (error) {
      // Show error toast
      toast.error(t('contact.toast.error'));
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <section className="max-w-4xl mx-auto px-4 py-20">

        <h1 className="text-4xl font-bold text-center mb-4 text-primary">
          {t('contact.title')}
        </h1>
        <p className="text-lg text-center opacity-85 mb-14">
          
          {t('contact.subtitle')}
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white p-8 rounded-2xl shadow-lg space-y-6"
        >
          {/* Full Name */}
          <div>
            <label className="block font-medium mb-1">{t('contact.form.fullName')}</label>
            <input
              {...register("name", { required: "Full name is required" })}
              className="w-full px-4 py-3 rounded-lg border focus:outline-none"
              placeholder={t('contact.form.placeholder.fullName')}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{String(errors.name.message)}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block font-medium mb-1">{t('contact.form.email')}</label>
            <input
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^\S+@\S+\.\S+$/,
                  message: "Invalid email",
                },
              })}
              className="w-full px-4 py-3 rounded-lg border focus:outline-none"
              placeholder={t('contact.form.placeholder.email')}
            />
            {errors.email && (

              <p className="text-red-500 text-sm mt-1">{String(errors.email.message)}</p>
            )}
          </div>

          {/* Support Category */}
          <div>
            <label className="block font-medium mb-1">{t('contact.support.title')}</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border focus:outline-none"
            >
              <option value="">{t('contact.support.option.selectIssue')}</option>
              <option>{t('contact.support.option.ticketBooking')} </option>
              <option>{t('contact.support.option.eventPublishing')} </option>
              <option>{t('contact.support.option.paymentsRefund')} </option>
              <option>{t('contact.support.option.technicalSupport')} </option>
              <option>{t('contact.support.option.partner')} </option>
            </select>
          </div>

          {/* Message */}
          <div>
            <label className="block font-medium mb-1">{t('contact.message.title')}</label>
            <textarea
              {...register("message", { required: "Message is required" })}
              rows={5}
              className="w-full px-4 py-3 rounded-lg border focus:outline-none"
              placeholder={t('contact.message.textarea')}
            />
            {errors.message && (
              <p className="text-red-500 text-sm mt-1">{String(errors.message.message)}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-white py-3 rounded-lg text-lg font-medium hover:opacity-90 transition"
          >
            {t('contact.button.sendMessage')}
          </button>
        </form>

      </section>
    </main>
  );
}
