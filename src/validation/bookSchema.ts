import z from "zod";

export const createSchema = z.object({
  serviceId: z.string().min(1, { message: "Service ID is required" }),
  workerId: z.string().min(1, { message: "Worker ID is required" }),
  customerId: z.string().min(1, { message: "Customer ID is required" }),
  date: z.string().min(1, { message: "Date is required" }),
  time: z.string().min(1, { message: "Time is required" }),
  location: z.string().min(1, { message: "Location is required" }),
});
