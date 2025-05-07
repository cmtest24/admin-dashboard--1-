"use client"

import { useState, useEffect } from "react"
import AdminLayout from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { fetchWithAuth } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import { Plus, Upload, X, Loader2 } from "lucide-react"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { API_BASE_URL } from "@/lib/config"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"

interface Address {
  name: string;
  phoneNumber: string;
  address: string;
}

interface StoreInfo {
  id: string;
  logo: string;
  favicon: string;
  facebook: string;
  youtube: string;
  googleMap: string;
  hotline: string;
  zalo: string;
  workingHours: string;
  addresses: Address[];
}

// Normalize image path
function getFullImageUrl(url: string | undefined): string {
  if (!url) return "/placeholder.svg";
  if (url.startsWith("http")) return url;
  if (url.startsWith("/public/")) return `${process.env.NEXT_PUBLIC_API_BASE_URL}${url}`;
  return url;
}

// Image Upload Component
function ImageUpload({ value, onChange, label = "Hình ảnh", disabled = false }: {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError(`Kích thước file quá lớn (tối đa 5MB)`);
      e.target.value = '';
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      setError(`File không phải là hình ảnh`);
      e.target.value = '';
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("images", file);

      const token = localStorage.getItem("adminToken");
      const response = await fetch(`${API_BASE_URL}/api/upload-images`, {
        method: "POST",
        body: formData,
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        throw new Error("Tải lên thất bại");
      }

      const data = await response.json();
      console.log("Upload image response:", data); // debug

      // Sửa lại dòng này:
      if (Array.isArray(data.imageUrls) && data.imageUrls.length > 0) {
        onChange(data.imageUrls[0]);
      }
    } catch (error) {
      console.error("Upload error:", error);
      setError("Tải lên thất bại. Vui lòng thử lại.");
    } finally {
      setIsUploading(false);
    }
  };

  const inputId = `image-upload-${label?.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className="space-y-3">
      <Label htmlFor={inputId}>{label}</Label>
      <div className="flex items-center gap-4">
        {/* Preview Section */}
        <div className="relative h-24 w-24 overflow-hidden rounded-md border bg-gray-50">
          {value ? (
            <Image 
              src={getFullImageUrl(value)} 
              alt={`${label} preview`} 
              fill 
              className="object-contain" 
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-400">
              <span className="text-xs">No image</span>
            </div>
          )}
          {value && !disabled && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute right-1 top-1 h-6 w-6 opacity-80 hover:opacity-100"
              onClick={() => onChange("")}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Upload Input */}
        {!disabled && (
          <div className="flex-1">
            <Input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              disabled={isUploading}
              className="hidden"
              id={inputId}
            />
            <Label
              htmlFor={inputId}
              className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed p-3 text-sm hover:bg-muted/50 transition-colors"
            >
              {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              <span>{isUploading ? "Đang tải lên..." : "Chọn hình ảnh"}</span>
            </Label>
            {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

// Preview components
const GoogleMapPreview = ({ embedCode }: { embedCode: string }) => {
  if (!embedCode) return null;
  return (
    <div className="mt-3 border rounded overflow-hidden" style={{ height: '200px' }}>
      <div dangerouslySetInnerHTML={{ __html: embedCode }} />
    </div>
  );
};

const YouTubePreview = ({ url }: { url: string }) => {
  if (!url) return null;
  
  const getYouTubeID = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getYouTubeID(url);
  if (!videoId) return null;

  return (
    <div className="mt-3 border rounded overflow-hidden aspect-video">
      <iframe
        width="100%"
        height="100%"
        src={`https://www.youtube.com/embed/${videoId}`}
        style={{ border: 0 }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
};

export default function StoreInfoPage() {
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<StoreInfo>({
    id: "",
    logo: "",
    favicon: "",
    facebook: "",
    youtube: "",
    googleMap: "",
    hotline: "",
    zalo: "",
    workingHours: "",
    addresses: [],
  });
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("basic-info");
  const [saving, setSaving] = useState(false);

  const fetchStoreInfo = async () => {
    setLoading(true);
    try {
      const response = await fetchWithAuth("/api/store-info");
      if (!response.ok) {
        if (response.status === 404) {
          setStoreInfo(null);
          setFormData({
            id: "",
            logo: "",
            favicon: "",
            facebook: "",
            youtube: "",
            googleMap: "",
            hotline: "",
            zalo: "",
            workingHours: "",
            addresses: [],
          });
        } else {
          throw new Error("Không thể tải thông tin cửa hàng");
        }
      } else {
        const data = await response.json();
        setStoreInfo(data);
        setFormData(data);
      }
    } catch (error) {
      console.error("Fetch store info error:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin cửa hàng",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStoreInfo();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddressChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newAddresses = [...formData.addresses];
    newAddresses[index] = { ...newAddresses[index], [name]: value };
    setFormData({ ...formData, addresses: newAddresses });
  };

  const addAddress = () => {
    setFormData({
      ...formData,
      addresses: [...formData.addresses, { name: "", phoneNumber: "", address: "" }],
    });
  };

  const removeAddress = (index: number) => {
    const newAddresses = formData.addresses.filter((_, i) => i !== index);
    setFormData({ ...formData, addresses: newAddresses });
  };

  const handleSave = async () => {
    setSaving(true);
    const method = storeInfo ? "PUT" : "POST";
    const url = "/api/store-info";

    // Loại bỏ trường id trước khi gửi lên backend
    const { id, ...dataToSend } = formData;

    try {
      const response = await fetchWithAuth(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend), // Gửi data không có id
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Lỗi khi ${storeInfo ? "cập nhật" : "thêm mới"} thông tin cửa hàng`);
      }

      toast({
        title: "Thành công",
        description: `Thông tin cửa hàng đã được ${storeInfo ? "cập nhật" : "thêm mới"}.`,
      });
      fetchStoreInfo();
    } catch (error: any) {
      console.error("Save store info error:", error);
      toast({
        title: "Lỗi",
        description: error.message || `Không thể ${storeInfo ? "cập nhật" : "thêm mới"} thông tin cửa hàng`,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(storeInfo || {
      id: "",
      logo: "",
      favicon: "",
      facebook: "",
      youtube: "",
      googleMap: "",
      hotline: "",
      zalo: "",
      workingHours: "",
      addresses: [],
    });
    toast({
      title: "Thông báo",
      description: "Đã hủy các thay đổi chưa lưu",
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Đang tải thông tin cửa hàng...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Quản lý thông tin cửa hàng</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel} disabled={saving}>
              Hủy
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang lưu
                </>
              ) : (
                "Lưu thay đổi"
              )}
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full max-w-md mb-6">
            <TabsTrigger value="basic-info" className="flex-1">Thông tin cơ bản</TabsTrigger>
            <TabsTrigger value="social-map" className="flex-1">Mạng xã hội & Bản đồ</TabsTrigger>
            <TabsTrigger value="addresses" className="flex-1">Địa chỉ</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic-info">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin cửa hàng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <ImageUpload
                      label="Logo cửa hàng"
                      value={formData.logo}
                      onChange={(url) => setFormData({ ...formData, logo: url })}
                      disabled={saving}
                    />
                  
                    <ImageUpload
                      label="Favicon website"
                      value={formData.favicon}
                      onChange={(url) => setFormData({ ...formData, favicon: url })}
                      disabled={saving}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="hotline" className="mb-2 block">Hotline</Label>
                      <Input
                        type="text"
                        id="hotline"
                        name="hotline"
                        value={formData.hotline}
                        onChange={handleInputChange}
                        placeholder="Nhập số hotline"
                        disabled={saving}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="zalo" className="mb-2 block">Zalo</Label>
                      <Input
                        type="text"
                        id="zalo"
                        name="zalo"
                        value={formData.zalo}
                        onChange={handleInputChange}
                        placeholder="Nhập số Zalo"
                        disabled={saving}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="workingHours" className="mb-2 block">Giờ làm việc</Label>
                      <Input
                        type="text"
                        id="workingHours"
                        name="workingHours"
                        value={formData.workingHours}
                        onChange={handleInputChange}
                        placeholder="Ví dụ: 8:00 - 22:00 hàng ngày"
                        disabled={saving}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="social-map">
            <Card>
              <CardHeader>
                <CardTitle>Mạng xã hội & Bản đồ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="facebook" className="mb-2 block">Facebook URL</Label>
                    <Input
                      type="text"
                      id="facebook"
                      name="facebook"
                      value={formData.facebook}
                      onChange={handleInputChange}
                      placeholder="https://facebook.com/..."
                      disabled={saving}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="youtube" className="mb-2 block">YouTube URL</Label>
                    <Input
                      type="text"
                      id="youtube"
                      name="youtube"
                      value={formData.youtube}
                      onChange={handleInputChange}
                      placeholder="https://youtube.com/..."
                      disabled={saving}
                    />
                    <YouTubePreview url={formData.youtube} />
                  </div>
                  
                  <div>
                    <Label htmlFor="googleMap" className="mb-2 block">Google Map Embed Code</Label>
                    <textarea
                      id="googleMap"
                      name="googleMap"
                      value={formData.googleMap}
                      onChange={handleInputChange}
                      rows={5}
                      className="w-full min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="<iframe src='https://www.google.com/maps/embed?...'></iframe>"
                      disabled={saving}
                    />
                    <GoogleMapPreview embedCode={formData.googleMap} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="addresses">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Địa chỉ cửa hàng</CardTitle>
                <Button variant="outline" size="sm" onClick={addAddress} disabled={saving}>
                  <Plus className="mr-1 h-4 w-4" /> Thêm địa chỉ
                </Button>
              </CardHeader>
              <CardContent>
                {formData.addresses.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Chưa có địa chỉ nào được thêm</p>
                    <Button variant="secondary" size="sm" onClick={addAddress} className="mt-2" disabled={saving}>
                      <Plus className="mr-1 h-4 w-4" /> Thêm địa chỉ đầu tiên
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {formData.addresses.map((address, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="font-medium">Địa chỉ #{index + 1}</h3>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => removeAddress(index)}
                            className="h-8 px-2 text-destructive hover:text-destructive/90"
                            disabled={saving}
                          >
                            <X className="h-4 w-4 mr-1" /> Xóa
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`address-name-${index}`} className="mb-1 block">Tên chi nhánh</Label>
                            <Input
                              type="text"
                              id={`address-name-${index}`}
                              name="name"
                              value={address.name}
                              onChange={(e) => handleAddressChange(index, e)}
                              placeholder="Trụ sở chính, Chi nhánh số 1,..."
                              className="mb-4"
                              disabled={saving}
                            />
                            
                            <Label htmlFor={`address-phone-${index}`} className="mb-1 block">Số điện thoại</Label>
                            <Input
                              type="text"
                              id={`address-phone-${index}`}
                              name="phoneNumber"
                              value={address.phoneNumber}
                              onChange={(e) => handleAddressChange(index, e)}
                              placeholder="Số điện thoại của chi nhánh"
                              disabled={saving}
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor={`address-address-${index}`} className="mb-1 block">Địa chỉ chi tiết</Label>
                            <textarea
                              id={`address-address-${index}`}
                              name="address"
                              value={address.address}
                              onChange={(e: any) => handleAddressChange(index, e)}
                              rows={4}
                              className="w-full min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                              disabled={saving}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}