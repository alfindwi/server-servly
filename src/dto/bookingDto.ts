export interface CreateBookDTO {
  customerId: number;
  workerId: number;
  serviceId: string;
  bookingDate: Date;
  schedule: Date;
  note?: string;
}

export interface UpdateBookScheduleDTO  {
  bookingDate?: Date;
  schedule?: Date;
  note?: string;
}

export interface updateBookStatus {
  status: "CONFIRMED" | "CANCELLED" | "COMPLETED";
}
