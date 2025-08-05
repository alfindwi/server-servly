import { Role } from "../../generated/prisma";
import {
  CreateBookDTO,
  UpdateBookScheduleDTO,
  updateBookStatus,
} from "../dto/bookingDto";
import { prisma } from "../libs/prisma";

export const createBooking = async (data: CreateBookDTO, customerId: number) => {
  try {
    const skill = await prisma.workerSkill.findFirst({
      where: {
        workerId: data.workerId,
        serviceId: data.serviceId,
      },
    });

    if (!skill) {
      throw new Error("Worker does not have this skill");
    }

    const now = new Date();
    if (new Date(data.schedule) < now) {
      throw new Error("Schedule must be in the future");
    }

    const booking = await prisma.booking.create({
      data: {
        customerId: customerId,
        workerId: data.workerId,
        serviceId: data.serviceId,
        bookingDate: data.bookingDate,
        scheduledAt: data.schedule,
        notes: data.note,
        status: "PENDING",
      },
    });

    return booking;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getBookingById = async (bookingId: number, userId: number) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: {
        id: bookingId,
      },
      include: {
        customer: true,
        worker: {
          include: {
            user: true,
          },
        },
        service: true,
      },
    });

    if (!booking) {
      throw new Error("Booking not found");
    }

    if (booking.customerId !== userId && booking.workerId !== userId) {
      throw new Error("Unauthorized to access this booking");
    }

    return booking;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getBooking = async (userId: number, role: Role) => {
  try {
    const bookings = await prisma.booking.findMany({
      where:
        role === "CUSTOMER" ? { customerId: userId } : { workerId: userId },
      include: {
        customer: true,
        worker: {
          include: {
            user: true,
          },
        },
        service: true,
      },
    });

    return bookings;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const updateBookingSchedule = async (
  bookId: number,
  userId: number,
  data: UpdateBookScheduleDTO
) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: {
        id: bookId,
      },
    });

    if (!booking || booking.customerId !== userId) {
      throw new Error("Unauthorized to update this booking");
    }

    if (booking.status !== "PENDING") {
      throw new Error("Cannot update schedule of non-pending booking");
    }

    return await prisma.booking.update({
      where: {
        id: bookId,
      },
      data: {
        bookingDate: data.bookingDate,
        scheduledAt: data.schedule,
        notes: data.note,
      },
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const updateBookingStatus = async (
  bookId: number,
  userId: number,
  data: updateBookStatus
) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: {
        id: bookId,
      },
    });

    if (!booking || booking.customerId !== userId) {
      throw new Error("Unauthorized to update this booking");
    }

    if (!["CONFIRMED", "COMPLETED", "CANCELLED"].includes(booking.status)) {
      throw new Error("Invalid booking status");
    }

    return await prisma.booking.update({
      where: {
        id: bookId,
      },
      data: {
        status: data.status,
      },
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const deleteBooking = async (bookId: number, userId: number) => {
  try {
    const booking = await prisma.booking.delete({
      where: {
        id: bookId,
      },
    });

    if(!booking || booking.customerId !== userId) {
        throw new Error("Unauthorized to delete this booking");
    }

    if(booking.status !== "PENDING") {
        throw new Error("Only pending booking can be deleted");
    }

    return await prisma.booking.delete({ where: { id: bookId } });
  } catch (error) {
    console.log(error);
    throw error;
  }
};
