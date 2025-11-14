import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Header from "@/components/Header";
import { useAuthContext } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/services/api";
import { API_CONFIG } from "@/constants";
import { Loader2, Edit2, ExternalLink, Camera } from "lucide-react";
import { toast } from "sonner";

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
  avatarUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface UserResponse {
  success: boolean;
  data: UserData;
}

const EditProfile = () => {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const [editingField, setEditingField] = useState<string | null>(null);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

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
      toast.success('Cập nhật thành công');
      setEditingField(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Cập nhật thất bại');
    },
  });

  // Upload avatar mutation
  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const res = await apiClient.put(`/user/${userData?._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'edit'] });
      queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Cập nhật avatar thành công');
      setIsUploadingAvatar(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Cập nhật avatar thất bại');
      setIsUploadingAvatar(false);
    },
  });

  // Initialize field values when user data is loaded
  useEffect(() => {
    if (userData) {
      setFieldValues({
        email: userData.email || '',
        firstname: userData.firstname || '',
        lastname: userData.lastname || '',
        fullname: userData.fullname || '',
        gender: userData.gender || '',
        dob: userData.dob || '',
        studentPtitCode: userData.studentPtitCode || '',
      });
    }
  }, [userData]);

  const handleEdit = (field: string) => {
    setEditingField(field);
  };

  const handleSave = (field: string) => {
    const value = fieldValues[field] || '';
    const updateData: Partial<UserData> = { [field]: value || null };
    updateMutation.mutate(updateData);
  };

  const handleCancel = (field: string) => {
    if (userData) {
      const originalValue = (userData as any)[field] || '';
      setFieldValues({ ...fieldValues, [field]: originalValue });
    }
    setEditingField(null);
  };

  const handleFieldChange = (field: string, value: string) => {
    setFieldValues({ ...fieldValues, [field]: value });
  };

  const handleAvatarClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast.error('Vui lòng chọn file ảnh');
          return;
        }
        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error('Kích thước file không được vượt quá 5MB');
          return;
        }
        setIsUploadingAvatar(true);
        uploadAvatarMutation.mutate(file);
      }
    };
    input.click();
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const formatDisplayDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };


  const renderField = (
    label: string,
    field: string,
    type: 'text' | 'textarea' | 'date' | 'select' | 'email' = 'text',
    placeholder?: string,
    readOnly: boolean = false
  ) => {
    const isEditing = editingField === field && !readOnly;
    const value = fieldValues[field] || '';
    const displayValue = userData ? ((userData as any)[field] || '') : '';

    return (
      <div className="flex items-start justify-between border-b py-4">
        <div className="flex-1">
          <Label className="text-sm font-medium mb-2 block">{label}</Label>
          {isEditing ? (
            <div className="space-y-2">
              {type === 'textarea' ? (
                <Textarea
                  value={value}
                  onChange={(e) => handleFieldChange(field, e.target.value)}
                  placeholder={placeholder}
                  className="min-h-[100px]"
                />
              ) : type === 'date' ? (
                <Input
                  type="date"
                  value={value ? formatDate(value) : ''}
                  onChange={(e) => handleFieldChange(field, e.target.value)}
                />
              ) : type === 'select' ? (
                <Select
                  value={value || undefined}
                  onValueChange={(val) => handleFieldChange(field, val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Nam</SelectItem>
                    <SelectItem value="Female">Nữ</SelectItem>
                    <SelectItem value="Other">Khác</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  type={type}
                  value={value}
                  onChange={(e) => handleFieldChange(field, e.target.value)}
                  placeholder={placeholder}
                />
              )}
              <div className="flex gap-2 mt-2">
                <Button
                  size="sm"
                  onClick={() => handleSave(field)}
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Lưu'
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCancel(field)}
                  disabled={updateMutation.isPending}
                >
                  Hủy
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              {field === 'dob' && displayValue ? formatDisplayDate(displayValue) :
               field === 'gender' && displayValue ? 
                 (displayValue === 'Male' ? 'Nam' : displayValue === 'Female' ? 'Nữ' : displayValue === 'Other' ? 'Khác' : displayValue) :
               displayValue || <span className="text-muted-foreground italic">Chưa có thông tin</span>}
            </div>
          )}
        </div>
        {!isEditing && !readOnly && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(field)}
            className="ml-4"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  };

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
          <p className="text-destructive">Không thể tải dữ liệu hồ sơ</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Header with Avatar */}
          <div className="flex items-center gap-4 pb-6 border-b">
            <div className="relative group">
              <Avatar 
                className="h-16 w-16 cursor-pointer transition-opacity group-hover:opacity-80"
                onClick={handleAvatarClick}
              >
                <AvatarImage 
                  src={userData.avatarUrl ? `${API_CONFIG.baseURL}${userData.avatarUrl}` : undefined}
                  alt={userData.fullname || userData.username}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.fullname || userData.username)}&background=21791f&color=fff&size=128`;
                  }}
                />
                <AvatarFallback>{getInitials(userData.fullname || userData.username)}</AvatarFallback>
              </Avatar>
              {isUploadingAvatar ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={handleAvatarClick}>
                  <div className="flex flex-col items-center gap-1">
                    <Camera className="h-5 w-5 text-white" />
                    <span className="text-xs text-white font-medium">Cập nhật</span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold">{userData.fullname || userData.username}</h1>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">Codin ID: {userData.username}</p>
            </div>
          </div>

          {/* Basic Info Section */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-6">Thông tin cơ bản</h2>
              <div className="space-y-0">
                {renderField('Tên đăng nhập', 'username', 'text', undefined, true)}
                {renderField('Email', 'email', 'email')}
                {renderField('Tên', 'firstname', 'text')}
                {renderField('Họ', 'lastname', 'text')}
                {renderField('Họ và tên đầy đủ', 'fullname', 'text')}
                {renderField('Giới tính', 'gender', 'select', 'Chọn giới tính')}
                {renderField('Ngày sinh', 'dob', 'date')}
                {renderField('Mã sinh viên PTIT', 'studentPtitCode', 'text')}
                {renderField('Vai trò hệ thống', 'systemRole', 'text', undefined, true)}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;

