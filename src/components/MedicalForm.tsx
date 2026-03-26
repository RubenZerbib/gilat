"use client";

import React, { useState, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formSchema, type FormData } from "@/lib/validation";
import { MEDICAL_QUESTIONS } from "@/config/pdf-mapping";
import StepIndicator from "./StepIndicator";
import YesNoToggle from "./YesNoToggle";
import SignatureCanvas from "./SignatureCanvas";

const STEP_LABELS = ["פרטים אישיים", "שאלון רפואי", "חתימה סופית"];

export default function MedicalForm() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      idNumber: "",
      medicalAnswers: {},
      medications: "",
      allergies: "",
      additionalNotes: "",
      signature: "",
    },
  });

  const handleNext = useCallback(async () => {
    let isValid = false;

    if (step === 1) {
      isValid = await trigger(["fullName", "idNumber"]);
    } else if (step === 2) {
      isValid = await trigger(["medicalAnswers"]);
    }

    if (isValid) {
      setStep((s) => Math.min(s + 1, 3));
    }
  }, [step, trigger]);

  const handleBack = useCallback(() => {
    setStep((s) => Math.max(s - 1, 1));
  }, []);

  const onSubmit = useCallback(
    async (data: FormData) => {
      setIsSubmitting(true);
      setSubmitError(null);

      try {
        const res = await fetch("/api/forms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const result = await res.json();

        if (!res.ok) {
          throw new Error(result.error || "שגיאה בשליחת הטופס");
        }

        setSubmitSuccess(true);
      } catch (err) {
        setSubmitError(
          err instanceof Error ? err.message : "שגיאה בשליחת הטופס"
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    []
  );

  if (submitSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">✓</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            הטופס נשלח בהצלחה!
          </h2>
          <p className="text-gray-600">
            תודה על מילוי הטופס. צוות המרפאה יצור איתך קשר בהקדם.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            טופס הסכמה לטיפול קוסמטי
          </h1>
          <p className="text-gray-500">אנא מלא/י את כל השדות הנדרשים</p>
        </div>

        <StepIndicator
          currentStep={step}
          totalSteps={3}
          labels={STEP_LABELS}
        />

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            {/* STEP 1: Personal Info */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  פרטים אישיים
                </h2>

                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-2">
                    שם מלא
                  </label>
                  <input
                    {...register("fullName")}
                    type="text"
                    placeholder="הכנס/י שם מלא"
                    className="w-full px-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    dir="rtl"
                  />
                  {errors.fullName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.fullName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-2">
                    תעודת זהות
                  </label>
                  <input
                    {...register("idNumber")}
                    type="text"
                    inputMode="numeric"
                    maxLength={9}
                    placeholder="123456789"
                    className="w-full px-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-left"
                    dir="ltr"
                  />
                  {errors.idNumber && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.idNumber.message}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* STEP 2: Medical Questions */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  שאלון רפואי
                </h2>

                <div className="space-y-1">
                  {MEDICAL_QUESTIONS.map((q) => (
                    <Controller
                      key={q.id}
                      name={`medicalAnswers.${q.id}`}
                      control={control}
                      render={({ field }) => (
                        <YesNoToggle
                          label={q.label}
                          value={field.value as boolean | undefined}
                          onChange={field.onChange}
                        />
                      )}
                    />
                  ))}
                </div>

                {errors.medicalAnswers && (
                  <p className="text-red-500 text-sm">
                    {typeof errors.medicalAnswers.message === "string"
                      ? errors.medicalAnswers.message
                      : "יש לענות על כל השאלות"}
                  </p>
                )}

                <div className="pt-4 space-y-4">
                  <div>
                    <label className="block text-base font-semibold text-gray-700 mb-2">
                      תרופות שנלקחות באופן קבוע
                    </label>
                    <textarea
                      {...register("medications")}
                      rows={2}
                      placeholder="פרט/י תרופות..."
                      className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none"
                      dir="rtl"
                    />
                  </div>

                  <div>
                    <label className="block text-base font-semibold text-gray-700 mb-2">
                      אלרגיות
                    </label>
                    <textarea
                      {...register("allergies")}
                      rows={2}
                      placeholder="פרט/י אלרגיות..."
                      className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none"
                      dir="rtl"
                    />
                  </div>

                  <div>
                    <label className="block text-base font-semibold text-gray-700 mb-2">
                      הערות נוספות
                    </label>
                    <textarea
                      {...register("additionalNotes")}
                      rows={2}
                      placeholder="הערות נוספות..."
                      className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none"
                      dir="rtl"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Signature */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  חתימה סופית
                </h2>

                <div className="bg-blue-50 rounded-xl p-4 mb-4">
                  <p className="text-sm text-blue-800 leading-relaxed">
                    אני מאשר/ת כי קראתי והבנתי את כל המידע הנ&quot;ל, ואני נותן/ת
                    את הסכמתי לביצוע הטיפול. אני מבין/ה את הסיכונים האפשריים
                    ומסכים/ה לתנאים המפורטים.
                  </p>
                </div>

                <Controller
                  name="signature"
                  control={control}
                  render={({ field }) => (
                    <SignatureCanvas
                      value={field.value}
                      onSignatureChange={field.onChange}
                    />
                  )}
                />
                {errors.signature && (
                  <p className="text-red-500 text-sm">
                    {errors.signature.message}
                  </p>
                )}
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-8 py-3 text-base font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  חזרה
                </button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-10 py-3 text-base font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                >
                  המשך
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-10 py-3 text-base font-bold text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "שולח..." : "שלח טופס"}
                </button>
              )}
            </div>

            {submitError && (
              <div className="mt-4 p-4 bg-red-50 rounded-xl text-red-700 text-sm">
                {submitError}
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
