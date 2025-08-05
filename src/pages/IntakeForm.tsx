import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, Globe, User, Phone, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const IntakeForm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const orderId = searchParams.get('order_id');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    linkedinProfile: '',
    jobDescriptionLink: '',
    jobDescriptionText: '',
    additionalInformation: ''
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId) {
      toast({
        title: "Error",
        description: "No order ID found. Please contact support.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let resumeFilePath = null;

      // Upload resume if provided
      if (resumeFile) {
        const fileExt = resumeFile.name.split('.').pop();
        const fileName = `${orderId}_resume.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('resumes')
          .upload(fileName, resumeFile);

        if (uploadError) {
          console.error('Resume upload error:', uploadError);
          toast({
            title: "Upload Error",
            description: "Failed to upload resume. Please try again.",
            variant: "destructive",
          });
          return;
        }
        
        resumeFilePath = fileName;
      }

      // Save intake form data using raw query since table isn't in types yet
      const { error: insertError } = await supabase
        .from('intake_forms' as any)
        .insert({
          order_id: orderId,
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone_number: formData.phoneNumber,
          linkedin_profile: formData.linkedinProfile,
          resume_file_path: resumeFilePath,
          job_description_link: formData.jobDescriptionLink,
          job_description_text: formData.jobDescriptionText,
          additional_information: formData.additionalInformation
        });

      if (insertError) {
        console.error('Form submission error:', insertError);
        toast({
          title: "Submission Error",
          description: "Failed to submit form. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Send notification emails
      await supabase.functions.invoke('send-intake-notifications', {
        body: { orderId, formData }
      });

      toast({
        title: "Form Submitted!",
        description: "Thank you for providing your information. You'll receive a confirmation email shortly.",
      });

      navigate('/thank-you');
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!orderId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              Invalid or missing order ID. Please check your email for the correct link.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-hero-bg py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className="shadow-medium">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-foreground">
              Complete Your Interview Prep Details
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Please provide the information below so I can create personalized interview questions for you.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Personal Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phoneNumber" className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone Number *
                  </Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="linkedinProfile" className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    LinkedIn Profile URL
                  </Label>
                  <Input
                    id="linkedinProfile"
                    type="url"
                    placeholder="https://linkedin.com/in/yourprofile"
                    value={formData.linkedinProfile}
                    onChange={(e) => handleInputChange('linkedinProfile', e.target.value)}
                  />
                </div>
              </div>

              {/* Resume Upload */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Upload className="w-5 h-5 text-primary" />
                  Resume Upload
                </h3>
                
                <div>
                  <Label htmlFor="resume">Upload Your Resume (PDF, DOC, or DOCX)</Label>
                  <Input
                    id="resume"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                  {resumeFile && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Selected: {resumeFile.name}
                    </p>
                  )}
                </div>
              </div>

              {/* Job Description */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Job Description
                </h3>
                
                <div>
                  <Label htmlFor="jobDescriptionLink">Job Posting URL</Label>
                  <Input
                    id="jobDescriptionLink"
                    type="url"
                    placeholder="https://company.com/job-posting"
                    value={formData.jobDescriptionLink}
                    onChange={(e) => handleInputChange('jobDescriptionLink', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="jobDescriptionText">
                    Or copy and paste the job description here
                  </Label>
                  <Textarea
                    id="jobDescriptionText"
                    rows={6}
                    placeholder="Paste the complete job description here..."
                    value={formData.jobDescriptionText}
                    onChange={(e) => handleInputChange('jobDescriptionText', e.target.value)}
                  />
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Additional Information
                </h3>
                
                <div>
                  <Label htmlFor="additionalInformation">
                    Any additional information you'd like to share?
                  </Label>
                  <Textarea
                    id="additionalInformation"
                    rows={4}
                    placeholder="Any specific concerns, company details, or other relevant information..."
                    value={formData.additionalInformation}
                    onChange={(e) => handleInputChange('additionalInformation', e.target.value)}
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
                size="lg"
              >
                {isSubmitting ? "Submitting..." : "Submit Information"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IntakeForm;