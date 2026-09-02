export interface ProductActionSheetProps {
  onEdit: () => void;
  onDuplicate: () => void;
  onShare: () => void;
  onDelete: () => void;
}

export interface ProductActionSheetRef {
  present: () => void;
  dismiss: () => void;
}