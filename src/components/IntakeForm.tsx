import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FileText, User, Briefcase, Upload, Phone, Mail, Globe } from "lucide-react";

interface IntakeFormProps {
  orderId: string;
  submissionToken?: string;
  onBack?: () => void;
}

export const IntakeForm = ({ orderId, submissionToken, onBack }: IntakeFormProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    linkedin: "",
    resume: null as File | null,
    jobDescription: "",
    additionalInfo: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF, DOC, or DOCX file.",
          variant: "destructive"
        });
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 5MB.",
          variant: "destructive"
        });
        return;
      }
      
      setFormData(prev => ({ ...prev, resume: file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.firstName.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter your first name.",
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.lastName.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter your last name.",
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.email.trim()) {
      toast({
        title: "Missing information", 
        description: "Please enter your email address.",
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.linkedin.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter your LinkedIn profile URL.",
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.jobDescription.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide the job description.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Submitting intake form for order:', orderId);
      
      // Upload resume if provided
      let resumeUrl = null;
      if (formData.resume) {
        const fileExt = formData.resume.name.split('.').pop();
        const fileName = `${orderId}-resume-${Date.now()}.${fileExt}`;
        
        console.log('Uploading resume:', fileName);
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('resumes')
          .upload(fileName, formData.resume);

        if (uploadError) {
          console.error('Resume upload error:', uploadError);
          throw new Error(`Failed to upload resume: ${uploadError.message}`);
        }
        
        resumeUrl = uploadData.path;
        console.log('Resume uploaded successfully:', resumeUrl);
      }

      // Insert intake form data
      const intakeData = {
        order_id: orderId,
        submission_token: submissionToken === undefined ? null : submissionToken,
        name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        linkedin: formData.linkedin.trim(),
        resume_url: resumeUrl,
        job_url: null,
        job_description: formData.jobDescription.trim(),
        additional_info: formData.additionalInfo.trim() || null
      };

      console.log('Inserting intake form data:', {
        ...intakeData,
        orderId,
        submissionTokenFromUrl: submissionToken,
        tokenIsUndefined: submissionToken === undefined,
        tokenIsNull: submissionToken === null
      });

      const { error: insertError } = await supabase
        .from('intake_forms')
        .insert(intakeData);

      if (insertError) {
        console.error('Form submission error:', insertError);
        throw new Error(`Failed to submit form: ${insertError.message}`);
      }

      console.log('Intake form submitted successfully');

      // Send notification emails
      try {
        console.log('Sending intake notifications...');
        const { error: emailError } = await supabase.functions.invoke('send-intake-notifications', {
          body: { 
            orderId, 
            formData: {
              name: `${formData.firstName} ${formData.lastName}`,
              email: formData.email,
              phone: formData.phone,
              linkedin: formData.linkedin,
              job_description: formData.jobDescription,
              job_url: null,
              additional_info: formData.additionalInfo,
              resumeUrl
            }
          }
        });

        if (emailError) {
          console.error('Email notification error:', emailError);
          // Don't fail the whole process if email fails
        } else {
          console.log('Intake notifications sent successfully');
        }
      } catch (emailError) {
        console.error('Error sending notifications:', emailError);
        // Continue even if email fails
      }

      toast({
        title: "Success!",
        description: "Your intake form has been submitted. You'll receive your custom interview questions within 24 hours.",
      });

      // Navigate to thank you page
      navigate('/thank-you');

    } catch (error) {
      console.error('Error submitting form:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast({
        title: "Submission Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="shadow-medium">
      <CardHeader>
        <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
          <FileText className="w-6 h-6 text-primary" />
          Complete Your Intake Form
        </CardTitle>
        <p className="text-muted-foreground text-center">
          Please provide your details so I can create your personalized interview questions
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <User className="w-5 h-5 text-primary" />
              Personal Information
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Enter your first name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Enter your last name"
                  required
                />
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
                  placeholder="your.email@example.com"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="linkedin" className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  LinkedIn Profile URL *
                </Label>
                <Input
                  id="linkedin"
                  type="url"
                  value={formData.linkedin}
                  onChange={(e) => handleInputChange('linkedin', e.target.value)}
                  placeholder="https://linkedin.com/in/yourprofile"
                  required
                />
              </div>
            </div>
          </div>

          {/* Resume Upload */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Upload className="w-5 h-5 text-primary" />
              Resume/CV
            </div>
            
            <div>
              <Label htmlFor="resume">Upload Your Resume (Optional) - PDF, DOC, DOCX - Max 5MB</Label>
              <Input
                id="resume"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
              {formData.resume && (
                <p className="text-sm text-success mt-1 flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  Selected: {formData.resume.name}
                </p>
              )}
            </div>
          </div>

          {/* Job Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Briefcase className="w-5 h-5 text-primary" />
              Job Information
            </div>
            
            <div>
              <Label htmlFor="jobDescription">
                Job Description * (copy and paste job posting link or the entire job description)
              </Label>
              <Textarea
                id="jobDescription"
                value={formData.jobDescription}
                onChange={(e) => handleInputChange('jobDescription', e.target.value)}
                placeholder="Paste the complete job description or job posting link here..."
                className="min-h-[150px]"
                required
              />
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="additionalInfo">Additional Information (Optional)</Label>
              <Textarea
                id="additionalInfo"
                value={formData.additionalInfo}
                onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                placeholder="Any specific areas you'd like me to focus on, company information, or other relevant details..."
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
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting...
              </>
            ) : (
              "Submit Intake Form"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};