import apiService from './api';
import { ApiResponse } from '@/types/api';
import { errorHandler } from './errorHandler';
import { getImageUrl } from '@/utils/apiTransform';

interface ApiCarouselSlide {
  id: number | string;
  title?: string;
  textContent?: string;
  imageRef: string;
  redirectUrl?: string;
  link?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface HomepageCarouselSlide {
  id: number | string;
  title: string;
  textContent?: string;
  imageRef: string;
  imageUrl?: string;
  redirectUrl?: string;
  displayOrder: number;
}

export const homepageService = {
  async getCarouselSlides(): Promise<HomepageCarouselSlide[]> {
    try {
      const response = await apiService.get<ApiResponse<ApiCarouselSlide[]>>('/homepage/carousel');
      const slides = response.data.data;

      if (!slides || !Array.isArray(slides)) {
        return [];
      }

      return slides
        .map((s): HomepageCarouselSlide => ({
          id: s.id,
          title: s.title ?? '',
          textContent: s.textContent,
          imageRef: s.imageRef,
          imageUrl: getImageUrl(s.imageRef),
          redirectUrl: s.redirectUrl ?? s.link,
          displayOrder: s.displayOrder ?? 0,
        }))
        .sort((a, b) => a.displayOrder - b.displayOrder);
    } catch (error: any) {
      errorHandler.handleError(error, 'Chargement du carrousel', false);
      return [];
    }
  },
};
