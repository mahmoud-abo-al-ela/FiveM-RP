"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

export function ActivationForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    characterName: "",
    age: "",
    steamOrEpicLink: "",
    rpExperience: "",
    agreeToRules: false,
    agreeToTerms: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const response = await fetch("/api/auth/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server error: Invalid response format");
      }

      const data = await response.json();

      if (!response.ok) {
        if (data.details) {
          const errorMap: Record<string, string> = {};
          data.details.forEach((err: { field: string; message: string }) => {
            errorMap[err.field] = err.message;
          });
          setErrors(errorMap);
          
          toast({
            title: "Validation Error",
            description: "Please check the form for errors.",
            variant: "destructive",
          });
        } else {
          throw new Error(data.error || "Failed to activate account");
        }
        return;
      }

      toast({
        title: "Activation Request Submitted!",
        description: "Your request is being reviewed by staff. You'll be notified via Discord.",
      });

      router.push("/auth/pending?status=pending");
    } catch (error) {
      toast({
        title: "Activation Failed",
        description: error instanceof Error ? error.message : "There was an error activating your account.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const isFormValid =
    formData.characterName &&
    formData.age &&
    formData.steamOrEpicLink &&
    formData.rpExperience &&
    formData.agreeToRules &&
    formData.agreeToTerms;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="characterName">
          Character Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="characterName"
          name="characterName"
          type="text"
          placeholder="FirstName LastName"
          value={formData.characterName}
          onChange={handleChange}
          required
          className="bg-background/50"
        />
        {errors.characterName && (
          <p className="text-xs text-destructive">{errors.characterName}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Your main character name (e.g., John Smith)
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="age">
          Age <span className="text-destructive">*</span>
        </Label>
        <Input
          id="age"
          name="age"
          type="number"
          placeholder="18"
          min="13"
          max="100"
          value={formData.age}
          onChange={handleChange}
          required
          className="bg-background/50"
        />
        {errors.age && <p className="text-xs text-destructive">{errors.age}</p>}
        <p className="text-xs text-muted-foreground">
          You must be at least 13 years old
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="steamOrEpicLink">
          Steam or Epic Profile Link <span className="text-destructive">*</span>
        </Label>
        <Input
          id="steamOrEpicLink"
          name="steamOrEpicLink"
          type="url"
          placeholder="https://steamcommunity.com/id/yourprofile or Epic profile link"
          value={formData.steamOrEpicLink}
          onChange={handleChange}
          required
          className="bg-background/50"
        />
        {errors.steamOrEpicLink && (
          <p className="text-xs text-destructive">{errors.steamOrEpicLink}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Your Steam or Epic Games profile link for verification
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="rpExperience">
          Roleplay Experience <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="rpExperience"
          name="rpExperience"
          placeholder="Tell us about your roleplay experience..."
          value={formData.rpExperience}
          onChange={handleChange}
          required
          rows={4}
          className="bg-background/50 resize-none"
        />
        {errors.rpExperience && (
          <p className="text-xs text-destructive">{errors.rpExperience}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Briefly describe your RP experience (minimum 30 characters)
        </p>
      </div>

      <div className="space-y-4 pt-4 border-t border-white/5">
        <div className="flex items-start space-x-3">
          <Checkbox
            id="agreeToRules"
            checked={formData.agreeToRules}
            onCheckedChange={(checked) =>
              handleCheckboxChange("agreeToRules", checked as boolean)
            }
          />
          <div className="space-y-1 leading-none">
            <Label
              htmlFor="agreeToRules"
              className="text-sm font-normal cursor-pointer"
            >
              I have read and agree to follow the{" "}
              <a
                href="/rules"
                target="_blank"
                className="text-primary hover:underline"
              >
                Server Rules
              </a>{" "}
              <span className="text-destructive">*</span>
            </Label>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <Checkbox
            id="agreeToTerms"
            checked={formData.agreeToTerms}
            onCheckedChange={(checked) =>
              handleCheckboxChange("agreeToTerms", checked as boolean)
            }
          />
          <div className="space-y-1 leading-none">
            <Label
              htmlFor="agreeToTerms"
              className="text-sm font-normal cursor-pointer"
            >
              I agree to the Terms of Service and Privacy Policy{" "}
              <span className="text-destructive">*</span>
            </Label>
          </div>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={loading || !isFormValid}
      >
        {loading ? "Activating Account..." : "Activate Account"}
      </Button>
    </form>
  );
}
