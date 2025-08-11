export interface CreateBookDTO {
  workerId: number;
  serviceId: string;
  bookingDate?: Date;
  schedule: Date;
  note?: string;
}

export interface UpdateBookScheduleDTO  {
  schedule?: Date;
}

export interface updateBookStatus {
  status: "CONFIRMED" | "CANCELLED" | "COMPLETED" | "REJECTED" | "IN_PROGRESS";
}
