export interface createServiceDTO {
  categoryId: number;
  name: string;
  description?: string;
  basePrice?: number;
  duration?: number;
}

export interface updateServiceDTO {
  name?: string;
  description?: string;
  basePrice?: number;
  duration?: number;
}
