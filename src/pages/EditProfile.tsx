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
      
      {/* Profile Header */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded bg-primary/20">
              <img 
                src="/default-avatar.png"
                alt="Profile"
                className="h-full w-full rounded"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.fullname || userData.username)}&background=21791f&color=fff&size=128`;
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{userData.fullname || userData.username}</h1>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">ID: {userData.username}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Left Sidebar */}
          <div className="space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => !item.external && setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 rounded px-4 py-3 text-left transition-colors ${
                    activeTab === item.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  {Icon && <Icon className="h-5 w-5" />}
                  <span>{item.label}</span>
                  {item.external && (
                    <ExternalLink className="ml-auto h-4 w-4" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === "basic" && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="mb-6 text-xl font-semibold">Thông tin cơ bản</h2>
                  
                  {/* Basic Info Section */}
                  <div className="mb-8 space-y-4">
                    <h3 className="text-sm font-semibold uppercase text-muted-foreground">Thông tin cơ bản</h3>
                    
                    <div className="flex items-center justify-between border-b pb-4">
                      <div>
                        <Label>Tên</Label>
                        <Input
                          value={formData.fullname || ''}
                          onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                          className="mt-2 max-w-md"
                        />
                      </div>
                      <Button variant="ghost">Sửa</Button>
                    </div>

                    <div className="flex items-center justify-between border-b pb-4">
                      <div>
                        <Label>Giới tính</Label>
                        <Select 
                          value={formData.gender || ''} 
                          onValueChange={(value) => setFormData({ ...formData, gender: value })}
                        >
                          <SelectTrigger className="mt-2 max-w-md">
                            <SelectValue placeholder="Chọn giới tính" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Male">Nam</SelectItem>
                            <SelectItem value="Female">Nữ</SelectItem>
                            <SelectItem value="Other">Khác</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button variant="ghost">Sửa</Button>
                    </div>

                    <div className="flex items-center justify-between border-b pb-4">
                      <div>
                        <Label>Địa điểm</Label>
                        <Input
                          placeholder="Địa điểm của bạn"
                          className="mt-2 max-w-md"
                        />
                      </div>
                      <Button variant="ghost">+2 Sửa</Button>
                    </div>

                    <div className="flex items-center justify-between border-b pb-4">
                      <div>
                        <Label>Ngày sinh</Label>
                        <Input
                          type="date"
                          value={formData.dob ? formData.dob.split('T')[0] : ''}
                          onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                          className="mt-2 max-w-md"
                        />
                      </div>
                      <Button variant="ghost">Sửa</Button>
                    </div>

                    <div className="flex items-center justify-between border-b pb-4">
                      <div className="flex-1">
                        <Label>Tóm tắt</Label>
                        <Textarea
                          placeholder="Cho chúng tôi biết về bạn (sở thích, kinh nghiệm, v.v.)"
                          className="mt-2"
                          rows={4}
                        />
                      </div>
                      <Button variant="ghost">+2 Sửa</Button>
                    </div>
                  </div>

                  {/* Experience Section */}
                  <div className="mb-8 space-y-4">
                    <h3 className="text-sm font-semibold uppercase text-muted-foreground">Kinh nghiệm</h3>
                    
                    <div className="flex items-center justify-between border-b pb-4">
                      <div className="flex-1">
                        <Label>Công việc</Label>
                        <Input
                          placeholder="Thêm nơi làm việc"
                          className="mt-2"
                        />
                      </div>
                      <Button variant="ghost">+2 Sửa</Button>
                    </div>

                    <div className="flex items-center justify-between border-b pb-4">
                      <div className="flex-1">
                        <Label>Học vấn</Label>
                        <Input
                          placeholder="Thêm trường học"
                          className="mt-2"
                        />
                      </div>
                      <Button variant="ghost">+2 Sửa</Button>
                    </div>
                  </div>

                  {/* Skills Section */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold uppercase text-muted-foreground">Kỹ năng</h3>
                    
                    <div className="flex items-center justify-between border-b pb-4">
                      <div className="flex-1">
                        <Label>Kỹ năng kỹ thuật</Label>
                        <Textarea
                          placeholder="Kỹ năng của bạn."
                          className="mt-2"
                          rows={3}
                        />
                      </div>
                      <Button variant="ghost">Sửa</Button>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="mt-8 flex justify-end gap-2">
                    <Button variant="outline" onClick={() => navigate(-1)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSubmit}
                      disabled={updateMutation.isPending}
                    >
                      {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "account" && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="mb-6 text-xl font-semibold">Tài khoản</h2>
                  <p className="text-muted-foreground">Cài đặt tài khoản sắp có...</p>
                </CardContent>
              </Card>
            )}

            {activeTab === "lab" && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="mb-6 text-xl font-semibold">Phòng thí nghiệm</h2>
                  <p className="text-muted-foreground">Cài đặt phòng thí nghiệm sắp có...</p>
                </CardContent>
              </Card>
            )}

            {activeTab === "privacy" && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="mb-6 text-xl font-semibold">Quyền riêng tư</h2>
                  <p className="text-muted-foreground">Cài đặt quyền riêng tư sắp có...</p>
                </CardContent>
              </Card>
            )}

            {activeTab === "notifications" && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="mb-6 text-xl font-semibold">Thông báo</h2>
                  <p className="text-muted-foreground">Cài đặt thông báo sắp có...</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;

