import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Rule, RuleCategory } from "./types";

interface RuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingRule: Rule | null;
  categories: RuleCategory[];
  selectedCategoryId?: number | null;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isSubmitting: boolean;
}

export function RuleDialog({
  open,
  onOpenChange,
  editingRule,
  categories,
  selectedCategoryId,
  onSubmit,
  isSubmitting,
}: RuleDialogProps) {
  const categoryId = editingRule?.category_id || selectedCategoryId;
  const selectedCategory = categories.find((cat) => cat.id === categoryId);
  const isCreatingFromCategory = !editingRule && selectedCategoryId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingRule ? "Edit Rule" : "Create Rule"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="category_id">Category</Label>
            {isCreatingFromCategory ? (
              <>
                <Input
                  value={selectedCategory?.name || ""}
                  disabled
                  className="bg-muted"
                />
                <input type="hidden" name="category_id" value={selectedCategoryId?.toString()} />
              </>
            ) : (
              <Select
                name="category_id"
                defaultValue={editingRule?.category_id?.toString()}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              defaultValue={editingRule?.title}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={editingRule?.description}
              rows={4}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {editingRule ? "Update" : "Create"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
