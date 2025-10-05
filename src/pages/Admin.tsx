import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Loader2, LogOut, Eye, Edit, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";

interface IntakeSubmission {
  id: string;
  order_id: string;
  name: string;
  email: string;
  phone?: string;
  linkedin?: string;
  job_description: string;
  additional_info?: string;
  resume_url?: string;
  job_url?: string;
  created_at: string;
}

interface Order {
  id: string;
  package_name: string;
  amount: number;
  customer_email: string;
  created_at: string;
  status: string;
}

const Admin = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [submissions, setSubmissions] = useState<(IntakeSubmission & { order: Order })[]>([]);
  const [user, setUser] = useState<any>(null);
  const [editingSubmission, setEditingSubmission] = useState<IntakeSubmission | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
    loadSubmissions();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        navigate("/auth");
        return;
      }
      
      if (!session?.user) {
        navigate("/auth");
        return;
      }
      
      setUser(session.user);

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (!session?.user) {
          navigate("/auth");
        }
      });

      return () => subscription.unsubscribe();
    } catch (error) {
      navigate("/auth");
    }
  };

  const loadSubmissions = async () => {
    setIsLoading(true);
    try {
      const { data: intakeData, error: intakeError } = await supabase
        .from("intake_forms")
        .select(`
          *,
          orders (*)
        `)
        .order("created_at", { ascending: false });

      if (intakeError) throw intakeError;

      // Transform the data to match our expected structure
      const formattedData = intakeData?.map(item => ({
        ...item,
        order: Array.isArray(item.orders) ? item.orders[0] : item.orders
      })) || [];

      setSubmissions(formattedData as any);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load submissions: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string | undefined, formatStr: string = "MMM dd, yyyy HH:mm") => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";
      return format(date, formatStr);
    } catch {
      return "Invalid Date";
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };

  const handleEdit = (submission: IntakeSubmission & { order: Order }) => {
    setEditingSubmission(submission);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingSubmission) return;

    try {
      const { error } = await supabase
        .from("intake_forms")
        .update({
          name: editingSubmission.name,
          email: editingSubmission.email,
          phone: editingSubmission.phone,
          linkedin: editingSubmission.linkedin,
          job_description: editingSubmission.job_description,
          additional_info: editingSubmission.additional_info,
          job_url: editingSubmission.job_url
        })
        .eq("id", editingSubmission.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Submission updated successfully",
      });

      setIsEditDialogOpen(false);
      setEditingSubmission(null);
      loadSubmissions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update submission: " + error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (submissionId: string) => {
    try {
      const { error } = await supabase
        .from("intake_forms")
        .delete()
        .eq("id", submissionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Submission deleted successfully",
      });

      loadSubmissions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete submission: " + error.message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {user?.email}
            </span>
            <Button variant="outline" onClick={() => navigate("/admin/settings")}>
              Settings
            </Button>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Intake Form Submissions
              <Badge variant="secondary">{submissions.length} total</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Package</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell>
                        {formatDate(submission.created_at)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{submission.name}</div>
                          <div className="text-sm text-muted-foreground">{submission.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{submission.order?.package_name}</TableCell>
                      <TableCell>{formatCurrency(submission.order?.amount || 0)}</TableCell>
                      <TableCell>
                        <Badge variant={submission.order?.status === 'completed' ? 'default' : 'secondary'}>
                          {submission.order?.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </Button>
                            </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Submission Details</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h3 className="font-semibold mb-2">Customer Information</h3>
                                  <div className="space-y-1">
                                    <p><strong>Name:</strong> {submission.name}</p>
                                    <p><strong>Email:</strong> {submission.email}</p>
                                    {submission.phone && (
                                      <p><strong>Phone:</strong> {submission.phone}</p>
                                    )}
                                    {submission.linkedin && (
                                      <p><strong>LinkedIn:</strong> 
                                        <a href={submission.linkedin} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">
                                          {submission.linkedin}
                                        </a>
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <h3 className="font-semibold mb-2">Order Information</h3>
                                  <div className="space-y-1">
                                    <p><strong>Package:</strong> {submission.order?.package_name}</p>
                                    <p><strong>Amount:</strong> {formatCurrency(submission.order?.amount || 0)}</p>
                                    <p><strong>Order Date:</strong> {formatDate(submission.order?.created_at, "MMM dd, yyyy")}</p>
                                    <p><strong>Order ID:</strong> {submission.order_id}</p>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <h3 className="font-semibold mb-2">Job Description</h3>
                                <div className="bg-muted p-3 rounded-md">
                                  <p className="whitespace-pre-wrap">{submission.job_description}</p>
                                </div>
                                {submission.job_url && (
                                  <p className="mt-2"><strong>Job URL:</strong> 
                                    <a href={submission.job_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">
                                      {submission.job_url}
                                    </a>
                                  </p>
                                )}
                              </div>

                              {submission.additional_info && (
                                <div>
                                  <h3 className="font-semibold mb-2">Additional Information</h3>
                                  <div className="bg-muted p-3 rounded-md">
                                    <p className="whitespace-pre-wrap">{submission.additional_info}</p>
                                  </div>
                                </div>
                              )}

                              {submission.resume_url && (
                                <div>
                                  <h3 className="font-semibold mb-2">Resume</h3>
                                  <Button 
                                    variant="outline"
                                    onClick={async () => {
                                      try {
                                        // Generate signed URL for secure access
                                        const { data, error } = await supabase.storage
                                          .from('resumes')
                                          .createSignedUrl(submission.resume_url.split('/').pop() || '', 3600);
                                        
                                        if (error) throw error;
                                        
                                        // Open in new tab
                                        window.open(data.signedUrl, '_blank');
                                      } catch (error: any) {
                                        toast({
                                          title: "Error",
                                          description: "Failed to download resume: " + error.message,
                                          variant: "destructive",
                                        });
                                      }
                                    }}
                                  >
                                    Download Resume
                                  </Button>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEdit(submission)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete this submission.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(submission.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {submissions.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No submissions found. Submissions will appear here once customers complete their intake forms.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Submission</DialogTitle>
            </DialogHeader>
            {editingSubmission && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-name">Name</Label>
                    <Input
                      id="edit-name"
                      value={editingSubmission.name}
                      onChange={(e) => setEditingSubmission({
                        ...editingSubmission,
                        name: e.target.value
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-email">Email</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={editingSubmission.email}
                      onChange={(e) => setEditingSubmission({
                        ...editingSubmission,
                        email: e.target.value
                      })}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-phone">Phone</Label>
                    <Input
                      id="edit-phone"
                      value={editingSubmission.phone || ''}
                      onChange={(e) => setEditingSubmission({
                        ...editingSubmission,
                        phone: e.target.value
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-linkedin">LinkedIn</Label>
                    <Input
                      id="edit-linkedin"
                      value={editingSubmission.linkedin || ''}
                      onChange={(e) => setEditingSubmission({
                        ...editingSubmission,
                        linkedin: e.target.value
                      })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit-job-url">Job URL</Label>
                  <Input
                    id="edit-job-url"
                    value={editingSubmission.job_url || ''}
                    onChange={(e) => setEditingSubmission({
                      ...editingSubmission,
                      job_url: e.target.value
                    })}
                  />
                </div>

                <div>
                  <Label htmlFor="edit-job-description">Job Description</Label>
                  <Textarea
                    id="edit-job-description"
                    rows={6}
                    value={editingSubmission.job_description}
                    onChange={(e) => setEditingSubmission({
                      ...editingSubmission,
                      job_description: e.target.value
                    })}
                  />
                </div>

                <div>
                  <Label htmlFor="edit-additional-info">Additional Information</Label>
                  <Textarea
                    id="edit-additional-info"
                    rows={4}
                    value={editingSubmission.additional_info || ''}
                    onChange={(e) => setEditingSubmission({
                      ...editingSubmission,
                      additional_info: e.target.value
                    })}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsEditDialogOpen(false);
                      setEditingSubmission(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSaveEdit}>
                    Save Changes
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Admin;