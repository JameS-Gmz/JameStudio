export interface Project {
  id: number;
  title: string;
  description?: string;
  imageUrl?: string;
  images?: string[];
  technologies?: string[];
  github?: string | null;
  demo?: string | null;
  UserId?: number;
  StatusId?: number;
  LanguageId?: number;
  ControllerIds?: number[];
  PlatformIds?: number[];
  genreIds?: number[];
  tagIds?: number[];
  createdAt?: string;
  updatedAt?: string;
  price?: number;
  authorStudio?: string | null;
  madeWith?: string;
}

export interface ProjectCreateRequest {
  title: string;
  description?: string;
  imageUrl?: string;
  technologies?: string[];
  github?: string | null;
  demo?: string | null;
  UserId?: number;
  StatusId?: number;
  LanguageId?: number;
  ControllerIds?: number[];
  PlatformIds?: number[];
  genreIds?: number[];
  tagIds?: number[];
  price?: number;
  authorStudio?: string | null;
}

export interface ProjectUpdateRequest extends Partial<ProjectCreateRequest> {}

