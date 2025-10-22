// 이미지 모달 상태 관리 훅
import { useState } from "react";

interface UseImageModalReturn {
  modalOpen: boolean;
  modalImages: string[];
  modalIndex: number;
  openModal: (images: string[], index: number) => void;
  closeModal: () => void;
  nextImage: () => void;
  prevImage: () => void;
}

export const useImageModal = (): UseImageModalReturn => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImages, setModalImages] = useState<string[]>([]);
  const [modalIndex, setModalIndex] = useState(0);

  const openModal = (images: string[], index: number) => {
    setModalImages(images);
    setModalIndex(index);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const nextImage = () => {
    setModalIndex((prev) => (prev + 1) % modalImages.length);
  };

  const prevImage = () => {
    setModalIndex((prev) => (prev - 1 + modalImages.length) % modalImages.length);
  };

  return {
    modalOpen,
    modalImages,
    modalIndex,
    openModal,
    closeModal,
    nextImage,
    prevImage,
  };
};