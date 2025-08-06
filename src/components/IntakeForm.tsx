import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FileText, User, Briefcase, ArrowLeft } from "lucide-react";

interface IntakeFormProps {
  orderId: string;
  onBack?: () => void;
}

export const IntakeForm = ({ orderId, onBack }: IntakeFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    linkedin: "",
    resume: null as File | null,
    jobUrl: "",
    jobDescription: "",
    additionalInfo: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, resume: file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Upload resume if provided
      let resumeUrl = null;
      if (formData.resume) {
        const fileExt = formData.resume.name.split('.').pop();
        const fileName = `${orderId}-resume.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('resumes')
          .upload(fileName, formData.resume);

        if (uploadError) throw uploadError;
        resumeUrl = uploadData.path;
      }

      // Insert form data into Supabase (table will be created after migration)
      const { error: insertError } = await supabase
        .from('intake_forms' as any)
        .insert({
          order_id: orderId,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          linkedin: formData.linkedin,
          resume_url: resumeUrl,
          job_url: formData.jobUrl,
          job_description: formData.jobDescription,
          additional_info: formData.additionalInfo
        });

      if (insertError) throw insertError;

      // Send notification emails
      await supabase.functions.invoke('send-intake-notifications', {
        body: {
          orderId,
          formData: {
            ...formData,
            resumeUrl
          }
        }
      });

      toast({
        title: "Success!",
        description: "Your intake form has been submitted. You'll receive your custom interview questions within 24 hours.",
      });

      // Reset form or redirect
      setFormData({
        name: "",
        email: "",
        phone: "",
        linkedin: "",
        resume: null,
        jobUrl: "",
        jobDescription: "",
        additionalInfo: ""
      });

    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: "Failed to submit form. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        {onBack && (
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to confirmation
          </Button>
        )}
        
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Complete Your Intake Form</CardTitle>
            <p className="text-muted-foreground text-center">
              Please provide your details so we can create your personalized interview questions
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <User className="w-5 h-5" />
                  Personal Information
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="linkedin">LinkedIn Profile URL</Label>
                    <Input
                      id="linkedin"
                      type="url"
                      value={formData.linkedin}
                      onChange={(e) => handleInputChange('linkedin', e.target.value)}
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                  </div>
                </div>
              </div>

              {/* Resume Upload */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <FileText className="w-5 h-5" />
                  Resume/CV
                </div>
                
                <div>
                  <Label htmlFor="resume">Upload Your Resume (PDF, DOC, DOCX)</Label>
                  <Input
                    id="resume"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                  {formData.resume && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Selected: {formData.resume.name}
                    </p>
                  )}
                </div>
              </div>

              {/* Job Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <Briefcase className="w-5 h-5" />
                  Job Information
                </div>
                
                <div>
                  <Label htmlFor="jobUrl">Job Posting URL</Label>
                  <Input
                    id="jobUrl"
                    type="url"
                    value={formData.jobUrl}
                    onChange={(e) => handleInputChange('jobUrl', e.target.value)}
                    placeholder="https://company.com/jobs/position"
                  />
                </div>
                
                <div>
                  <Label htmlFor="jobDescription">Job Description *</Label>
                  <Textarea
                    id="jobDescription"
                    value={formData.jobDescription}
                    onChange={(e) => handleInputChange('jobDescription', e.target.value)}
                    placeholder="Paste the complete job description here..."
                    className="min-h-[150px]"
                    required
                  />
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="additionalInfo">Additional Information</Label>
                  <Textarea
                    id="additionalInfo"
                    value={formData.additionalInfo}
                    onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                    placeholder="Any specific areas you'd like us to focus on, company information, or other relevant details..."
                    className="min-h-[100px]"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Intake Form"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};