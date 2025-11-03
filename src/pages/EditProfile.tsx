import { useState, useEffect } from "react";
import { Settings, Briefcase, Shield, Bell, Coins, CreditCard, Send, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/Header";
import { useAuthContext } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/services/api";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface UserData {
  _id: string;
  username: string;
  email: string;
  firstname: string;
  lastname: string;
  fullname: string;
  gender: string | null;
  dob: string | null;
  systemRole: string;
  studentPtitCode: string | null;
  dataPartitionCode: string | null;
  createdAt: string;
  updatedAt: string;
}

interface UserResponse {
  success: boolean;
  data: UserData;
}

const EditProfile = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("basic");

  // Fetch user data
  const { data: userData, isLoading } = useQuery({
    queryKey: ['user', 'edit'],
    queryFn: async () => {
      const res = await apiClient.get<UserResponse>('/user/me');
      return res.data.data;
    },
    enabled: !!user?._id,
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: Partial<UserData>) => {
      const res = await apiClient.put(`/user/${userData?._id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'edit'] });
      queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update profile');
    },
  });

  const [formData, setFormData] = useState<Partial<UserData>>({});
  
  // Initialize form data when user data is loaded
  useEffect(() => {
    if (userData) {
      setFormData({
        fullname: userData.fullname || '',
        gender: userData.gender || '',
        email: userData.email || '',
        dob: userData.dob || '',
      });
    }
  }, [userData]);

  const handleSubmit = () => {
    updateMutation.mutate(formData);
  };

  const sidebarItems = [
    { id: "basic", label: "Basic Info", icon: null },
    { id: "account", label: "Account", icon: Settings },
    { id: "lab", label: "Lab", icon: Briefcase },
    { id: "privacy", label: "Privacy", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "points", label: "Points", icon: Coins, external: true },
    { id: "billing", label: "Billing", icon: CreditCard, external: true },
    { id: "orders", label: "Orders", icon: Send, external: true },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex h-64 items-center justify-center">
          <p className="text-destructive">Failed to load profile data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-12 text-center">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
              <Settings className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="mb-4 text-2xl font-semibold">Chỉnh sửa hồ sơ</h2>
            <p className="mb-8 text-lg text-muted-foreground">
              Tính năng này đang trong quá trình phát triển
            </p>
            <p className="mb-8 text-sm text-muted-foreground">
              Chúng tôi đang làm việc để mang đến cho bạn trải nghiệm chỉnh sửa hồ sơ tốt nhất.
              Vui lòng quay lại sau!
            </p>
            <Button onClick={() => navigate(-1)}>
              Quay lại
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditProfile;

