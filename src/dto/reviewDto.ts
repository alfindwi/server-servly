export interface createReviewDTO {
  customerId: number;
  workerId: number;
  rating: number;
  comment?: string;
}

export interface updateReviewDTO {
  rating?: number;
  comment?: string;
}
