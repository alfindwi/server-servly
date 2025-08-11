import { BookingStatus, Role } from "../../generated/prisma";
import {
  CreateBookDTO,
  UpdateBookScheduleDTO,
  updateBookStatus,
} from "../dto/bookingDto";
import { getOrSetCache } from "../libs/cache";
import { invalidateCacheByPrefix } from "../libs/invalidDateCache";
import { prisma } from "../libs/prisma";
import { formatDate } from "../utils/dateFomat";

export const createBooking = async (
  data: CreateBookDTO,
  customerId: number
) => {
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

    const existingBooking = await prisma.booking.findFirst({
      where: {
        workerId: data.workerId,
        scheduledAt: data.schedule,
        serviceId: data.serviceId,
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
      },
    });

    if (existingBooking) {
      throw new Error("You already have an active booking with this worker");
    }

    const now = new Date();
    const scheduleDate = new Date(data.schedule);

    if (scheduleDate < now) {
      throw new Error("Schedule must be in the future");
    }

    const booking = await prisma.booking.create({
      data: {
        customerId: customerId,
        workerId: data.workerId,
        serviceId: data.serviceId,
        scheduledAt: data.schedule,
        notes: data.note,
        status: "PENDING",
      },
    });

    const bookingResponse = {
      ...booking,
      bookingDate: formatDate(booking.bookingDate),
      scheduledAt: formatDate(booking.scheduledAt),
    };

    await invalidateCacheByPrefix("bookings");

    return bookingResponse;
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
    const cache = `bookings:${role}:${userId}`;
    const ttl = 60 * 10;

    return await getOrSetCache(cache, ttl, async () => {
      const bookings = await prisma.booking.findMany({
        where:
          role === "CUSTOMER" ? { customerId: userId } : { workerId: userId },
        omit: {
          createdAt: true,
          updatedAt: true,
        },
        include: {
          customer: {
            omit: {
              createdAt: true,
              updatedAt: true,
              password: true,
              avatarPublicId: true,
              phone: true,
              email: true,
            },
          },
          worker: {
            omit: {
              createdAt: true,
              updatedAt: true,
            },
            include: {
              user: {
                omit: {
                  createdAt: true,
                  password: true,
                  updatedAt: true,
                  avatarPublicId: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
          service: {
            omit: {
              createdAt: true,
              updatedAt: true,
              categoryId: true,

            },
          },
        },
      });

      const formatedBookings = bookings.map((booking) => ({
        ...booking,
        bookingDate: formatDate(booking.bookingDate),
        scheduledAt: formatDate(booking.scheduledAt),
      }));

      return formatedBookings;
    });
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

    const scheduledAt = new Date(data.schedule ?? booking.scheduledAt);

    const updateSchdule = await prisma.booking.update({
      where: {
        id: bookId,
      },
      data: {
        scheduledAt,
      },
    });

    const formatedSchdule = {
      ...updateSchdule,
      scheduledAt: formatDate(updateSchdule.scheduledAt),
    };

    return formatedSchdule;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const updateBookingStatus = async (
  bookId: number,
  userId: number,
  data: updateBookStatus,
  role: "CUSTOMER" | "WORKER"
) => {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: bookId },
      });

      if (!booking) {
        throw new Error("Booking not found");
      }

      if (role === "CUSTOMER") {
        if (booking.customerId !== userId) {
          throw new Error("Unauthorized: Not your booking");
        }
        if (data.status !== "CANCELLED") {
          throw new Error("Customer can only cancel booking");
        }
      }

      if (role === "WORKER") {
        if (booking.workerId !== userId) {
          throw new Error("Unauthorized: Not your booking");
        }
        if (!["CONFIRMED", "REJECTED", "COMPLETED"].includes(data.status)) {
          throw new Error(
            "Worker can only confirm, reject, or complete booking"
          );
        }
      }

      const updatedBooking = await tx.booking.update({
        where: { id: bookId },
        data: { status: data.status },
      });

      if (["CANCELLED", "REJECTED"].includes(updatedBooking.status)) {
        const deletedBooking = await tx.booking.delete({
          where: { id: bookId },
        });

        return {
          ...deletedBooking,
          bookingDate: formatDate(deletedBooking.bookingDate),
          scheduledAt: formatDate(deletedBooking.scheduledAt),
          message: `Booking ${updatedBooking.status.toLowerCase()} and deleted successfully`,
        };
      }

      return {
        ...updatedBooking,
        bookingDate: formatDate(updatedBooking.bookingDate),
        scheduledAt: formatDate(updatedBooking.scheduledAt),
      };
    });

    await invalidateCacheByPrefix("bookings");

    return result;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

