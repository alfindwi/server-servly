import { Router } from "express";
import * as bookingController from "../controller/bookingController";
import { authentication } from "../middlewares/auth";

export const bookingRouter = Router();

bookingRouter.post("/", authentication,bookingController.createBooking);
bookingRouter.get("/", authentication,bookingController.getBookings);
bookingRouter.get("/:id", authentication, bookingController.getBookingById);
bookingRouter.put("/:id", authentication, bookingController.updateBookingSchedule);
bookingRouter.put("/status/:id",authentication, bookingController.updateBookingStatus);