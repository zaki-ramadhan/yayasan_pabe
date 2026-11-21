"use client";

import { FormField } from "@/components/ui/FormField";
import { CreatableCombobox } from "@/components/ui/CreatableCombobox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/Select";

export function AdminProgramCategorySelect({
  isZisMode,
  categoryId,
  categoryList,
  error,
  onChange,
  onCreateCategory,
}) {
  return (
    <FormField
      label={isZisMode ? "Kategori ZIS" : "Kategori program"}
      required
      error={error}
    >
      {isZisMode ? (
        <Select value={categoryId} onValueChange={onChange}>
          <SelectTrigger className="h-10 text-sm bg-white border border-slate-300 rounded-lg">
            <SelectValue placeholder="Pilih kategori ZIS..." />
          </SelectTrigger>
          <SelectContent className="bg-white border border-slate-200 z-50">
            {categoryList.map((cat) => (
              <SelectItem
                key={cat.id}
                value={cat.id}
                className="cursor-pointer text-sm font-normal py-2"
              >
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <CreatableCombobox
          options={categoryList}
          value={categoryId}
          onChange={onChange}
          onCreate={onCreateCategory}
          placeholder="Pilih kategori..."
          searchPlaceholder="Cari kategori atau buat baru..."
          createPrefix="Buat kategori"
          className="bg-white"
        />
      )}
    </FormField>
  );
}

