import { Role } from "../../generated/prisma";
import {
  CreateBookDTO,
  UpdateBookScheduleDTO,
  updateBookStatus,
} from "../dto/bookingDto";
import { getOrSetCache } from "../libs/cache";
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

    const now = new Date();
    const scheduleDate = new Date(data.schedule);

    if (scheduleDate < now) {
      throw new Error("Schedule must be in the future");
    }

    const bookingDate = new Date(data.bookingDate)
      .toISOString()
      .slice(0, 10)
      .replace("T", " ");
    const scheduledAt = new Date(data.schedule)
      .toISOString()
      .slice(0, 10)
      .replace("T", " ");

    const booking = await prisma.booking.create({
      data: {
        customerId: customerId,
        workerId: data.workerId,
        serviceId: data.serviceId,
        bookingDate,
        scheduledAt,
        notes: data.note,
        status: "PENDING",
      },
    });

    const bookingResponse = {
      ...booking,
      bookingDate: formatDate(booking.bookingDate),
      scheduledAt: formatDate(booking.scheduledAt),
    };

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
    const cache = `bookings:all`;
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
                },
              },
            },
          },
          service: {
            omit: {
              createdAt: true,
              updatedAt: true,
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

    if (!booking || booking.customerId !== userId) {
      throw new Error("Unauthorized to delete this booking");
    }

    if (booking.status !== "PENDING") {
      throw new Error("Only pending booking can be deleted");
    }

    return await prisma.booking.delete({ where: { id: bookId } });
  } catch (error) {
    console.log(error);
    throw error;
  }
};
