"use client";

import { SubmitHandler, useForm } from "react-hook-form";
import { useState } from "react";
import{toast} from "sonner";

export default function ContactPage() {
interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ContactFormData>();

  const [selectedCategory, setSelectedCategory] = useState("");

  const onSubmit:SubmitHandler<ContactFormData> = async (data) => {
   try {
      // TODO: Submit to backend API
      console.log({ ...data, category: selectedCategory });

      // Show success toast
      toast.success("Message sent successfully");

      reset();
      setSelectedCategory("");
    } catch (error) {
      // Show error toast
      toast.error("Something went wrong ! Please try again later.");
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <section className="max-w-4xl mx-auto px-4 py-20">

        <h1 className="text-4xl font-bold text-center mb-4 text-primary">
          Contact Us
        </h1>
        <p className="text-lg text-center opacity-85 mb-14">
          Let us know how we can support you.
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white p-8 rounded-2xl shadow-lg space-y-6"
        >
          {/* Full Name */}
          <div>
            <label className="block font-medium mb-1">Full Name</label>
            <input
              {...register("name", { required: "Full name is required" })}
              className="w-full px-4 py-3 rounded-lg border focus:outline-none"
              placeholder="Enter full name"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{String(errors.name.message)}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block font-medium mb-1">Email</label>
            <input
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^\S+@\S+\.\S+$/,
                  message: "Invalid email",
                },
              })}
              className="w-full px-4 py-3 rounded-lg border focus:outline-none"
              placeholder="example@email.com"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{String(errors.email.message)}</p>
            )}
          </div>

          {/* Support Category */}
          <div>
            <label className="block font-medium mb-1">Support Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border focus:outline-none"
            >
              <option value="">Select an issue</option>
              <option>Ticket Booking Issues </option>
              <option>Event Publishing </option>
              <option>Payments & Refunds </option>
              <option>Technical Support </option>
              <option>Partner / Business Inquiry </option>
            </select>
          </div>

          {/* Message */}
          <div>
            <label className="block font-medium mb-1">Message</label>
            <textarea
              {...register("message", { required: "Message is required" })}
              rows={5}
              className="w-full px-4 py-3 rounded-lg border focus:outline-none"
              placeholder="Write your message..."
            />
            {errors.message && (
              <p className="text-red-500 text-sm mt-1">{String(errors.message.message)}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-white py-3 rounded-lg text-lg font-medium hover:opacity-90 transition"
          >
            Send Message
          </button>
        </form>

      </section>
    </main>
  );
}
