import React from "react";

export interface MenuAnchor {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ProductPopupMenuProps {
  visible: boolean;

  anchor: MenuAnchor | null;

  onClose: () => void;

  onEdit: () => void;

  onDuplicate: () => void;

  onShare: () => void;

  onDelete: () => void;
}