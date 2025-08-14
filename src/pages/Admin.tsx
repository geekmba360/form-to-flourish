import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Loader2, LogOut, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
    loadSubmissions();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
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
                        {format(new Date(submission.created_at), "MMM dd, yyyy HH:mm")}
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
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
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
                                    <p><strong>Order Date:</strong> {format(new Date(submission.order?.created_at), "MMM dd, yyyy")}</p>
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
                                  <Button asChild variant="outline">
                                    <a href={submission.resume_url} target="_blank" rel="noopener noreferrer">
                                      Download Resume
                                    </a>
                                  </Button>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
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
      </main>
    </div>
  );
};

export default Admin;