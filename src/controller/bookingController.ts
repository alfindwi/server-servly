import { Request, Response } from "express";
import * as bookingService from "../service/bookingService";

export const createBooking = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const userId = res.locals.user.id;

    const booking = await bookingService.createBooking(data, userId);

    res.status(201).json({ message: "Booking created successfully", booking });
  } catch (error) {
    console.log(error);
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const getBookings = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.user.id;
    const role = res.locals.user.role;
    const bookings = await bookingService.getBooking(userId, role);

    res.status(200).json(bookings);
  } catch (error) {
    console.log(error);
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const getBookingById = async (req: Request, res: Response) => {
  try {
    const bookingId = +req.params.id;
    const userId = res.locals.user.id;
    const booking = await bookingService.getBookingById(bookingId, userId);

    res.status(200).json({ booking });
  } catch (error) {
    console.log(error);
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const updateBookingSchedule = async (req: Request, res: Response) => {
  try {
    const bookingId = +req.params.id;
    const userId = res.locals.user.id;
    const data = req.body;

    const booking = await bookingService.updateBookingSchedule(
      bookingId,
      userId,
      data
    );

    res
      .status(200)
      .json({ message: "Booking schedule updated successfully", booking });
  } catch (error) {
    console.log(error);
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const updateBookingStatus = async (req: Request, res: Response) => {
  try {
    const bookingId = +req.params.id;
    const userId = res.locals.user.id;
    const role = res.locals.user.role;
    const data = req.body;

    const booking = await bookingService.updateBookingStatus(
      bookingId,
      userId,
      data,
      role
    );

    res
      .status(200)
      .json({ message: "Booking status updated successfully", booking });
  } catch (error) {
    console.log(error);
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};