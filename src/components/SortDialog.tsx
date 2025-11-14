import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface SortDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (sort: string | null, order: 'asc' | 'desc' | null) => void;
  initialSort?: string | null;
  initialOrder?: 'asc' | 'desc' | null;
}

const SortDialog = ({ open, onOpenChange, onApply, initialSort, initialOrder }: SortDialogProps) => {
  const [sort, setSort] = useState<string | null>(null);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    if (initialSort) {
      setSort(initialSort);
    } else {
      setSort(null);
    }
    if (initialOrder) {
      setOrder(initialOrder);
    }
  }, [initialSort, initialOrder]);

  const handleApply = () => {
    onApply(sort, sort ? order : null);
    onOpenChange(false);
  };

  const handleReset = () => {
    setSort(null);
    setOrder('asc');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sắp xếp</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Sắp xếp theo</Label>
            <Select value={sort || undefined} onValueChange={(value) => setSort(value === "none" ? null : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn tiêu chí sắp xếp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Không sắp xếp</SelectItem>
                <SelectItem value="difficulty">Độ khó</SelectItem>
                <SelectItem value="name">Tên</SelectItem>
                <SelectItem value="createdAt">Ngày tạo</SelectItem>
                <SelectItem value="updatedAt">Ngày cập nhật</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {sort && (
            <div className="space-y-2">
              <Label>Thứ tự</Label>
              <RadioGroup value={order} onValueChange={(value) => setOrder(value as 'asc' | 'desc')}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="asc" id="asc" />
                  <Label htmlFor="asc" className="cursor-pointer">Tăng dần</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="desc" id="desc" />
                  <Label htmlFor="desc" className="cursor-pointer">Giảm dần</Label>
                </div>
              </RadioGroup>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleReset}>
            Đặt lại
          </Button>
          <Button onClick={handleApply}>
            Áp dụng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SortDialog;

